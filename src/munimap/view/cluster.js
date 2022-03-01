/**
 * @module view/cluster
 */

import {getClusteredFeatures} from '../cluster/cluster.js';
import {getVectorStore} from '../source/cluster.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../redux/selector.js").AllStyleFunctionsResult} AllStyleFunctionsResult
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

export {updateClusteredFeatures};
