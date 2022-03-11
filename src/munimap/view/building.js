/**
 * @module view/building
 */
import * as munimap_identify from '../identify/identify.js';
import * as munimap_range from '../utils/range.js';
import * as slctr from '../redux/selector.js';
import {FLOOR_RESOLUTION} from '../feature/_constants.js';
import {INITIAL_STATE} from '../conf.js';
import {getAnimationRequestParams} from '../utils/animation.js';
import {getBuildingStore} from '../source/_constants.js';
import {getClosestPointToPixel} from '../feature/feature.js';

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
  const extent = slctr.getExtent(state);
  const targetId = slctr.getTargetId(state);
  const feature = getBuildingStore(targetId).getFeatureByUid(featureUid);
  const isVisible = munimap_range.contains(FLOOR_RESOLUTION, state.resolution);
  const isIdentifyAllowed =
    slctr.isIdentifyEnabled(state) &&
    munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

  if (!isVisible && !isIdentifyAllowed) {
    const point = getClosestPointToPixel(feature, pixelInCoords, extent);
    const animationRequest = getAnimationRequestParams(point, {
      resolution: FLOOR_RESOLUTION.max,
      rotation: state.rotation,
      size: slctr.getSize(state),
      extent: slctr.getExtent(state),
    });
    return [
      {
        ...INITIAL_STATE.animationRequest[0],
        ...animationRequest,
      },
    ];
  }
  return null;
};

export {getAnimationRequest};
