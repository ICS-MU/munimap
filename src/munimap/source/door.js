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
 * @type {VectorSource}
 */
let DOOR_STORE;

/**
 * @type {VectorSource}
 */
let ACTIVE_DOOR_STORE;

/**
 * Create store for doors.
 * @return {VectorSource} store
 */
const createStore = () => {
  DOOR_STORE = new VectorSource();
  return DOOR_STORE;
};

/**
 * Create store for active doors.
 * @param {redux.Store} store store
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createActiveStore = (store, callback) => {
  ACTIVE_DOOR_STORE = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
    loader: munimap_utils.partial(loadActiveDoors, {store, callback}),
  });
  return ACTIVE_DOOR_STORE;
};

/**
 * Get door store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return DOOR_STORE;
};

/**
 * Get active door store.
 * @return {VectorSource} store
 */
const getActiveStore = () => {
  return ACTIVE_DOOR_STORE;
};

export {createActiveStore, createStore, getActiveStore, getStore};
