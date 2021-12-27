/**
 * @module feature/feature
 */
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import turf_booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {Point} from 'ol/geom';
import {featureExtentIntersect} from '../utils/geom.js';
import {getActiveLayer as getActiveDoorLayer} from '../layer/door.js';
import {getLayer as getClusterLayer} from '../layer/cluster.js';
import {getDefaultLayer as getDefaultRoomLayer} from '../layer/room.js';
import {getLayer as getMarkerLayer} from '../layer/marker.js';

/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/pixel").Pixel} ol.pixel.Pixel
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("../utils/animation.js").AnimationRequestOptions} AnimationRequestOptions
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
 * @property {number} [resolution] resolution
 * @property {string} [selectedFeature] selected feature
 * @property {boolean} [clusterFacultyAbbr] cluster faculty abbreviation
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
 * @typedef {function(ol.Map, ol.pixel.Pixel): FeatureWithLayer} getMainFeatureAtPixelFunction
 */

/**
 * @typedef {function(IsClickableOptions): boolean} isClickableFunction
 */

/**
 * @typedef {function(redux.Dispatch, FeatureClickHandlerOptions): void} featureClickHandlerFunction
 */

/**
 * @type {string}
 * @const
 */
const FEATURE_TYPE_PROPERTY_NAME = 'featureType';

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
  const doors = getActiveDoorLayer(map);
  const markerClusterLayer = getClusterLayer(map);
  const markerLayer = getMarkerLayer(map);
  map.forEachFeatureAtPixel(pixel, (feature, layer) => {
    if (layer === doors || layer === rooms) {
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
    // other than doors, rooms, markers, clusters => bldg, active rooms, pois...
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

export {
  FEATURE_TYPE_PROPERTY_NAME,
  getClosestPointToPixel,
  getMainFeatureAtPixel,
};
