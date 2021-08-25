/**
 * @module source/pubtran.stop
 */
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {getType as getPubtranType} from '../feature/pubtran.stop.js';
import {pubtranFeaturesForMap} from '../load.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @type {VectorSource}
 */
let PUBTRAN_STORE;

/**
 * Create store for public transportation stops.
 * @return {VectorSource} store
 */
const createStore = () => {
  PUBTRAN_STORE = new VectorSource({
    strategy: tileLoadingStrategy(
      createTilegridXYZ({
        tileSize: 512,
      })
    ),
  });
  PUBTRAN_STORE.setLoader(
    munimap_utils.partial(pubtranFeaturesForMap, {
      source: PUBTRAN_STORE,
      type: getPubtranType(),
    })
  );
  return PUBTRAN_STORE;
};

/**
 * Get pubtran store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return PUBTRAN_STORE;
};

export {createStore, getStore};
