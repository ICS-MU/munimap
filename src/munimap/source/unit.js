/**
 * @module source/unit
 */

import EnhancedVectorSource from './vector.js';
import {setUnitStore} from './constants.js';

/**
 * Create store for units.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const store = new EnhancedVectorSource();
  setUnitStore(targetId, store);
  return store;
};

export {createStore};
