/**
 * @module source/poi
 */
import * as mm_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {loadActivePois} from '../load.js';
import {setActivePoiStore, setPoiStore} from './_constants.js';
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
  setPoiStore(targetId, store);
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
    loader: mm_utils.partial(loadActivePois, {store, callback}),
  });
  setActivePoiStore(targetId, poiStore);
  return poiStore;
};

export {createActiveStore, createStore};
