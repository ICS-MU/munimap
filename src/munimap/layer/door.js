/**
 * @module layer/room
 */
import * as munimap_assert from '../assert/assert.js';
import VectorLayer from 'ol/layer/Vector';
import {ACTIVE_LAYER_ID} from './door.constants.js';
import {
  RESOLUTION as DOOR_RESOLUTION,
  getType,
} from '../feature/door.constants.js';
import {featureClickHandler, isClickable} from '../feature/door.js';
import {getActiveStore as getActiveDoorStore} from '../source/door.constants.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is active layer
 */
const isActiveLayer = (layer) => {
  return layer.get('id') === ACTIVE_LAYER_ID;
};

/**
 * @param {ol.Map} map map
 * @return {VectorLayer|undefined} layer
 */
const getActiveLayer = (map) => {
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
      maxResolution: DOOR_RESOLUTION.max,
      source: getActiveDoorStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  return layer;
};

export {createActive, getActiveLayer, isActiveLayer};
