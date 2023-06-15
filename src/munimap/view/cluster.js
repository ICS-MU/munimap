/**
 * @module view/cluster
 */
import {getClusterStore, getClusterVectorStore} from '../source/constants.js';
import {getClusteredFeatures} from '../feature/cluster.js';

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

  if (featuresToRemove.length === 0 && featuresToAdd.length === 0) {
    getClusterStore(targetId).refresh();
  } else {
    featuresToRemove.forEach((feature) => source.removeFeature(feature));
    if (featuresToAdd.length > 0) {
      source.addFeatures(featuresToAdd);
    }
  }
};

export {updateClusteredFeatures};
