/**
 * @module source/room
 */
import * as mm_utils from '../utils/utils.js';
import EnhancedVectorSource from './vector.js';
import {ROOM_TYPE} from '../feature/constants.js';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {loadActiveRooms, loadDefaultRooms} from '../load/feature/room.js';
import {
  setActiveRoomStore,
  setDefaultRoomStore,
  setRoomStore,
} from './constants.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * Create store for rooms.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const store = new EnhancedVectorSource();
  setRoomStore(targetId, store);
  return store;
};

/**
 * Create store for default rooms.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createDefaultStore = (targetId) => {
  const defaultStore = new EnhancedVectorSource({
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
    })
  );
  setDefaultRoomStore(targetId, defaultStore);
  return defaultStore;
};

/**
 * Create store for active rooms.
 * @param {redux.Store} store store
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createActiveStore = (store, targetId) => {
  const activeStore = new EnhancedVectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
    loader: mm_utils.partial(loadActiveRooms, store),
  });
  setActiveRoomStore(targetId, activeStore);
  return activeStore;
};

export {createActiveStore, createDefaultStore, createStore};
