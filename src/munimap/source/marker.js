/**
 * @module source/marker
 */
import VectorSource from 'ol/source/Vector';

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

export {createStore, getStore};
