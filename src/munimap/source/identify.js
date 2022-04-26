/**
 * @module source/identify
 */

import VectorSource from 'ol/source/Vector';
import {setIdentifyStore} from './constants.js';

/**
 * Create store for identify.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const store = new VectorSource();
  setIdentifyStore(targetId, store);
  return store;
};

export {createStore};
