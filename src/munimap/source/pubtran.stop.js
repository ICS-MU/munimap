/**
 * @module source/pubtran.stop
 */
import * as mm_utils from '../utils/utils.js';
import EnhancedVectorSource from './vector.js';
import {PUBTRAN_TYPE} from '../feature/constants.js';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {pubtranFeaturesForMap} from '../load/feature/pubtran.stop.js';
import {setPubTranStore} from './constants.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * Create store for public transportation stops.
 * @param {string} targetId targetId
 * @return {EnhancedVectorSource} store
 */
const createStore = (targetId) => {
  const pubtranStore = new EnhancedVectorSource({
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
