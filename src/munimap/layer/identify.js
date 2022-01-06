/**
 * @module layer/identify
 */

import * as munimap_assert from '../assert/assert.js';
import VectorLayer from 'ol/layer/Vector';
import {getStore as getIdentifyStore} from '../source/identify.js';

/**
 * @typedef {import('ol').Map} ol.Map
 * @typedef {import('ol').Feature} ol.Feature
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'identify-layer';

/**
 * @param {VectorLayer} layer layer
 * @return {boolean} whether is layer
 */
const isLayer = (layer) => {
  return layer.get('id') === LAYER_ID;
};

/**
 * @param {ol.Map} map map
 * @return {VectorLayer|undefined} layer
 */
const getLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isLayer);
  if (result) {
    munimap_assert.assert(
      result instanceof VectorLayer,
      'Expected instanceof ol/layer/Vector.'
    );
  }
  return /**@type {VectorLayer|undefined}*/ (result);
};

/**
 * Create layer.
 * @return {VectorLayer} layer
 */
const createLayer = () => {
  const identifyLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LAYER_ID,
      source: getIdentifyStore(),
      visible: false,
      renderOrder: null,
    })
  );
  return identifyLayer;
};

/**
 * @param {ol.Map} map nap
 * @param {boolean} visible visible
 */
const refreshVisibility = (map, visible) => {
  if (!map) {
    return;
  }
  const layer = getLayer(map);
  if (layer && layer.getVisible() !== visible) {
    layer.setVisible(visible);
  }
};

export {LAYER_ID, createLayer, getLayer, refreshVisibility};
