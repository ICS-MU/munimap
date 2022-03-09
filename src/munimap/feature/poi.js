/**
 * @module feature/poi
 */
import * as actions from '../redux/action.js';
import * as munimap_range from '../utils/range.js';
import {FEATURE_TYPE_PROPERTY_NAME} from '../feature/feature.constants.js';
import {RESOLUTION as FLOOR_RESOLUTION} from './floor.constants.js';
import {PURPOSE, getType} from './poi.constants.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("ol/geom").Point} ol.geom.Point
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {boolean} whether is feature poi
 */
const isPoi = (feature) => {
  const type = /**@type {TypeOptions}*/ (
    feature.get(FEATURE_TYPE_PROPERTY_NAME)
  );
  return type === getType();
};

/**
 * @param {IsClickableOptions} options options
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const {feature, resolution} = options;

  if (!munimap_range.contains(FLOOR_RESOLUTION, resolution)) {
    const poiType = feature.get('typ');
    return (
      poiType === PURPOSE.BUILDING_ENTRANCE ||
      poiType === PURPOSE.BUILDING_COMPLEX_ENTRANCE
    );
  }
  return false;
};

/**
 * @param {redux.Dispatch} dispatch dispatch
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (dispatch, options) => {
  dispatch(actions.poiClicked(options));
};

export {isClickable, featureClickHandler};
