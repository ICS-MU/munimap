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
 * @type {VectorSource}
 */
let POI_STORE;

/**
 * @type {VectorSource}
 */
let ACTIVE_POI_STORE;

/**
 * Create store for pois.
 * @return {VectorSource} store
 */
const createStore = () => {
  POI_STORE = new VectorSource();
  return POI_STORE;
};

/**
 * Create store for active pois.
 * @param {redux.Store} store store
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createActiveStore = (store, callback) => {
  ACTIVE_POI_STORE = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
    loader: munimap_utils.partial(loadActivePois, {store, callback}),
  });
  return ACTIVE_POI_STORE;
};

/**
 * Get poi store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return POI_STORE;
};

/**
 * Get active poi store.
 * @return {VectorSource} store
 */
const getActiveStore = () => {
  return ACTIVE_POI_STORE;
};

export {createActiveStore, createStore, getActiveStore, getStore};
