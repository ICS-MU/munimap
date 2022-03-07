import * as ol_extent from 'ol/extent';
import * as slctr from '../redux/selector.js';
import {INITIAL_STATE} from '../conf.js';
import {getAnimationDuration} from '../utils/animation.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").AnimationRequestOptions} AnimationRequestOptions
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 */

/**
 * @param {State} state state
 * @param {ol.coordinate.Coordinate} center center
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (state, center) => {
  const buffExt = ol_extent.buffer(
    slctr.getExtent(state),
    state.resolution * 100
  );
  const ext = ol_extent.boundingExtent([center, slctr.getCenter(state)]);
  const duration = getAnimationDuration(
    buffExt,
    ol_extent.boundingExtent([center])
  );
  const size = slctr.getSize(state);
  const extResolution = Math.max(
    ol_extent.getWidth(ext) / size[0],
    ol_extent.getHeight(ext) / size[1]
  );

  const initialAnimationRequest = /**@type {AnimationRequestOptions}*/ (
    INITIAL_STATE.animationRequest[0]
  );
  if (ol_extent.containsCoordinate(buffExt, center)) {
    return [
      {
        ...initialAnimationRequest,
        center,
        duration: duration,
        resolution: 0.59, //zoom 18
      },
    ];
  } else {
    return [
      [
        {
          ...initialAnimationRequest,
          resolution: Math.max(extResolution, 1.19), //zoom 17
          duration: duration / 2,
        },
        {
          ...initialAnimationRequest,
          resolution: 0.59, //zoom 18
          duration: duration / 2,
        },
      ],
      {
        ...initialAnimationRequest,
        center: center,
        duration: duration,
      },
    ];
  }
};

export {getAnimationRequest};
