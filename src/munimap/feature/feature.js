/**
 * @module feature/feature
 */
import * as mm_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import turf_booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {
  BUILDING_TYPE,
  CustomMarkerOnClickAnimationOptions,
  DOOR_TYPE,
  GIS_PURPOSES_WITH_TOOLTIP,
  OptPoiIds,
  PoiPurpose,
  ROOM_TYPE,
  RoomPurposesWithTooltip,
} from './constants.js';
import {Point} from 'ol/geom';
import {REQUIRED_CUSTOM_MARKERS} from '../constants.js';
import {featureExtentIntersect} from '../utils/geom.js';
import {
  getByCode as getBuildingByCode,
  getSelectedFloorCode as getSelectedFloorCodeFromBuilding,
  hasInnerGeometry,
} from './building.js';
import {getLayer as getClusterLayer} from '../layer/cluster.js';
import {getDefaultLayer as getDefaultRoomLayer} from '../layer/room.js';
import {getLayer as getMarkerLayer} from '../layer/marker.js';
import {
  isBuilding,
  isBuildingCode,
  isCustomMarker,
  isDoor,
  isFloorCode,
  isOptPoiCtgUid,
  isRoom,
} from './utils.js';
import {testCodeOrLikeExpr} from '../utils/regex.js';

/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/pixel").Pixel} ol.pixel.Pixel
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("../identify/identify.js").CallbackFunction} CallbackFunction
 */

/**
 * @typedef {Object} FeatureClickHandlerOptions
 * @property {string} featureUid feature uid
 * @property {ol.Coordinate} pixelInCoords feature uid
 * @property {string} [targetId] targetId
 * @property {boolean} [isIdentifyEnabled] isIdentifyEnabled
 * @property {Array<string>} [identifyTypes] identifyTypes
 * @property {CallbackFunction} [identifyCallback] identifyCallback
 */

/**
 * @typedef {Object} IsClickableOptions
 * @property {ol.Feature} feature feature
 * @property {string} [targetId] targetId
 * @property {number} [resolution] resolution
 * @property {string} [selectedFeature] selected feature
 * @property {boolean} [clusterFacultyAbbr] cluster faculty abbreviation
 * @property {boolean} [isIdentifyEnabled] isIdentifyEnabled
 * @property {Array<string>} [identifyTypes] identifyTypes
 */

/**
 * @typedef {Object} TypeOptions
 * @property {string} primaryKey pk
 * @property {string} serviceUrl url
 * @property {ol.source.Vector} [store] store
 * @property {number} layerId layer id
 * @property {string} name name
 */

/**
 * @typedef {Object} FeatureWithLayer
 * @property {ol.Feature} feature feature
 * @property {ol.layer.Vector}  layer vector layer
 */

/**
 * @typedef {Object} SelectedOptions
 * @property {string} targetId targetId
 * @property {string} selectedFeature selected feature
 * @property {Array<string>} activeFloorCodes activeFloorCodes
 */

/**
 * @typedef {function(ol.Map, ol.pixel.Pixel): FeatureWithLayer} getMainFeatureAtPixelFunction
 */

/**
 * @typedef {function(IsClickableOptions): boolean} isClickableFunction
 */

/**
 * @typedef {function(redux.Dispatch, FeatureClickHandlerOptions): void} featureClickHandlerFunction
 */

/**
 * @typedef {Object} OnClickOptions
 * @property {CustomMarkerOnClickAnimationOptions} animation animation
 *
 * @typedef {function(Event): (OnClickOptions|undefined)} OnClickFunction
 */

/**
 * @typedef {Object} OnClickResult
 * @property {boolean} zoomToFeature zoomToFeature
 * @property {boolean} centerToFeature centerToFeature
 */

/**
 * @type {getMainFeatureAtPixelFunction}
 * @param {ol.Map} map map
 * @param {ol.pixel.Pixel} pixel pixel
 * @return {FeatureWithLayer} feature with identified layer
 */
const getMainFeatureAtPixel = (map, pixel) => {
  let mainFeature;
  const featuresWithLayers = [];
  const rooms = getDefaultRoomLayer(map);
  const markerClusterLayer = getClusterLayer(map);
  const markerLayer = getMarkerLayer(map);
  map.forEachFeatureAtPixel(pixel, (feature, layer) => {
    if (layer === rooms) {
      return false;
    }
    if (layer === markerLayer) {
      mainFeature = {
        feature: feature,
        layer: layer,
      };
      return true;
    }
    if (layer === markerClusterLayer) {
      mainFeature = {
        feature: feature,
        layer: layer,
      };
      return true;
    }
    // other than rooms, markers, clusters => bldg, doors, active rooms, pois...
    featuresWithLayers.push({
      feature: feature,
      layer: layer,
    });
  });
  if (!mainFeature && featuresWithLayers.length) {
    mainFeature = featuresWithLayers[0];
  }
  return mainFeature;
};

/**
 * @param {ol.Feature} feature feature
 * @param {ol.Coordinate} pixelCoord coord
 * @param {ol.extent.Extent} extent extent
 * @return {ol.Coordinate} coord
 */
