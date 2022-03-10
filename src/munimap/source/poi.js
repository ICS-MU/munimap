/**
 * @module source/poi
 */
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {loadActivePois} from '../load.js';
import {setActiveStore, setStore} from './poi.constants.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * Create store for pois.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setStore(targetId, store);
  return store;
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
  setActiveStore(targetId, poiStore);
  return poiStore;
};

export {createActiveStore, createStore};
