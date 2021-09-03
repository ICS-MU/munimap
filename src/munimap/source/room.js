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
 * @type {VectorSource}
 */
let ROOM_STORE;

/**
 * @type {VectorSource}
 */
let DEFAULT_ROOM_STORE;

/**
 * @type {VectorSource}
 */
let ACTIVE_ROOM_STORE;

/**
 * Create store for rooms.
 * @return {VectorSource} store
 */
const createStore = () => {
  ROOM_STORE = new VectorSource();
  return ROOM_STORE;
};

/**
 * Create store for default rooms.
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createDefaultStore = (callback) => {
  DEFAULT_ROOM_STORE = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
  });
  DEFAULT_ROOM_STORE.setLoader(
    munimap_utils.partial(loadDefaultRooms, {
      source: ROOM_STORE,
      type: getRoomType(),
      where: 'vychoziPodlazi = 1',
      callback: callback,
    })
  );
  return DEFAULT_ROOM_STORE;
};

/**
 * Create store for active rooms.
 * @param {redux.Store} store store
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createActiveStore = (store, callback) => {
  ACTIVE_ROOM_STORE = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
    loader: munimap_utils.partial(loadActiveRooms, {store, callback}),
  });
  return ACTIVE_ROOM_STORE;
};

/**
 * Get room store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return ROOM_STORE;
};

/**
 * Get default room store.
 * @return {VectorSource} store
 */
const getDefaultStore = () => {
  return DEFAULT_ROOM_STORE;
};

/**
 * Get active room store.
 * @return {VectorSource} store
 */
const getActiveStore = () => {
  return ACTIVE_ROOM_STORE;
};

export {
  createActiveStore,
  createDefaultStore,
  createStore,
  getActiveStore,
  getDefaultStore,
  getStore,
};
