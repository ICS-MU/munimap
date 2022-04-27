/**
 * @module layer/cluster
 */
import * as mm_assert from '../assert/assert.js';
import * as mm_cluster from '../feature/cluster.js';
import VectorLayer from 'ol/layer/Vector';
import {CLUSTER_LAYER_ID} from './constants.js';
import {MUNIMAP_PROPS_ID} from '../constants.js';
import {createStore as createClusterStore} from '../source/cluster.js';
import {updateClusteredFeatures} from '../view/cluster.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view/view.js").AddLayersOptions} AddLayersOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../constants.js").MapProps} MapProps
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is layer
 */
const isLayer = (layer) => layer.get('id') === CLUSTER_LAYER_ID;

/**
 * @param {ol.Map} map map
 * @return {VectorLayer} layer
 */
const getLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isLayer);
  if (result) {
    mm_assert.assertInstanceof(result, VectorLayer);
  }
  return /** @type {VectorLayer|undefined} */ (result);
};

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} marker cluster layer
 */
const create = (map, options) => {
  const {markers, muAttrs, clusterResolution} = options;
  const {lang, labels, targetId, cluster} = options.requiredOpts;
  const clusterFeatures = markers.concat();
  const markerClusterSrc = createClusterStore(clusterFeatures, {
    targetId,
    muAttrs,
    lang,
    distance: cluster && cluster.distance,
  });

  const markerClusterLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: CLUSTER_LAYER_ID,
      isFeatureClickable: mm_cluster.isClickable,
      featureClickHandler: mm_cluster.featureClickHandler,
      source: markerClusterSrc,
      minResolution: clusterResolution.min,
      renderOrder: null,
    })
  );

  markerClusterLayer.on('prerender', (evt) => {
    const mapProps = /** @type {MapProps}*/ (map.get(MUNIMAP_PROPS_ID));
    const oldRes = mapProps.currentRes;
    const res = evt.frameState.viewState.resolution;

    const oldRange = mm_cluster.getResolutionRange(oldRes);
    const range = mm_cluster.getResolutionRange(res);

    if (range !== oldRange) {
      updateClusteredFeatures(targetId, res, labels);
    }

    mapProps.currentRes = res;
  });
  return markerClusterLayer;
};

export {create, getLayer, isLayer};
