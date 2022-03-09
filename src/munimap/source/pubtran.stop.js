/**
 * @module source/pubtran.stop
 */
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {getType as getPubtranType} from '../feature/pubtran.stop.constants.js';
import {pubtranFeaturesForMap} from '../load.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @type {Object<string, VectorSource>}
 */
const PUBTRAN_STORES = {};

/**
 * Create store for public transportation stops.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const createStore = (targetId) => {
  const pubtranStore = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
  });
  pubtranStore.setLoader(
    munimap_utils.partial(pubtranFeaturesForMap, {
      source: pubtranStore,
      type: getPubtranType(),
    })
  );
  PUBTRAN_STORES[targetId] = pubtranStore;
  return pubtranStore;
};

/**
 * Get pubtran store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return PUBTRAN_STORES[targetId];
};

export {createStore, getStore};
