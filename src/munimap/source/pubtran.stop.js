/**
 * @module source/pubtran.stop
 */
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {getType as getPubtranType} from '../feature/pubtran.stop.constants.js';
import {pubtranFeaturesForMap} from '../load.js';
import {setStore} from './pubtran.stop.constants.js';
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
    munimap_utils.partial(pubtranFeaturesForMap, {
      source: pubtranStore,
      type: getPubtranType(),
    })
  );
  setStore(targetId, pubtranStore);
  return pubtranStore;
};

export {createStore};
