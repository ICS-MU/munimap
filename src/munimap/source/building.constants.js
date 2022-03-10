/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 */

/**
 * @type {Object<string, ol.source.Vector>}
 */
const BUILDING_STORES = {};

/**
 * Get building store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getStore = (targetId) => {
  return BUILDING_STORES[targetId];
};

/**
 * Set building store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setStore = (targetId, store) => {
  BUILDING_STORES[targetId] = store;
};

export {getStore, setStore};
