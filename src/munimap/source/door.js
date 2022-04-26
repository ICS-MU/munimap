/**
 * @module source/room
 */
import * as mm_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {loadActiveDoors} from '../load.js';
import {setActiveDoorStore, setDoorStore} from './constants.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * Create store for doors.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setDoorStore(targetId, store);
  return store;
};

/**
 * Create store for active doors.
 * @param {redux.Store} store store
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createActiveStore = (store, targetId) => {
  const activeStore = new VectorSource({
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
