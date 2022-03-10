/**
 * @module source/marker
 */
import VectorSource from 'ol/source/Vector';
import {getMarkerStore, setMarkerStore} from './_constants.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 */

/**
 * Create store for markers.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setMarkerStore(targetId, store);
  return store;
};

/**
 * @param {string} targetId targetId
 * @param {ol.extent.Extent} extent extent
 * @return {ol.Feature} marker
 */
const getInExtent = (targetId, extent) => {
  const markers = getMarkerStore(targetId).getFeatures();
  return markers.find((f) =>
    f.getGeometry() ? f.getGeometry().intersectsExtent(extent) : null
  );
};

export {createStore, getInExtent};
