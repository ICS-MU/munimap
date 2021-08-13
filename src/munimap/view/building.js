/**
 * @module view/building
 */
import * as munimap_load from '../load.js';
import * as munimap_utils from '../utils/utils.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {getType as getBuildingType} from '../feature/building.js';
import {
  getStyleForBuildingLabelLayer,
  getStyleForBuildingLayer,
} from '../redux/selector.js';
import {isLabelLayer, isLayer} from '../layer/building.js';
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy';
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 */

/**
 * @type {VectorSource}
 */
let BUILDING_STORE;

/**
 * Create store for buildings.
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createStore = (callback) => {
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
 * Get building store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return BUILDING_STORE;
};

/**
 * @param {State} state state
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshStyle = (state, layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.length === 1 ? layers[0] : layers.find((l) => isLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    lyr.setStyle(getStyleForBuildingLayer(state));
  }
};

/**
 * @param {State} state state
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshLabelStyle = (state, layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr =
    layers.length === 1 ? layers[0] : layers.find((l) => isLabelLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    lyr.setStyle(getStyleForBuildingLabelLayer(state));
  }
};

export {createStore, getStore, refreshStyle, refreshLabelStyle};
