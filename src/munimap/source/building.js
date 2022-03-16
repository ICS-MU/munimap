/**
 * @module source/building
 */
import * as mm_load from '../load.js';
import * as mm_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {BUILDING_TYPE} from '../feature/_constants.js';
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy';
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid';
import {setBuildingStore} from './_constants.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 */

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
    mm_utils.partial(mm_load.buildingFeaturesForMap, {
      source: buildingStore,
      type: BUILDING_TYPE,
      processor: mm_utils.partial(mm_load.buildingLoadProcessor, targetId),
      callback: callback,
    })
  );
  setBuildingStore(targetId, buildingStore);
  return buildingStore;
};

export {createStore};
