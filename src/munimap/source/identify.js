/**
 * @module source/identify
 */

import EnhancedVectorSource from './vector.js';
import {setIdentifyStore} from './constants.js';

/**
 * Create store for identify.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const store = new EnhancedVectorSource();
  setIdentifyStore(targetId, store);
  return store;
};

export {createStore};
