/**
 * @module view/marker
 */

import * as munimap_range from '../utils/range.js';
import * as ol_extent from 'ol/extent';
import {DOOR_RESOLUTION, FLOOR_RESOLUTION} from '../feature/_constants.js';
import {INITIAL_STATE} from '../conf.js';
import {ofFeature as extentOfFeature} from '../utils/extent.js';
import {getAnimationRequestParams} from '../utils/animation.js';
import {getClosestPointToPixel} from '../feature/feature.js';
import {
  isCustomMarker,
  isDoor,
  isRoom,
} from '../feature/_constants.functions.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("../feature/feature.js").OnClickResult} OnClickResult
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("../utils/animation.js").ViewOptions} ViewOptions
 */

/**
 * @typedef {Object} MarkerAnimRequestParam
 * @property {ol.Feature} feature feature
 * @property {ol.coordinate.Coordinate} popupCoords coords
 * @property {boolean} isIdentifyAllowed whether is identify allowed
 *
 * @typedef {ViewOptions & MarkerAnimRequestParam} MarkerAnimRequestOptions
 */

/**
 * @typedef {Object} AnimationRequestParams
 * @property {ol.coordinate.Coordinate} pixelInCoords pixel
 *
 * @typedef {AnimationRequestParams & OnClickResult & MarkerAnimRequestOptions} AnimationRequestOptions
 */

/**
 * @param {AnimationRequestOptions} options payload
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (options) => {
  const {
    rotation,
    size,
    extent,
    resolution,
    zoomToFeature,
    centerToFeature,
    feature,
    pixelInCoords,
    popupCoords,
    isIdentifyAllowed,
  } = options;

  const resolutionRange = isDoor(feature) ? DOOR_RESOLUTION : FLOOR_RESOLUTION;
  const isVisible = munimap_range.contains(resolutionRange, resolution);
  let animationRequest = null;

  if (!isVisible && !isIdentifyAllowed) {
    let point;
    if (isRoom(feature) || isDoor(feature) || isCustomMarker(feature)) {
      point = ol_extent.getCenter(extentOfFeature(feature));
    } else {
      point = getClosestPointToPixel(feature, pixelInCoords, extent);
    }

    if (zoomToFeature) {
      animationRequest = getAnimationRequestParams(point, {
        resolution: resolutionRange.max,
        rotation,
        size,
        extent,
      });
    }
  }

  if (!animationRequest && (zoomToFeature || centerToFeature)) {
    animationRequest = getAnimationRequestParams(popupCoords, {
      resolution,
      rotation,
      size,
      extent,
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