const getClosestPointToPixel = (feature, pixelCoord, extent) => {
  const point = new Feature(new Point(pixelCoord));
  const format = new GeoJSON();
  const turfPoint = /**@type {any}*/ (format.writeFeatureObject(point));
  const turfFeature = /**@type {any}*/ (format.writeFeatureObject(feature));

  if (turf_booleanPointInPolygon(turfPoint, turfFeature)) {
    return pixelCoord;
  } else {
    //e.g. corridor marker out of boundaries
    const intersect = featureExtentIntersect(feature, extent, format);
    let closestPoint;
    if (mm_utils.isDefAndNotNull(intersect)) {
      closestPoint = intersect.getGeometry().getClosestPoint(pixelCoord);
    }
    return closestPoint || null;
  }
};

/**
 * @param {Array<string>} requiredMarkerIds ids
 * @param {Array<ol.Feature>} initMarkers markers
 * @return {Array<string>} result
 */
const filterInvalidCodes = (requiredMarkerIds, initMarkers) => {
  const initMarkersCodes = [];
  let type;
  initMarkers.forEach((marker) => {
    if (!isCustomMarker(marker)) {
      if (isRoom(marker)) {
        type = ROOM_TYPE;
      } else if (isDoor(marker)) {
        type = DOOR_TYPE;
      } else {
        type = BUILDING_TYPE;
      }
      initMarkersCodes.push(marker.get(type.primaryKey));
    }
  });

  const difference = /**@type {Array}*/ (requiredMarkerIds).filter(
    (markerString) => {
      if (isOptPoiCtgUid(markerString)) {
        return !Object.values(OptPoiIds).includes(markerString.split(':')[1]);
      }

      return mm_utils.isString(markerString) &&
        !REQUIRED_CUSTOM_MARKERS[markerString]
        ? (initMarkersCodes.length === 0 ||
            !initMarkersCodes.every((code) =>
              testCodeOrLikeExpr(markerString, code)
            )) &&
            !initMarkersCodes.includes(markerString)
        : false;
    }
  );
  return difference;
};

/**
 * @param {ol.Feature} feature feature
 * @return {string} code
 */
const getLocationCodeFromFeature = (feature) => {
  if (!feature) {
    return;
  }

  let lc;
  if (isBuilding(feature)) {
    lc = feature.get('polohKod') || null;
  } else if (isRoom(feature) || isDoor(feature)) {
    const locCode = /**@type {string}*/ (feature.get('polohKod'));
    lc = locCode.substring(0, 5);
  } else {
    lc = feature.get('polohKodPodlazi') || null;
  }
  return lc;
};

/**
 * @param {SelectedOptions} options options
 * @return {string|undefined} code
 */
const getSelectedFloorCode = (options) => {
  const {selectedFeature, targetId, activeFloorCodes} = options;

  if (!selectedFeature) {
    return;
  } else if (isFloorCode(selectedFeature)) {
    return selectedFeature;
  }

  if (isBuildingCode(selectedFeature)) {
    const building = getBuildingByCode(targetId, selectedFeature);
    if (hasInnerGeometry(building)) {
      const floorCode = activeFloorCodes.find(
        (code) => code.substring(0, 5) === selectedFeature
      );

      if (floorCode) {
        return floorCode;
      } else {
        return getSelectedFloorCodeFromBuilding(targetId, building);
      }
    }
  }
};

/**
 * @param {ol.Feature} feature feature
 * @param {OnClickResult} defaults default values
 * @param {Event} originalEvent event
 * @return {OnClickResult} result
 */
const handleOnClickCallback = (feature, defaults, originalEvent) => {
  const isCustom = isCustomMarker(feature);
  const animationOpts = CustomMarkerOnClickAnimationOptions;
  let {zoomToFeature, centerToFeature} = defaults;
  let animation = animationOpts.ZOOM_TO;

  if (isCustom) {
    const onClick = /** @type {OnClickFunction|undefined} */ (
      feature.get('onClick')
    );
    if (onClick) {
      // get result from onClick function that was set as ol.Feature parameter
      const result = onClick(originalEvent);
      if (result && Object.values(animationOpts).includes(result.animation)) {
        animation = result.animation;
      }
    }

    zoomToFeature = animation === animationOpts.ZOOM_TO;
    centerToFeature =
      animation === animationOpts.ZOOM_TO ||
      animation === animationOpts.CENTER_TO;
  }
  return {centerToFeature, zoomToFeature};
};

/**
 * @param {ol.Feature} feature feature
 * @return {boolean} whether is suitable for tooltip
 */
const isSuitableForTooltip = (feature) => {
  const title = feature.get('typ');
  const purposeTitle = feature.get('ucel_nazev');
  const purposeGis = feature.get('ucel_gis');
  return (
    (!!title && Object.values(PoiPurpose).includes(title)) ||
    (!!purposeTitle &&
      Object.values(RoomPurposesWithTooltip).includes(purposeTitle)) ||
    (!!purposeGis && GIS_PURPOSES_WITH_TOOLTIP.includes(purposeGis))
  );
};

export {
  filterInvalidCodes,
  getClosestPointToPixel,
  getLocationCodeFromFeature,
  getMainFeatureAtPixel,
  getSelectedFloorCode,
  handleOnClickCallback,
  isSuitableForTooltip,
};
