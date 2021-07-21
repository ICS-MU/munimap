/**
 * @module view/cluster
 */
import {getClusteredFeatures} from '../cluster/cluster.js';
import {getSource, getSourceFeatures} from '../layer/cluster.js';

/**
 * @typedef {import("ol").Map} ol.Map
 */

/**
 * @param {ol.Map} map map
 * @param {number} resolution resolution
 * @param {boolean} showLabels whether to show labels for MU objects
 */
const updateClusteredFeatures = (map, resolution, showLabels) => {
  if (showLabels === false) {
    return;
  }
  const oldFeatures = getSourceFeatures(map);
  const features = getClusteredFeatures(map, resolution);
  let allFeatures = oldFeatures.concat(features);
  allFeatures = [...new Set(allFeatures)];
  const bucket = {
    'remove': [],
    'add': [],
  };
  allFeatures.forEach((feature) => {
    if (oldFeatures.indexOf(feature) >= 0 && features.indexOf(feature) < 0) {
      bucket['remove'].push(feature);
    } else if (
      oldFeatures.indexOf(feature) < 0 &&
      features.indexOf(feature) >= 0
    ) {
      bucket['add'].push(feature);
    }
  });
  const featuresToRemove = bucket['remove'] || [];
  const featuresToAdd = bucket['add'] || [];

  const source = getSource(map);
  if (featuresToRemove.length > 0) {
    featuresToRemove.forEach((feature) => {
      source.removeFeature(feature);
    });
  }
  if (featuresToAdd.length > 0) {
    source.addFeatures(featuresToAdd);
  }
};

export {updateClusteredFeatures};
