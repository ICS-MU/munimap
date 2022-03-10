/**
 * @module source/floor
 */
import VectorSource from 'ol/source/Vector';
import {setFloorStore} from './_constants.js';

/**
 * Create store for complexes.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setFloorStore(targetId, store);
  return store;
};

export {createStore};
