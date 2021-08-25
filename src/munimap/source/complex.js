/**
 * @module source/complex
 */

import VectorSource from 'ol/source/Vector';

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

export {createStore, getStore};
