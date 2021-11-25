/**
 * @module layer/marker
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_marker from '../feature/marker.js';
import VectorLayer from 'ol/layer/Vector';
import {getPattern} from '../style/marker.js';
import {getStore} from '../source/marker.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view/view.js").AddLayersOptions} AddLayersOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'marker';

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === LAYER_ID;
};

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
 * @return {VectorLayer} lyr
 */
const create = (map, options) => {
  const {markers, muAttrs, clusterResolution} = options;

  const markerSource = getStore();
  markerSource.setAttributions(muAttrs);
  markerSource.addFeatures(markers);

  const markerLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LAYER_ID,
      isFeatureClickable: munimap_marker.isClickable,
      featureClickHandler: munimap_marker.featureClickHandler,
      source: markerSource,
      maxResolution: clusterResolution.min,
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      renderOrder: null,
    })
  );
  markerLayer.once('prerender', getPattern);

  return markerLayer;
};

export {LAYER_ID, create, getLayer, isLayer};
