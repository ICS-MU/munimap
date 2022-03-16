/**
 * @module view/cluster
 */
import * as mm_assert from '../assert/assert.js';
import * as mm_range from '../utils/range.js';
import * as ol_extent from 'ol/extent';
import {DOOR_RESOLUTION, FLOOR_RESOLUTION} from '../feature/_constants.js';
import {Feature} from 'ol';
import {INITIAL_STATE} from '../conf.js';
import {
  ofFeature as extentOfFeature,
  ofFeatures as extentOfFeatures,
} from '../utils/extent.js';
import {
  getAnimationDuration,
  getAnimationRequestParams,
} from '../utils/animation.js';
import {getClusterVectorStore} from '../source/_constants.js';
import {getClusteredFeatures} from '../cluster/cluster.js';
import {isCustomMarker, isDoor} from '../feature/_constants.functions.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../redux/selector.js").AllStyleFunctionsResult} AllStyleFunctionsResult
 * @typedef {import("../conf.js").AnimationRequestOptions} AnimationRequestOptions
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("../utils/animation.js").ViewOptions} ViewOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("../feature/feature.js").OnClickResult} OnClickResult
 */

/**
 * @typedef {Object} Props
 * @property {Array<ol.Feature>} clusteredFeatures features
 * @property {ol.coordinate.Coordinate} popupCoords coords
 *
 * @typedef {ViewOptions & Props & OnClickResult} GetAnimationRequestOptions
 */

/**
 * @param {string} targetId targetId
 * @param {number} resolution resolution
 * @param {boolean} showLabels whether to show labels for MU objects
 */
const updateClusteredFeatures = (targetId, resolution, showLabels) => {
  if (showLabels === false) {
    return;
  }
  const source = getClusterVectorStore(targetId);
  const oldFeatures = source.getFeatures();
  const newFeatures = getClusteredFeatures(targetId, resolution);

  const featuresToRemove = oldFeatures.filter((x) => !newFeatures.includes(x));
  const featuresToAdd = newFeatures.filter((x) => !oldFeatures.includes(x));

  featuresToRemove.forEach((feature) => source.removeFeature(feature));
  if (featuresToAdd.length > 0) {
    source.addFeatures(featuresToAdd);
  }
};

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

export {getAnimationRequest, updateClusteredFeatures};
