/**
 * @module source/poi
 */
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {loadActivePois} from '../load.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @type {Object<string, VectorSource>}
 */
const POI_STORES = {};

/**
 * @type {Object<string, VectorSource>}
 */
const ACTIVE_POI_STORES = {};

/**
 * Create store for pois.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  POI_STORES[targetId] = new VectorSource();
  return POI_STORES[targetId];
};

/**
 * Create store for active pois.
 * @param {redux.Store} store store
 * @param {string} targetId targetId
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createActiveStore = (store, targetId, callback) => {
  const poiStore = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
    loader: munimap_utils.partial(loadActivePois, {store, callback}),
  });
  ACTIVE_POI_STORES[targetId] = poiStore;
  return poiStore;
};

/**
 * Get poi store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return POI_STORES[targetId];
};

/**
 * Get active poi store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getActiveStore = (targetId) => {
  return ACTIVE_POI_STORES[targetId];
};

export {createActiveStore, createStore, getActiveStore, getStore};
