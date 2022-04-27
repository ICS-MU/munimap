/**
 * @module feature/complex
 */

import * as actions from '../redux/action.js';
import * as mm_assert from '../assert/assert.js';
import * as mm_range from '../utils/range.js';
import {
  COMPLEX_RESOLUTION,
  COMPLEX_TYPE,
  COMPLEX_UNITS_FIELD_NAME,
} from './constants.js';
import {getComplexStore} from '../source/constants.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import('./feature.js').TypeOptions} TypeOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @param {string} targetId targetId
 * @param {number} id id
 * @param {Array<ol.Feature>} [opt_features] optional features
 * @return {ol.Feature} building
 */
const getById = (targetId, id, opt_features) => {
  const features = opt_features || getComplexStore(targetId).getFeatures();
  const result = features.find((feature) => {
    const idProperty = COMPLEX_TYPE.primaryKey;
    return feature.get(idProperty) === id;
  });
  return result || null;
};

/**
 * @param {ol.Feature} complex complex
 * @return {number} count
 */
const getBuildingCount = (complex) => {
  const result = complex.get('pocetBudov');
  mm_assert.assertNumber(result);
  return result;
};

/**
 * @param {IsClickableOptions} options opts
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  return mm_range.contains(COMPLEX_RESOLUTION, options.resolution);
};

/**
 * @param {redux.Dispatch} dispatch dispatch
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (dispatch, options) => {
  dispatch(actions.complexClicked(options));
};

/**
 * @param {ol.Feature} complex complex
 * @return {Array<ol.Feature>} units
 */
const getUnits = (complex) => {
  const result = complex.get(COMPLEX_UNITS_FIELD_NAME);
  mm_assert.assert(result === null || result instanceof Array);
  return result;
};

export {isClickable, featureClickHandler, getBuildingCount, getById, getUnits};
