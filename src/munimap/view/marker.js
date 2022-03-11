/**
 * @module view/marker
 */

import * as munimap_identify from '../identify/identify.js';
import * as munimap_range from '../utils/range.js';
import * as ol_extent from 'ol/extent';
import * as slctr from '../redux/selector.js';
import {DOOR_RESOLUTION, FLOOR_RESOLUTION} from '../feature/_constants.js';
import {INITIAL_STATE} from '../conf.js';
import {ofFeature as extentOfFeature} from '../utils/extent.js';
import {getAnimationRequestParams} from '../utils/animation.js';
import {getClosestPointToPixel} from '../feature/feature.js';
import {getMarkerStore} from '../source/_constants.js';
import {
  isCustomMarker,
  isDoor,
  isRoom,
} from '../feature/_constants.functions.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 */

/**
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} options payload
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (state, options) => {
  const featureUid = options.featureUid;
  const pixelInCoords = options.pixelInCoords;
  const targetId = slctr.getTargetId(state);
  const feature = getMarkerStore(targetId).getFeatureByUid(featureUid);
  const resolutionRange = isDoor(feature) ? DOOR_RESOLUTION : FLOOR_RESOLUTION;
  const isVisible = munimap_range.contains(resolutionRange, state.resolution);
  const isIdentifyAllowed =
    slctr.isIdentifyEnabled(state) &&
    munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

  let animationRequest = null;
  if (!isVisible && !isIdentifyAllowed) {
    let point;
    if (isRoom(feature) || isDoor(feature) || isCustomMarker(feature)) {
      point = ol_extent.getCenter(extentOfFeature(feature));
    } else {
      point = getClosestPointToPixel(
        feature,
        pixelInCoords,
        slctr.getExtent(state)
      );
    }
    animationRequest = getAnimationRequestParams(point, {
      resolution: resolutionRange.max,
      rotation: slctr.getRotation(state),
      size: slctr.getSize(state),
      extent: slctr.getExtent(state),
    });
  }

  return [
    {
      ...INITIAL_STATE.animationRequest[0],
      ...animationRequest,
    },
  ];
};

export {getAnimationRequest};
