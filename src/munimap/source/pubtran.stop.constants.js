/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 */

/**
 * @type {Object<string, ol.source.Vector>}
 */
const PUBTRAN_STORES = {};

/**
 * Get pubtran store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getStore = (targetId) => {
  return PUBTRAN_STORES[targetId];
};

/**
 * Set pubtran store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setStore = (targetId, store) => {
  PUBTRAN_STORES[targetId] = store;
};

export {getStore, setStore};
