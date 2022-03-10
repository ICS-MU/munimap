/**
 * @module source/complex
 */

import VectorSource from 'ol/source/Vector';
import {setComplexStore} from './_constants.js';

/**
 * Create store for complexes.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setComplexStore(targetId, store);
  return store;
};

export {createStore};
