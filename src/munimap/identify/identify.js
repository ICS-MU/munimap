/**
 * @module identify/identify
 */
import {
  IDENTIFIED_FEATURE_PROPERTY_NAME,
  IdentifyTypes,
  LOCATION_CODE_FIELD_NAME,
} from './_constants.js';
import {getIdentifyStore} from '../source/_constants.js';
import {isBuilding, isDoor, isRoom} from '../feature/_constants.functions.js';
import {isDef} from '../utils/utils.js';

/**
 * @typedef {import('ol/coordinate').Coordinate} ol.coordinate.Coordinate
 * @typedef {import('ol').Feature} ol.Feature
 * @typedef {import('ol').Map} ol.Map
 * @typedef {import('ol/pixel').Pixel} ol.pixel.Pixel
 * @typedef {import('ol/layer').Vector} ol.layer.Vector
 */

/**
 * @typedef {Object} FeatureWithLayer
 * @property {ol.Feature} feature feature
 * @property {ol.layer.Vector} layer layer
 */

/**
 * @typedef {Object} Result
 * @property {ol.coordinate.Coordinate} [coordsInMeters] coordsInMeters
 * @property {ol.coordinate.Coordinate} [coordsInDegrees] coordsInDegrees
 * @property {string} [buildingCode] buildingCode
 * @property {string} [roomCode] roomCode
 * @property {string} [doorCode] doorCode
 */

/**
 * @typedef {function(Result): boolean} CallbackFunction
 */

/**
 * @param {ol.Feature} feature feature
 * @param {Array<string>} [opt_identifyTypes] identifyTypes
 * @return {boolean} result
 */
const isAllowed = (feature, opt_identifyTypes) => {
  const types = isDef(opt_identifyTypes)
    ? opt_identifyTypes
    : Object.values(IdentifyTypes);

  return (
    (isBuilding(feature) && types.includes(IdentifyTypes.BUILDING)) ||
    (isRoom(feature) && types.includes(IdentifyTypes.ROOM)) ||
    (isDoor(feature) && types.includes(IdentifyTypes.DOOR))
  );
};

/**
 * @param {ol.Feature} pointFeature feature
 * @return {ol.Feature} identified feature
 */
const getIdentifiedFeature = (pointFeature) => {
  return pointFeature.get(IDENTIFIED_FEATURE_PROPERTY_NAME);
};

/**
 * @param {ol.Feature} pointFeature feature
 * @return {string} location code
 */
const getLocationCode = (pointFeature) => {
  const feature = getIdentifiedFeature(pointFeature);
  return feature && feature.get(LOCATION_CODE_FIELD_NAME);
};

/**
 * @param {string} targetId targetId
 * @param {string} selectedFeature selected feature
 * @return {boolean|undefined} result
 */
const inSameFloorAsSelected = (targetId, selectedFeature) => {
  const features = getIdentifyStore(targetId).getFeatures();
  if (features && features.length > 0) {
    const pointFeature = features[0];
    const code = getLocationCode(pointFeature);
    if (code && code.length > 5) {
      return code.substring(5, 8) === selectedFeature.substring(5, 8);
    }
  }
  return;
};

export {
  getLocationCode,
  getIdentifiedFeature,
  inSameFloorAsSelected,
  isAllowed,
};
