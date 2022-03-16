/**
 * @module source/pubtran.stop
 */
import * as mm_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {PUBTRAN_TYPE} from '../feature/_constants.js';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {pubtranFeaturesForMap} from '../load.js';
import {setPubTranStore} from './_constants.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

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
    mm_utils.partial(pubtranFeaturesForMap, {
      source: pubtranStore,
      type: PUBTRAN_TYPE,
    })
  );
  setPubTranStore(targetId, pubtranStore);
  return pubtranStore;
};

export {createStore};
