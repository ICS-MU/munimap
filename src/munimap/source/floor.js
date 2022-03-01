/**
 * @module source/floor
 */
import VectorSource from 'ol/source/Vector';

/**
 * @type {Object<string, VectorSource>}
 */
const FLOOR_STORES = {};

/**
 * Create store for complexes.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  FLOOR_STORES[targetId] = new VectorSource();
  return FLOOR_STORES[targetId];
};

/**
 * Get building store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return FLOOR_STORES[targetId];
};

export {createStore, getStore};
