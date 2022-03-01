/**
 * @module source/marker
 */
import VectorSource from 'ol/source/Vector';

/**
 * @type {Object<string, VectorSource>}
 */
const MARKER_STORES = {};

/**
 * Create store for markers.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  MARKER_STORES[targetId] = new VectorSource();
  return MARKER_STORES[targetId];
};

/**
 * Get markers source.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return MARKER_STORES[targetId];
};

export {createStore, getStore};
