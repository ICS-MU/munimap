/**
 * @module redux/reducer/cluster
 */
import * as mm_assert from '../../assert/assert.js';
import * as mm_range from '../../utils/range.js';
import * as ol_extent from 'ol/extent.js';
import {DOOR_RESOLUTION, FLOOR_RESOLUTION} from '../../feature/constants.js';
import {Feature} from 'ol';
import {INITIAL_STATE} from '../../conf.js';
import {
  ofFeature as extentOfFeature,
  ofFeatures as extentOfFeatures,
} from '../../utils/extent.js';
import {
  getAnimationDuration,
  getAnimationRequestParams,
} from '../../utils/animation.js';
import {isCustomMarker, isDoor} from '../../feature/utils.js';

/**
 * @typedef {import("../../conf.js").AnimationRequestOptions} AnimationRequestOptions
 * @typedef {import("../../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../../utils/animation.js").ViewOptions} ViewOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("../../feature/feature.js").OnClickResult} OnClickResult
 */

/**
 * @typedef {object} Props
 * @property {Array<ol.Feature>} clusteredFeatures features
 * @property {ol.coordinate.Coordinate} popupCoords coords
 *
 * @typedef {ViewOptions & Props & OnClickResult} GetAnimationRequestOptions
 */

/**
 * @param {GetAnimationRequestOptions} options payload
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (options) => {
  const {
    rotation,
    size,
    extent,
    resolution,
    clusteredFeatures,
    zoomToFeature,
    centerToFeature,
    popupCoords,
  } = options;

  const firstFeature = clusteredFeatures[0];
  mm_assert.assertInstanceof(firstFeature, Feature);
  const resolutionRange = isDoor(firstFeature)
    ? DOOR_RESOLUTION
    : FLOOR_RESOLUTION;

  let animationRequest;
  if (clusteredFeatures.length === 1) {
    let center;
    const isCustom = isCustomMarker(firstFeature);
    const opts = {
      resolution: isCustom && !zoomToFeature ? resolution : resolutionRange.max,
      rotation,
      size,
      extent,
    };

    if (isCustom) {
      if (zoomToFeature) {
        center = ol_extent.getCenter(extentOfFeature(firstFeature));
        animationRequest = getAnimationRequestParams(center, opts);
      } else if (centerToFeature) {
        animationRequest = getAnimationRequestParams(popupCoords, opts);
      }
    } else {
      const isVisible = mm_range.contains(resolutionRange, resolution);
      if (!isVisible) {
        center = ol_extent.getCenter(extentOfFeature(firstFeature));
        animationRequest = getAnimationRequestParams(center, opts);
      }
    }
  } else {
    const featuresExtent = extentOfFeatures(clusteredFeatures);
    animationRequest = /** @type {AnimationRequestOptions}*/ ({
      extent: featuresExtent,
      duration: getAnimationDuration(extent, featuresExtent),
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
