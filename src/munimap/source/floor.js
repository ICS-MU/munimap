/**
 * @module source/floor
 */
import EnhancedVectorSource from './vector.js';
import {setFloorStore} from './constants.js';

/**
 * Create store for complexes.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const store = new EnhancedVectorSource();
  setFloorStore(targetId, store);
  return store;
};

export {createStore};
