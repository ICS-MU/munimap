/**
 * @module source/building
 */
import * as munimap_load from '../load.js';
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {getType as getBuildingType} from '../feature/building.js';
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy';
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 */

/**
 * @type {Object<string, VectorSource>}
 */
const BUILDING_STORES = {};

/**
 * Create store for buildings.
 * @param {string} targetId targetId
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createStore = (targetId, callback) => {
  const buildingStore = new VectorSource({
    strategy: ol_loadingstrategy_tile(
      ol_tilegrid_createXYZ({
        tileSize: 512,
      })
    ),
  });
  buildingStore.setLoader(
    munimap_utils.partial(munimap_load.buildingFeaturesForMap, {
      source: buildingStore,
      type: getBuildingType(),
      processor: munimap_utils.partial(
        munimap_load.buildingLoadProcessor,
        targetId
      ),
      callback: callback,
    })
  );
  BUILDING_STORES[targetId] = buildingStore;
  return buildingStore;
};

/**
 * Get building store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return BUILDING_STORES[targetId];
};

export {createStore, getStore};
