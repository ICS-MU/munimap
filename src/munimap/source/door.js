/**
 * @module source/room
 */
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {loadActiveDoors} from '../load.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @type {Object<string, VectorSource>}
 */
const DOOR_STORES = {};

/**
 * @type {Object<string, VectorSource>}
 */
const ACTIVE_DOOR_STORES = {};

/**
 * Create store for doors.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  DOOR_STORES[targetId] = new VectorSource();
  return DOOR_STORES[targetId];
};

/**
 * Create store for active doors.
 * @param {redux.Store} store store
 * @param {string} targetId targetId
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createActiveStore = (store, targetId, callback) => {
  const activeStore = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
    loader: munimap_utils.partial(loadActiveDoors, {store, callback}),
  });
  ACTIVE_DOOR_STORES[targetId] = activeStore;
  return activeStore;
};

/**
 * Get door store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return DOOR_STORES[targetId];
};

/**
 * Get active door store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getActiveStore = (targetId) => {
  return ACTIVE_DOOR_STORES[targetId];
};

export {createActiveStore, createStore, getActiveStore, getStore};
