/**
 * @module source/optpoi
 */

import VectorSource from 'ol/source/Vector';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @type {VectorSource}
 */
let OPT_POI_STORE;

/**
 * Create store for opt_pois.
 * @return {VectorSource} store
 */
const createStore = () => {
  OPT_POI_STORE = new VectorSource();
  return OPT_POI_STORE;
};

/**
 * Get opt_poi store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return OPT_POI_STORE;
};

export {createStore, getStore};
