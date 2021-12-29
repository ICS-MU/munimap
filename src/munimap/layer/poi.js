/**
 * @module layer/poi
 */

import * as munimap_assert from '../assert/assert.js';
import VectorLayer from 'ol/layer/Vector';
import {
  RESOLUTION as POI_RESOLUTION,
  featureClickHandler,
  getType as getPoiType,
  isClickable,
} from '../feature/poi.js';
import {getActiveStore as getActivePoiStore} from '../source/poi.js';

/**
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @type {string}
 * @const
 */
const ACTIVE_LAYER_ID = 'active-poi';

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is active layer
 */
const isActiveLayer = function (layer) {
  return layer.get('id') === ACTIVE_LAYER_ID;
};

/**
 * @param {ol.Map} map map
 * @return {VectorLayer|undefined} active layer
 */
const getActiveLayer = function (map) {
  const layers = map.getLayers().getArray();
  const result = layers.find(isActiveLayer);
  if (result) {
    munimap_assert.assertInstanceof(result, VectorLayer);
  }
  return /** @type {VectorLayer|undefined} */ (result);
};

/**
 * @return {VectorLayer} layer
 */
const createActive = () => {
  const layer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: ACTIVE_LAYER_ID,
      isFeatureClickable: isClickable,
      featureClickHandler: featureClickHandler,
      type: getPoiType(),
      maxResolution: POI_RESOLUTION.max,
      source: getActivePoiStore(),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  return layer;
};

export {ACTIVE_LAYER_ID, createActive, isActiveLayer};
