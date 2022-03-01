/**
 * @module source/unit
 */

import VectorSource from 'ol/source/Vector';

/**
 * @type {Object<string, VectorSource>}
 */
const UNIT_STORES = {};

/**
 * Create store for units.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  UNIT_STORES[targetId] = new VectorSource();
  return UNIT_STORES[targetId];
};

/**
 * Get building store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return UNIT_STORES[targetId];
};

export {createStore, getStore};
