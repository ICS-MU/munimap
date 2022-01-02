/**
 * @module source/identify
 */

import VectorSource from 'ol/source/Vector';

/**
 * @type {VectorSource}
 */
let IDENTIFY_STORE;

/**
 * Create store for identify.
 * @return {VectorSource} store
 */
const createStore = () => {
  IDENTIFY_STORE = new VectorSource();
  return IDENTIFY_STORE;
};

/**
 * Get identify store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return IDENTIFY_STORE;
};

export {createStore, getStore};
