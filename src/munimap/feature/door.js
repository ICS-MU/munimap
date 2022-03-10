/**
 * @module feature/door
 */
import * as actions from '../redux/action.js';
import * as munimap_identify from '../identify/identify.js';
import {getActiveStore as getActiveDoorStore} from '../source/door.constants.js';
import {isAllowed} from '../identify/identify.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @param {IsClickableOptions} options options
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const {feature, isIdentifyEnabled, identifyTypes} = options;
  if (isIdentifyEnabled && isAllowed(feature, identifyTypes)) {
    return true;
  }
  return false;
};

/**
 * @param {redux.Dispatch} dispatch dispatch
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (dispatch, options) => {
  dispatch(actions.doorClicked(options));
};

/**
 * @param {FeatureClickHandlerOptions} options payload
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const handleDoorClick = (options, asyncDispatch) => {
  const {
    featureUid,
    pixelInCoords,
    targetId,
    isIdentifyEnabled,
    identifyCallback,
    identifyTypes,
  } = options;
  const feature = getActiveDoorStore(targetId).getFeatureByUid(featureUid);
  const isIdentifyAllowed =
    isIdentifyEnabled && munimap_identify.isAllowed(feature, identifyTypes);

  if (isIdentifyAllowed) {
    munimap_identify.handleCallback(identifyCallback, asyncDispatch, targetId, {
      feature,
      pixelInCoords,
    });
  }
};

export {featureClickHandler, handleDoorClick, isClickable};
