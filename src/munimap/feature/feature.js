/**
 * @module feature/feature
 */
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import turf_booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {Ids as OptPoiIds} from './optpoi.constants.js';
import {Point} from 'ol/geom';
import {REQUIRED_CUSTOM_MARKERS} from '../create.js';
import {featureExtentIntersect} from '../utils/geom.js';
import {
  getByCode as getBuildingByCode,
  getSelectedFloorCode as getSelectedFloorCodeFromBuilding,
  hasInnerGeometry,
  isBuilding,
} from './building.js';
import {
  getType as getBuildingType,
  isCode as isBuildingCode,
} from './building.constants.js';
import {getLayer as getClusterLayer} from '../layer/cluster.js';
import {getDefaultLayer as getDefaultRoomLayer} from '../layer/room.js';
import {getType as getDoorType} from './door.constants.js';
import {getLayer as getMarkerLayer} from '../layer/marker.js';
import {getType as getRoomType} from './room.constants.js';
import {isCustom as isCustomMarker} from './marker.custom.js';
import {isDoor} from './door.js';
import {isCode as isFloorCode} from './floor.constants.js';
import {isCtgUid as isOptPoiCtgUid} from './optpoi.js';
import {isRoom} from './room.js';

/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/pixel").Pixel} ol.pixel.Pixel
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @typedef {Object} FeatureClickHandlerOptions
 * @property {string} featureUid feature uid
 * @property {ol.Coordinate} pixelInCoords feature uid
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
    if (munimap_utils.isDefAndNotNull(intersect)) {
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
        type = getRoomType();
      } else if (isDoor(marker)) {
        type = getDoorType();
      } else {
        type = getBuildingType();
      }
      initMarkersCodes.push(marker.get(type.primaryKey));
    }
  });

  const difference = /**@type {Array}*/ (requiredMarkerIds).filter(
    (markerString) => {
      if (isOptPoiCtgUid(markerString)) {
        return !Object.values(OptPoiIds).includes(markerString.split(':')[1]);
      }

      return munimap_utils.isString(markerString) &&
        !REQUIRED_CUSTOM_MARKERS[markerString]
        ? !initMarkersCodes.includes(markerString)
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

export {
  getSelectedFloorCode,
  getClosestPointToPixel,
  getLocationCodeFromFeature,
  getMainFeatureAtPixel,
  filterInvalidCodes,
};
