/**
 * @module source/floor
 */
import VectorSource from 'ol/source/Vector';

/**
 * @type {VectorSource}
 */
let FLOOR_STORE;

/**
 * Create store for complexes.
 * @return {VectorSource} store
 */
const createStore = () => {
  FLOOR_STORE = new VectorSource();
  return FLOOR_STORE;
};

/**
 * Get building store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return FLOOR_STORE;
};

export {createStore, getStore};
