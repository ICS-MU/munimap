/**
 * @module view/cluster
 */

import VectorLayer from 'ol/layer/Vector';
import {getClusteredFeatures} from '../cluster/cluster.js';
import {getVectorStore} from '../source/cluster.js';
import {isLayer} from '../layer/cluster.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../redux/selector.js").AllStyleFunctionsResult} AllStyleFunctionsResult
 */

/**
 * @param {number} resolution resolution
 * @param {boolean} showLabels whether to show labels for MU objects
 */
const updateClusteredFeatures = (resolution, showLabels) => {
  if (showLabels === false) {
    return;
  }
  const source = getVectorStore();
  const oldFeatures = source.getFeatures();
  const newFeatures = getClusteredFeatures(resolution);

  const featuresToRemove = oldFeatures.filter((x) => !newFeatures.includes(x));
  const featuresToAdd = newFeatures.filter((x) => !oldFeatures.includes(x));

  featuresToRemove.forEach((feature) => source.removeFeature(feature));
  if (featuresToAdd.length > 0) {
    source.addFeatures(featuresToAdd);
  }
};

/**
 * @param {Array<ol.layer.Base>} layers layers
 * @param {AllStyleFunctionsResult} styles styles
 */
const refreshStyle = (layers, styles) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.length === 1 ? layers[0] : layers.find((l) => isLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = styles.styleForClusterLayer;
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

export {refreshStyle, updateClusteredFeatures};
