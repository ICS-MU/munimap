/**
 * @module source/room
 */
import * as mm_utils from '../utils/utils.js';
import EnhancedVectorSource from './vector.js';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid.js';
import {loadActiveDoors} from '../load/feature/door.js';
import {setActiveDoorStore, setDoorStore} from './constants.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy.js';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * Create store for doors.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const store = new EnhancedVectorSource();
  setDoorStore(targetId, store);
  return store;
};

/**
 * Create store for active doors.
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
    loader: mm_utils.partial(loadActiveDoors, store),
  });
  setActiveDoorStore(targetId, activeStore);
  return activeStore;
};

export {createActiveStore, createStore};
