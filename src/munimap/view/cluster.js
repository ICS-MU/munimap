/**
 * @module view/cluster
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_range from '../utils/range.js';
import * as ol_extent from 'ol/extent';
import * as slctr from '../redux/selector.js';
import {RESOLUTION as DOOR_RESOLUTION} from '../feature/door.constants.js';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.constants.js';
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
import {getStore as getClusterStore} from '../source/cluster.js';
import {
  getClusteredFeatures,
  getMainFeatures,
  getMinorFeatures,
} from '../cluster/cluster.js';
import {getVectorStore} from '../source/cluster.js';
import {isCustom as isCustomMarker} from '../feature/marker.custom.js';
import {isDoor} from '../feature/door.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../redux/selector.js").AllStyleFunctionsResult} AllStyleFunctionsResult
 * @typedef {import("../conf.js").AnimationRequestOptions} AnimationRequestOptions
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
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
  const source = getVectorStore(targetId);
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
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} options payload
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (state, options) => {
  const featureUid = options.featureUid;
  const targetId = slctr.getTargetId(state);
  const feature = getClusterStore(targetId).getFeatureByUid(featureUid);

  let clusteredFeatures = getMainFeatures(targetId, feature);
  if (state.requiredOpts.clusterFacultyAbbr) {
    const minorFeatures = getMinorFeatures(targetId, feature);
    clusteredFeatures = clusteredFeatures.concat(minorFeatures);
  }

  const firstFeature = clusteredFeatures[0];
  munimap_assert.assertInstanceof(firstFeature, Feature);
  const resolutionRange = isDoor(firstFeature)
    ? DOOR_RESOLUTION
    : FLOOR_RESOLUTION;

  let featuresExtent;
  let animationRequest;
  if (clusteredFeatures.length === 1) {
    let center;
    const opts = {
      resolution: resolutionRange.max,
      rotation: slctr.getRotation(state),
      size: slctr.getSize(state),
      extent: slctr.getExtent(state),
    };

    if (isCustomMarker(firstFeature)) {
      featuresExtent = extentOfFeature(firstFeature);
      center = ol_extent.getCenter(featuresExtent);
      animationRequest = getAnimationRequestParams(center, opts);
    } else {
      const isVisible = munimap_range.contains(
        resolutionRange,
        slctr.getResolution(state)
      );
      if (!isVisible) {
        featuresExtent = extentOfFeature(firstFeature);
        center = ol_extent.getCenter(featuresExtent);
        animationRequest = getAnimationRequestParams(center, opts);
      }
    }
  } else {
    featuresExtent = extentOfFeatures(clusteredFeatures, targetId);
    animationRequest = /** @type {AnimationRequestOptions}*/ ({
      extent: featuresExtent,
      duration: getAnimationDuration(slctr.getExtent(state), featuresExtent),
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
