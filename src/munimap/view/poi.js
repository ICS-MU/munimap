/**
 * @module view/poi
 */
import * as munimap_range from '../utils/range.js';
import * as slctr from '../redux/selector.js';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.js';
import {INITIAL_STATE} from '../conf.js';
import {getActiveStore as getActivePoiStore} from '../source/poi.js';
import {getAnimationRequestParams} from '../utils/animation.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("ol/geom").Point} ol.geom.Point
 */

/**
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} options payload
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (state, options) => {
  const featureUid = options.featureUid;
  const targetId = slctr.getTargetId(state);
  const feature = getActivePoiStore(targetId).getFeatureByUid(featureUid);

  const isVisible = munimap_range.contains(FLOOR_RESOLUTION, state.resolution);
  if (!isVisible) {
    const point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
    const coords = point.getCoordinates();
    const animationRequest = getAnimationRequestParams(coords, {
      resolution: FLOOR_RESOLUTION.max,
      rotation: slctr.getRotation(state),
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
