/**
 *
 */

/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 */

/**
 * @type {Object<string, ol.source.Vector>}
 */
const DOOR_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const ACTIVE_DOOR_STORES = {};

/**
 * Get door store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getStore = (targetId) => {
  return DOOR_STORES[targetId];
};

/**
 * Get active door store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getActiveStore = (targetId) => {
  return ACTIVE_DOOR_STORES[targetId];
};

/**
 * Set door store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setStore = (targetId, store) => {
  DOOR_STORES[targetId] = store;
};

/**
 * Set active door store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setActiveStore = (targetId, store) => {
  ACTIVE_DOOR_STORES[targetId] = store;
};

export {getActiveStore, getStore, setActiveStore, setStore};
