/**
 * @module source/optpoi
 */

import EnhancedVectorSource from './vector.js';
import {setOptPoiStore} from './constants.js';

/**
 * Create store for opt_pois.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const store = new EnhancedVectorSource();
  setOptPoiStore(targetId, store);
  return store;
};

export {createStore};
