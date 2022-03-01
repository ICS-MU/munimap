/**
 * @module source/complex
 */

import VectorSource from 'ol/source/Vector';

/**
 * @type {Object<string, VectorSource>}
 */
const COMPLEX_STORES = {};

/**
 * Create store for complexes.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  COMPLEX_STORES[targetId] = new VectorSource();
  return COMPLEX_STORES[targetId];
};

/**
 * Get building store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return COMPLEX_STORES[targetId];
};

export {createStore, getStore};
