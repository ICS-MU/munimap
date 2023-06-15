/**
 * @module layer/room
 */
import * as mm_assert from '../assert/assert.js';
import VectorLayer from 'ol/layer/Vector.js';
import {
  ACTIVE_ROOM_LAYER_ID,
  ROOM_LABEL_LAYER_ID,
  ROOM_LAYER_ID,
} from './constants.js';
import {FLOOR_RESOLUTION, ROOM_TYPE} from '../feature/constants.js';
import {featureClickHandler, isClickable} from '../feature/room.js';
import {getActiveRoomStore, getDefaultRoomStore} from '../source/constants.js';
import {setCorridorStyle} from '../style/room.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is default room layer
 */
const isDefaultLayer = (layer) => layer.get('id') === ROOM_LAYER_ID;

/**
 * @param {ol.Map} map map
 * @return {VectorLayer|undefined} layer
 */
const getDefaultLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isDefaultLayer);
  if (result) {
    mm_assert.assertInstanceof(result, VectorLayer);
  }
  return /** @type {VectorLayer|undefined} */ (result);
};

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is active layer
 */
const isActiveLayer = (layer) => {
  return layer.get('id') === ACTIVE_ROOM_LAYER_ID;
};

/**
 * @param {ol.Map} map map
 * @return {VectorLayer|undefined} layer
 */
const getActiveLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isActiveLayer);
  if (result) {
    mm_assert.assertInstanceof(result, VectorLayer);
  }
  return /** @type {VectorLayer|undefined} */ (result);
};

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is label room layer
 */
const isLabelLayer = (layer) => layer.get('id') === ROOM_LABEL_LAYER_ID;

/**
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const create = (targetId) => {
  const layer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: ROOM_LAYER_ID,
      type: ROOM_TYPE,
      // refreshStyleOnFloorChange: true,
      maxResolution: FLOOR_RESOLUTION.max,
      opacity: 0.4,
      source: getDefaultRoomStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  layer.once('prerender', setCorridorStyle);

  return layer;
};

/**
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const createActive = (targetId) => {
  const layer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: ACTIVE_ROOM_LAYER_ID,
      isFeatureClickable: isClickable,
      featureClickHandler: featureClickHandler,
      type: ROOM_TYPE,
      maxResolution: FLOOR_RESOLUTION.max,
      source: getActiveRoomStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  layer.once('prerender', setCorridorStyle);
  return layer;
};

/**
 * @param {string} targetId targetId
 * @param {boolean} showLocationCodes whether to show only location codes
 * @return {VectorLayer} layer
 */
const createLabel = (targetId, showLocationCodes) => {
  const maxResolution = showLocationCodes ? 0.13 : FLOOR_RESOLUTION.max;
  return new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: ROOM_LABEL_LAYER_ID,
      type: ROOM_TYPE,
      // refreshStyleOnFloorChange: true,
      isFeatureClickable: isClickable,
      featureClickHandler: featureClickHandler,
      maxResolution: maxResolution,
      source: getActiveRoomStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
};

export {
  create,
  createActive,
  createLabel,
  getActiveLayer,
  getDefaultLayer,
  isActiveLayer,
  isDefaultLayer,
  isLabelLayer,
};
