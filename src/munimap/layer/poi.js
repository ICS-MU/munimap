/**
 * @module layer/poi
 */

import * as munimap_assert from '../assert/assert.js';
import VectorLayer from 'ol/layer/Vector';
import {RESOLUTION, getType} from '../feature/poi.constants.js';
import {featureClickHandler, isClickable} from '../feature/poi.js';
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
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const createActive = (targetId) => {
  const layer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: ACTIVE_LAYER_ID,
      isFeatureClickable: isClickable,
      featureClickHandler: featureClickHandler,
      type: getType(),
      maxResolution: RESOLUTION.max,
      source: getActivePoiStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  return layer;
};

export {ACTIVE_LAYER_ID, createActive, isActiveLayer};
