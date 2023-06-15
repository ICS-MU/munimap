/**
 * @module
 */

import * as mm_identify from '../../feature/identify.js';
import * as mm_srcs from '../../source/constants.js';
import * as mm_utils from '../../utils/utils.js';
import * as ss from './simple.js';
import {IDENTIFY_CALLBACK_STORE} from '../../constants.js';
import {createSelector} from './reselect.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("../../feature/identify.js").CallbackFunction} IdentifyCallbackFunction
 */

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(string): boolean
 * >}
 */
const isIdentifyEnabled = createSelector(
  [ss.getRequiredIdentifyCallbackId],
  (identifyCallbackId) => {
    return !!identifyCallbackId;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(number): boolean
 * >}
 */
const isIdentifyControlEnabled = createSelector(
  [ss.getIdentifyTimestamp, ss.getTargetId],
  (identifyTimestamp, targetId) => {
    if (!mm_utils.isDefAndNotNull(identifyTimestamp)) {
      return false;
    }
    const features = mm_srcs.getIdentifyStore(targetId).getFeatures();
    return Array.isArray(features) ? features.length > 0 : !!features;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(boolean, number, string): boolean
 * >}
 */
const isIdentifyLayerVisible = createSelector(
  [
    isIdentifyEnabled,
    ss.getIdentifyTimestamp,
    ss.getSelectedFeature,
    ss.getTargetId,
  ],
  (identifyEnabled, identifyTimestamp, selectedFeature, targetId) => {
    if (!mm_utils.isDefAndNotNull(identifyTimestamp) || !identifyEnabled) {
      return false;
    }
    const inSameFloor = mm_identify.inSameFloorAsSelected(
      targetId,
      selectedFeature
    );
    return mm_utils.isDefAndNotNull(inSameFloor) ? inSameFloor : true;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    IdentifyCallbackFunction,
 *    function(string): IdentifyCallbackFunction
 * >}
 */
const getIdentifyCallback = createSelector(
  [ss.getRequiredIdentifyCallbackId],
  (identifyCallbackId) => {
    if (!identifyCallbackId) {
      return null;
    }
    return IDENTIFY_CALLBACK_STORE[identifyCallbackId];
  }
);

export {
  getIdentifyCallback,
  isIdentifyControlEnabled,
  isIdentifyLayerVisible,
  isIdentifyEnabled,
};
