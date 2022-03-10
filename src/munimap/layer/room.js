/**
 * @module layer/room
 */
import * as munimap_assert from '../assert/assert.js';
import VectorLayer from 'ol/layer/Vector';
import {
  ACTIVE_LAYER_ID,
  DEFAULT_LAYER_ID,
  LABEL_LAYER_ID,
} from './room.constants.js';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.constants.js';
import {featureClickHandler, isClickable} from '../feature/room.js';
import {
  getActiveStore as getActiveRoomStore,
  getDefaultStore as getDefaultRoomStore,
} from '../source/room.constants.js';
import {getType as getRoomType} from '../feature/room.constants.js';
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
const isDefaultLayer = (layer) => layer.get('id') === DEFAULT_LAYER_ID;

/**
 * @param {ol.Map} map map
 * @return {VectorLayer|undefined} layer
 */
const getDefaultLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isDefaultLayer);
  if (result) {
    munimap_assert.assertInstanceof(result, VectorLayer);
  }
  return /** @type {VectorLayer|undefined} */ (result);
};

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
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is label room layer
 */
const isLabelLayer = (layer) => layer.get('id') === LABEL_LAYER_ID;

/**
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const create = (targetId) => {
  const layer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: DEFAULT_LAYER_ID,
      type: getRoomType(),
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
      id: ACTIVE_LAYER_ID,
      isFeatureClickable: isClickable,
      featureClickHandler: featureClickHandler,
      type: getRoomType(),
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
      id: LABEL_LAYER_ID,
      type: getRoomType(),
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
