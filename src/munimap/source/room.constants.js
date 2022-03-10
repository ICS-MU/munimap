/**
 *
 */

/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 */

/**
 * @type {Object<string, ol.source.Vector>}
 */
const ROOM_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const DEFAULT_ROOM_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const ACTIVE_ROOM_STORES = {};

/**
 * Get room store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getStore = (targetId) => {
  return ROOM_STORES[targetId];
};

/**
 * Get default room store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getDefaultStore = (targetId) => {
  return DEFAULT_ROOM_STORES[targetId];
};

/**
 * Get active room store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getActiveStore = (targetId) => {
  return ACTIVE_ROOM_STORES[targetId];
};

/**
 * Set room store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setStore = (targetId, store) => {
  ROOM_STORES[targetId] = store;
};

/**
 * Set default room store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setDefaultStore = (targetId, store) => {
  DEFAULT_ROOM_STORES[targetId] = store;
};

/**
 * Set active room store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setActiveStore = (targetId, store) => {
  ACTIVE_ROOM_STORES[targetId] = store;
};

export {
  getActiveStore,
  getDefaultStore,
  getStore,
  setActiveStore,
  setDefaultStore,
  setStore,
};
