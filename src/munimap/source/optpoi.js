/**
 * @module source/optpoi
 */

import VectorSource from 'ol/source/Vector';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @type {Object<string, VectorSource>}
 */
const OPT_POI_STORES = {};

/**
 * Create store for opt_pois.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  OPT_POI_STORES[targetId] = new VectorSource();
  return OPT_POI_STORES[targetId];
};

/**
 * Get opt_poi store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return OPT_POI_STORES[targetId];
};

export {createStore, getStore};
