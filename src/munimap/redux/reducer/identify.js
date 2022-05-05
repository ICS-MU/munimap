/**
 * @module redux/reducer/identify
 */
import * as mm_assert from '../../assert/assert.js';
import * as mm_identify from '../../feature/identify.js';
import * as mm_utils from '../../utils/utils.js';
import * as slctr from '../selector/selector.js';
import {Feature} from 'ol';
import {
  IDENTIFIED_FEATURE_PROPERTY_NAME,
  IDENTIFY_LOCATION_CODE_FIELD_NAME,
} from '../../feature/constants.js';
import {Point} from 'ol/geom';
import {getIdentifyStore} from '../../source/constants.js';
import {isBuilding, isDoor, isRoom} from '../../feature/utils.js';
import {transform} from 'ol/proj';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("../../feature/identify.js").Result} Result
 * @typedef {import("../../feature/identify.js").CallbackFunction} CallbackFunction
 */

/**
 * @typedef {object} IdentifyCallbackOptions
 * @property {ol.Feature} feature feature
 * @property {ol.coordinate.Coordinate} pixelInCoords pixelInCoords
 * @property {State} state state
 * @property {redux.Dispatch} [asyncDispatch] asyncDispatch
 * @property {string} [locationCode] locationCode
 */

/**
 * @typedef {object} Options
 * @property {ol.Feature} pointFeature point feature
 * @property {ol.Feature} feature identified feature
 */

/**
 * @typedef {object} HandleCallbackOptions
 * @property {ol.Feature} feature identified feature
 * @property {ol.coordinate.Coordinate} pixelInCoords coords
 */

/**
 * @param {Options} [opt_options] opts
 * @return {Result} result
 */
const createParamForCallback = (opt_options) => {
  if (opt_options) {
    const {pointFeature, feature} = opt_options;
    const locCode = feature.get(IDENTIFY_LOCATION_CODE_FIELD_NAME);
    const geom = /**@type {Point}*/ (pointFeature.getGeometry());
    const coordsInMeters = geom.getCoordinates();
    const coordsInDegrees = transform(coordsInMeters, 'EPSG:3857', 'EPSG:4326');

    mm_assert.assertInstanceof(feature, Feature);
    mm_assert.assertString(locCode);

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
 * @param {string} targetId targetId
 * @param {HandleCallbackOptions} [opt_options] opts
 */
const handleIdentifyCallback = (callback, targetId, opt_options) => {
  if (!callback) {
    return;
  }

  if (opt_options) {
    mm_assert.assertExists(opt_options.feature);
    mm_assert.assertExists(opt_options.pixelInCoords);
    const {feature, pixelInCoords} = opt_options;
    const pointFeature = new Feature({
      geometry: new Point(pixelInCoords),
      [IDENTIFIED_FEATURE_PROPERTY_NAME]: feature,
    });
    const params = createParamForCallback({pointFeature, feature});
    const callbackResult = callback(params);

    mm_assert.assert(
      mm_utils.isDefAndNotNull(callbackResult) &&
        mm_utils.isBoolean(callbackResult),
      'Identify callback should return boolean.'
    );

    if (callbackResult) {
      const store = getIdentifyStore(targetId);
      store.clear();
      store.addFeature(pointFeature);
    }
  } else {
    const params = createParamForCallback();
    const store = getIdentifyStore(targetId);
    callback(params);
    store.clear();
  }
};

/**
 * @param {IdentifyCallbackOptions} options opts
 * @return {string} identify callback id
 */
const handleIdentifyCallbackByOptions = (options) => {
  const {feature, pixelInCoords, state} = options;
  const targetId = slctr.getTargetId(state);
  const isIdentifyAllowed =
    slctr.isIdentifyEnabled(state) &&
    mm_identify.isAllowed(feature, state.requiredOpts.identifyTypes);
  let result = null;

  if (isIdentifyAllowed) {
    handleIdentifyCallback(slctr.getIdentifyCallback(state), targetId, {
      feature,
      pixelInCoords,
    });
    result = state.requiredOpts.identifyCallbackId;
  }
  return result;
};

export {handleIdentifyCallback, handleIdentifyCallbackByOptions};
