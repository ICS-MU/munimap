/**
 * @module source/room
 */
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {getType as getRoomType} from '../feature/room.js';
import {loadActiveRooms, loadDefaultRooms} from '../load.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @type {Object<string, VectorSource>}
 */
const ROOM_STORES = {};

/**
 * @type {Object<string, VectorSource>}
 */
const DEFAULT_ROOM_STORES = {};

/**
 * @type {Object<string, VectorSource>}
 */
const ACTIVE_ROOM_STORES = {};

/**
 * Create store for rooms.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  ROOM_STORES[targetId] = new VectorSource();
  return ROOM_STORES[targetId];
};

/**
 * Create store for default rooms.
 * @param {string} targetId targetId
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createDefaultStore = (targetId, callback) => {
  const defaultStore = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
  });
  defaultStore.setLoader(
    munimap_utils.partial(loadDefaultRooms, targetId, {
      source: defaultStore,
      type: getRoomType(),
      where: 'vychoziPodlazi = 1',
      callback: callback,
    })
  );
  DEFAULT_ROOM_STORES[targetId] = defaultStore;
  return defaultStore;
};

/**
 * Create store for active rooms.
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
    loader: munimap_utils.partial(loadActiveRooms, {store, callback}),
  });
  ACTIVE_ROOM_STORES[targetId] = activeStore;
  return activeStore;
};

/**
 * Get room store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return ROOM_STORES[targetId];
};

/**
 * Get default room store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getDefaultStore = (targetId) => {
  return DEFAULT_ROOM_STORES[targetId];
};

/**
 * Get active room store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getActiveStore = (targetId) => {
  return ACTIVE_ROOM_STORES[targetId];
};

export {
  createActiveStore,
  createDefaultStore,
  createStore,
  getActiveStore,
  getDefaultStore,
  getStore,
};
