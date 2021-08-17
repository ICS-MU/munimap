/**
 * @module view/marker
 */
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {getStyleForMarkerLayer} from '../redux/selector.js';
import {isLayer} from '../layer/marker.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 */

/**
 * @type {VectorSource}
 */
let MARKER_STORE;

/**
 * Create store for markers.
 * @return {VectorSource} store
 */
const createStore = () => {
  MARKER_STORE = new VectorSource();
  return MARKER_STORE;
};

/**
 * Get markers source.
 * @return {VectorSource} store
 */
const getStore = () => {
  return MARKER_STORE;
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
    lyr.setStyle(getStyleForMarkerLayer(state));
  }
};

export {createStore, getStore, refreshStyle};
