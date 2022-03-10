/**
 * @module identify/identify
 */
import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_utils from '../utils/utils.js';
import {Feature} from 'ol';
import {IdentifyTypes} from './_constants.js';
import {Point} from 'ol/geom';
import {getIdentifyStore} from '../source/_constants.js';
import {isBuilding} from '../feature/building.js';
import {isDef} from '../utils/utils.js';
import {isDoor} from '../feature/door.constants.js';
import {isRoom} from '../feature/room.constants.js';
import {transform} from 'ol/proj';

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
 * @typedef {Object} Options
 * @property {ol.Feature} pointFeature point feature
 * @property {ol.Feature} feature identified feature
 */

/**
 * @typedef {Object} HandleCallbackOptions
 * @property {ol.Feature} feature identified feature
 * @property {ol.coordinate.Coordinate} pixelInCoords coords
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
 * @type {string}
 * @const
 */
const IDENTIFIED_FEATURE_PROPERTY_NAME = 'identifiedFeature';

/**
 * @type {string}
 * @const
 */
const LOCATION_CODE_FIELD_NAME = 'polohKod';

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
 * @param {Options} [opt_options] opts
 * @return {Result} result
 */
const createParamForCallback = (opt_options) => {
  if (opt_options) {
    const {pointFeature, feature} = opt_options;
    const locCode = feature.get(LOCATION_CODE_FIELD_NAME);
    const geom = /**@type {Point}*/ (pointFeature.getGeometry());
    const coordsInMeters = geom.getCoordinates();
    const coordsInDegrees = transform(coordsInMeters, 'EPSG:3857', 'EPSG:4326');

    munimap_assert.assertInstanceof(feature, Feature);
    munimap_assert.assertString(locCode);

    return {
      coordsInMeters: coordsInMeters.map(
        (coord) => Math.round(coord * 1000) / 1000
      ),
      coordsInDegrees: coordsInDegrees.map(
        (coord) => Math.round(coord * 100000) / 100000
      ),
      buildingCode:
        isBuilding(feature) || isRoom(feature) || isDoor(feature)
          ? locCode.slice(0, 5)
          : undefined,
      roomCode: isRoom(feature) ? locCode : undefined,
      doorCode: isDoor(feature) ? locCode : undefined,
    };
  }
  return {
    coordsInMeters: undefined,
    coordsInDegrees: undefined,
    buildingCode: undefined,
    roomCode: undefined,
    doorCode: undefined,
  };
};

/**
 * @param {CallbackFunction} callback callback
 * @param {Function} asyncDispatch asyncDispatch
 * @param {string} targetId targetId
 * @param {HandleCallbackOptions} [opt_options] opts
 */
const handleCallback = (callback, asyncDispatch, targetId, opt_options) => {
  if (!callback) {
    return;
  }

  if (opt_options) {
    munimap_assert.assertExists(opt_options.feature);
    munimap_assert.assertExists(opt_options.pixelInCoords);
    const {feature, pixelInCoords} = opt_options;
    const pointFeature = new Feature({
      geometry: new Point(pixelInCoords),
      [IDENTIFIED_FEATURE_PROPERTY_NAME]: feature,
    });
    const params = createParamForCallback({pointFeature, feature});
    const callbackResult = callback(params);

    munimap_assert.assert(
      munimap_utils.isDefAndNotNull(callbackResult) &&
        munimap_utils.isBoolean(callbackResult),
      'Identify callback should return boolean.'
    );

    if (callbackResult) {
      const store = getIdentifyStore(targetId);
      store.once('addfeature', () =>
        asyncDispatch(actions.identifyFeatureChanged())
      );

      store.clear();
      store.addFeature(pointFeature);
    }
  } else {
    const params = createParamForCallback();
    const store = getIdentifyStore(targetId);
    callback(params);

    store.once('clear', () => asyncDispatch(actions.identifyFeatureChanged()));
    store.clear();
  }
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
  handleCallback,
  inSameFloorAsSelected,
  isAllowed,
};
