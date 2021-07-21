/**
 * @module view/building
 */
import * as munimap_load from '../load.js';
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {getType as getBuildingType} from '../feature/building.js';
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy';
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid';

/**
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 */

/**
 * @type {ol.source.Vector}
 */
let BUILDING_STORE;

const createBuildingStore = (callback) => {
  BUILDING_STORE = new VectorSource({
    strategy: ol_loadingstrategy_tile(
      ol_tilegrid_createXYZ({
        tileSize: 512,
      })
    ),
  });
  BUILDING_STORE.setLoader(
    munimap_utils.partial(munimap_load.buildingFeaturesForMap, {
      source: BUILDING_STORE,
      type: getBuildingType(),
      processor: munimap_load.buildingLoadProcessor,
      callback: callback,
    })
  );
  return BUILDING_STORE;
};

/**
 * Create or get Building source.
 * @return {VectorSource} store
 */
const getBuildingStore = () => {
  return BUILDING_STORE;
};

export {createBuildingStore, getBuildingStore};
