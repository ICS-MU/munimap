/**
 * @module source/room
 */
import * as mm_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {ROOM_TYPE} from '../feature/_constants.js';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {loadActiveRooms, loadDefaultRooms} from '../load.js';
import {
  setActiveRoomStore,
  setDefaultRoomStore,
  setRoomStore,
} from './_constants.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * Create store for rooms.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setRoomStore(targetId, store);
  return store;
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
    mm_utils.partial(loadDefaultRooms, targetId, {
      source: defaultStore,
      type: ROOM_TYPE,
      where: 'vychoziPodlazi = 1',
      callback: callback,
    })
  );
  setDefaultRoomStore(targetId, defaultStore);
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
    loader: mm_utils.partial(loadActiveRooms, {store, callback}),
  });
  setActiveRoomStore(targetId, activeStore);
  return activeStore;
};

export {createActiveStore, createDefaultStore, createStore};
