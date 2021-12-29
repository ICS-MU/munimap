/**
 * @module layer/room
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_floor from '../feature/floor.js';
import VectorLayer from 'ol/layer/Vector';
import {
  featureClickHandler,
  getType as getRoomType,
  isClickable,
} from '../feature/room.js';
import {
  getActiveStore as getActiveRoomStore,
  getDefaultStore as getDefaultRoomStore,
} from '../source/room.js';
import {setCorridorStyle} from '../style/room.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @type {string}
 * @const
 */
const DEFAULT_LAYER_ID = 'room';

/**
 * @type {string}
 * @const
 */
const ACTIVE_LAYER_ID = 'active-room';

/**
 * @type {string}
 * @const
 */
const LABEL_LAYER_ID = 'roomlabel';

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
 * @return {VectorLayer} layer
 */
const create = () => {
  const layer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: DEFAULT_LAYER_ID,
      type: getRoomType(),
      // refreshStyleOnFloorChange: true,
      maxResolution: munimap_floor.RESOLUTION.max,
      opacity: 0.4,
      source: getDefaultRoomStore(),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  layer.once('prerender', setCorridorStyle);

  return layer;
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
      type: getRoomType(),
      maxResolution: munimap_floor.RESOLUTION.max,
      source: getActiveRoomStore(),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  layer.once('prerender', setCorridorStyle);
  return layer;
};

/**
 * @param {boolean} showLocationCodes whether to show only location codes
 * @return {VectorLayer} layer
 */
const createLabel = (showLocationCodes) => {
  const maxResolution = showLocationCodes ? 0.13 : munimap_floor.RESOLUTION.max;
  return new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LABEL_LAYER_ID,
      type: getRoomType(),
      // refreshStyleOnFloorChange: true,
      maxResolution: maxResolution,
      source: getActiveRoomStore(),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
};

export {
  ACTIVE_LAYER_ID,
  DEFAULT_LAYER_ID,
  LABEL_LAYER_ID,
  create,
  createActive,
  createLabel,
  getDefaultLayer,
  isActiveLayer,
  isDefaultLayer,
  isLabelLayer,
};
