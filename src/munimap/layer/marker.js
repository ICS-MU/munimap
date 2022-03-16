/**
 * @module layer/marker
 */
import * as mm_assert from '../assert/assert.js';
import * as mm_marker from '../feature/marker.js';
import VectorLayer from 'ol/layer/Vector';
import {MARKER_LAYER_ID} from './_constants.js';
import {getMarkerStore} from '../source/_constants.js';
import {getPattern} from '../style/marker.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view/view.js").AddLayersOptions} AddLayersOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === MARKER_LAYER_ID;
};

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
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} lyr
 */
const create = (options) => {
  const {markers, muAttrs, clusterResolution} = options;
  const {targetId} = options.requiredOpts;

  const markerSource = getMarkerStore(targetId);
  markerSource.setAttributions(muAttrs);
  markerSource.addFeatures(markers);

  const markerLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: MARKER_LAYER_ID,
      isFeatureClickable: mm_marker.isClickable,
      featureClickHandler: mm_marker.featureClickHandler,
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

export {create, getLayer, isLayer};
