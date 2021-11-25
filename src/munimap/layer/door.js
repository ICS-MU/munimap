/**
 * @module layer/room
 */
import * as munimap_assert from '../assert/assert.js';
import VectorLayer from 'ol/layer/Vector';
import {
  RESOLUTION as DOOR_RESOLUTION,
  getType as getDoorType,
} from '../feature/door.js';
import {getActiveStore as getActiveDoorStore} from '../source/door.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @type {string}
 * @const
 */
const ACTIVE_LAYER_ID = 'active-door';

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
 * @return {VectorLayer} layer
 */
const createActive = () => {
  const layer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: ACTIVE_LAYER_ID,
      type: getDoorType(),
      maxResolution: DOOR_RESOLUTION.max,
      source: getActiveDoorStore(),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  return layer;
};

export {createActive, getActiveLayer, isActiveLayer};
