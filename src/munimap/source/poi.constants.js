/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 */

/**
 * @type {Object<string, ol.source.Vector>}
 */
const POI_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const ACTIVE_POI_STORES = {};

/**
 * Get poi store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getStore = (targetId) => {
  return POI_STORES[targetId];
};

/**
 * Get active poi store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getActiveStore = (targetId) => {
  return ACTIVE_POI_STORES[targetId];
};

/**
 * Set poi store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setStore = (targetId, store) => {
  POI_STORES[targetId] = store;
};

/**
 * Set active poi store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setActiveStore = (targetId, store) => {
  ACTIVE_POI_STORES[targetId] = store;
};

export {getActiveStore, getStore, setActiveStore, setStore};
