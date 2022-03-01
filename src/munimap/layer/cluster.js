/**
 * @module layer/cluster
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_cluster from '../cluster/cluster.js';
import VectorLayer from 'ol/layer/Vector';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {createStore as createClusterStore} from '../source/cluster.js';
import {updateClusteredFeatures} from '../view/cluster.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view/view.js").AddLayersOptions} AddLayersOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").MapProps} MapProps
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'markercluster';

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is layer
 */
const isLayer = (layer) => layer.get('id') === LAYER_ID;

/**
 * @param {ol.Map} map map
 * @return {VectorLayer} layer
 */
const getLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isLayer);
  if (result) {
    munimap_assert.assertInstanceof(result, VectorLayer);
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
  const {lang, labels, targetId} = options.requiredOpts;
  const clusterFeatures = markers.concat();
  const markerClusterSrc = createClusterStore(
    clusterFeatures,
    targetId,
    muAttrs,
    lang
  );

  const markerClusterLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LAYER_ID,
      isFeatureClickable: munimap_cluster.isClickable,
      featureClickHandler: munimap_cluster.featureClickHandler,
      source: markerClusterSrc,
      minResolution: clusterResolution.min,
      renderOrder: null,
    })
  );

  markerClusterLayer.on('prerender', (evt) => {
    const mapProps = /** @type {MapProps}*/ (map.get(MUNIMAP_PROPS_ID));
    const oldRes = mapProps.currentRes;
    const res = evt.frameState.viewState.resolution;

    const oldRange = munimap_cluster.getResolutionRange(oldRes);
    const range = munimap_cluster.getResolutionRange(res);

    if (range !== oldRange) {
      updateClusteredFeatures(targetId, res, labels);
    }

    mapProps.currentRes = res;
  });
  return markerClusterLayer;
};

export {LAYER_ID, create, getLayer, isLayer};
