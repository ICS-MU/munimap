/**
 * @module source/unit
 */

import VectorSource from 'ol/source/Vector';

/**
 * @type {VectorSource}
 */
let UNIT_STORE;

/**
 * Create store for units.
 * @return {VectorSource} store
 */
const createStore = () => {
  UNIT_STORE = new VectorSource();
  return UNIT_STORE;
};

/**
 * Get building store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return UNIT_STORE;
};

export {createStore, getStore};
