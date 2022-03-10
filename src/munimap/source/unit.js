/**
 * @module source/unit
 */

import VectorSource from 'ol/source/Vector';
import {setUnitStore} from './_constants.js';

/**
 * Create store for units.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setUnitStore(targetId, store);
  return store;
};

export {createStore};
