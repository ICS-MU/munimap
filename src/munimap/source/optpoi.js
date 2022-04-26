/**
 * @module source/optpoi
 */

import VectorSource from 'ol/source/Vector';
import {setOptPoiStore} from './constants.js';

/**
 * Create store for opt_pois.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setOptPoiStore(targetId, store);
  return store;
};

export {createStore};
