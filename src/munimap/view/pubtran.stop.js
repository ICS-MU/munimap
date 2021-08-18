/**
 * @module view/pubtran.stop
 */
import * as munimap_utils from '../utils/utils.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {createXYZ as createTilegridXYZ} from 'ol/tilegrid';
import {getType as getPubtranType} from '../feature/pubtran.stop.js';
import {isLayer} from '../layer/pubtran.stop.js';
import {pubtranFeaturesForMap} from '../load.js';
import {styleFunction} from '../style/pubtran.stop.js';
import {tile as tileLoadingStrategy} from 'ol/loadingstrategy';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

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

/**
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshStyle = (layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.length === 1 ? layers[0] : layers.find((l) => isLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    lyr.setStyle(styleFunction);
  }
};

export {createStore, getStore, refreshStyle};
