/**
 * @module source/identify
 */

import VectorSource from 'ol/source/Vector';

/**
 * @type {Object<string, VectorSource>}
 */
const IDENTIFY_STORES = {};

/**
 * Create store for identify.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  IDENTIFY_STORES[targetId] = new VectorSource();
  return IDENTIFY_STORES[targetId];
};

/**
 * Get identify store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return IDENTIFY_STORES[targetId];
};

export {createStore, getStore};
