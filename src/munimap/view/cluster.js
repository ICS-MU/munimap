/**
 * @module view/cluster
 */
import {getClusterVectorStore} from '../source/constants.js';
import {getClusteredFeatures} from '../cluster/cluster.js';

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

export {updateClusteredFeatures};
