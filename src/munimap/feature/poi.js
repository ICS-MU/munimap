/**
 * @module feature/poi
 */
import * as actions from '../redux/action.js';
import * as mm_range from '../utils/range.js';
import {FLOOR_RESOLUTION, PoiPurpose} from '../feature/_constants.js';

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
 * @param {IsClickableOptions} options options
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const {feature, resolution} = options;

  if (!mm_range.contains(FLOOR_RESOLUTION, resolution)) {
    const poiType = feature.get('typ');
    return (
      poiType === PoiPurpose.BUILDING_ENTRANCE ||
      poiType === PoiPurpose.BUILDING_COMPLEX_ENTRANCE
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
