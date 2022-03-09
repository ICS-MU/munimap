/**
 * @module source/marker
 */
import VectorSource from 'ol/source/Vector';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 */

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

/**
 * @param {string} targetId targetId
 * @param {ol.extent.Extent} extent extent
 * @return {ol.Feature} marker
 */
const getInExtent = (targetId, extent) => {
  const markers = getStore(targetId).getFeatures();
  return markers.find((f) =>
    f.getGeometry() ? f.getGeometry().intersectsExtent(extent) : null
  );
};

export {createStore, getInExtent, getStore};
