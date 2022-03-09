/**
 * @module feature/door
 */
import * as actions from '../redux/action.js';
import * as munimap_identify from '../identify/identify.js';
import * as munimap_utils from '../utils/utils.js';
import * as slctr from '../redux/selector.js';
import {getActiveStore as getActiveDoorStore} from '../source/door.js';
import {isAllowed} from '../identify/identify.js';
import {isCode} from './door.constants.js';

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
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {boolean} whether is door
 */
const isDoor = (feature) => {
  const code = feature.get('polohKod');
  return munimap_utils.isString(code) && isCode(/** @type {string}*/ (code));
};

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
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} options payload
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const handleDoorClick = (state, options, asyncDispatch) => {
  const featureUid = options.featureUid;
  const pixelInCoords = options.pixelInCoords;
  const targetId = slctr.getTargetId(state);
  const feature = getActiveDoorStore(targetId).getFeatureByUid(featureUid);
  const isIdentifyAllowed =
    slctr.isIdentifyEnabled(state) &&
    munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

  if (isIdentifyAllowed) {
    munimap_identify.handleCallback(
      slctr.getIdentifyCallback(state),
      asyncDispatch,
      targetId,
      {feature, pixelInCoords}
    );
  }
};

export {featureClickHandler, handleDoorClick, isClickable, isDoor};
