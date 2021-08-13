/**
 * @module view/complex
 */

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {getStyleForComplexLayer} from '../redux/selector.js';
import {isLayer} from '../layer/complex.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 */

/**
 * @type {VectorSource}
 */
let COMPLEX_STORE;

/**
 * Create store for complexes.
 * @return {VectorSource} store
 */
const createStore = () => {
  COMPLEX_STORE = new VectorSource();
  return COMPLEX_STORE;
};

/**
 * Get building store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return COMPLEX_STORE;
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
    lyr.setStyle(getStyleForComplexLayer(state));
  }
};

export {createStore, getStore, refreshStyle};
