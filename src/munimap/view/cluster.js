/**
 * @module view/cluster
 */
import * as munimap_utils from '../utils/utils.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {EnhancedClusterSource, clusterCompareFn} from '../source/cluster.js';
import {Point} from 'ol/geom';
import {getCenter} from 'ol/extent';
import {getClusteredFeatures} from '../cluster/cluster.js';
import {getStyleForClusterLayer} from '../redux/selector.js';
import {isLayer} from '../layer/cluster.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("ol/Feature").default} ol.Feature
 */

/**
 * @type {EnhancedClusterSource}
 */
let CLUSTER_STORE;

/**
 * Create store for clusters.
 * @param {Array<ol.Feature>} clusterFeatures features
 * @param {ol.AttributionLike} muAttrs attributions
 * @param {string} lang language
 * @return {EnhancedClusterSource} store
 */
const createStore = (clusterFeatures, muAttrs, lang) => {
  CLUSTER_STORE = new EnhancedClusterSource({
    attributions: muAttrs,
    source: new VectorSource({
      features: clusterFeatures,
    }),
    compareFn: munimap_utils.partial(clusterCompareFn, lang),
    geometryFunction: (feature) => {
      let result = null;
      const geom = feature.getGeometry();
      if (geom instanceof Point) {
        result = geom;
      } else if (geom) {
        result = new Point(getCenter(geom.getExtent()));
      }
      return result;
    },
    distance: 80,
  });
  return CLUSTER_STORE;
};

/**
 * Get cluster source.
 * @return {EnhancedClusterSource} store
 */
const getStore = () => {
  return CLUSTER_STORE;
};

/**
 * Get vector source from cluster. ClusterSource/EnhancedClusterSource has
 * this.source_ where VectorSource and features are stored.
 * @return {VectorSource} store
 */
const getVectorStore = () => {
  return CLUSTER_STORE.getSource();
};

/**
 * @param {ol.Map} map map
 * @param {number} resolution resolution
 * @param {boolean} showLabels whether to show labels for MU objects
 */
const updateClusteredFeatures = (map, resolution, showLabels) => {
  if (showLabels === false) {
    return;
  }
  const source = getVectorStore();
  const oldFeatures = source.getFeatures();
  const features = getClusteredFeatures(resolution);
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

  if (featuresToRemove.length > 0) {
    featuresToRemove.forEach((feature) => {
      source.removeFeature(feature);
    });
  }
  if (featuresToAdd.length > 0) {
    source.addFeatures(featuresToAdd);
  }
};

/**
 * @param {State} state state
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshStyle = (state, layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.length === 1 ? layers[0] : layers.find((l) => isLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    lyr.setStyle(getStyleForClusterLayer(state));
  }
};

export {
  createStore,
  getStore,
  getVectorStore,
  refreshStyle,
  updateClusteredFeatures,
};
