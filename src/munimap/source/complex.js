/**
 * @module source/complex
 */

import EnhancedVectorSource from './vector.js';
import {setComplexStore} from './constants.js';

/**
 * Create store for complexes.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const store = new EnhancedVectorSource();
  setComplexStore(targetId, store);
  return store;
};

export {createStore};
