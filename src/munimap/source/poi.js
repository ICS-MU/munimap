/**
 * @module source/poi
 */
import * as mm_utils from '../utils/utils.js';
import EnhancedVectorSource from './vector.js';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid.js';
import {loadActivePois} from '../load/feature/poi.js';
import {setActivePoiStore, setPoiStore} from './constants.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy.js';

/**
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * Create store for pois.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const store = new EnhancedVectorSource();
  setPoiStore(targetId, store);
  return store;
};

/**
 * Create store for active pois.
 * @param {redux.Store} store store
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createActiveStore = (store, targetId) => {
  const poiStore = new EnhancedVectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
    loader: mm_utils.partial(loadActivePois, store),
  });
  setActivePoiStore(targetId, poiStore);
  return poiStore;
};

export {createActiveStore, createStore};
