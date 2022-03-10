/**
 * @module layer/layer
 */

import * as munimap_layer_building from './building.js';
import * as munimap_layer_complex from './complex.js';
import {createActive as createActiveDoorLayer} from './door.js';
import {createActive as createActivePoiLayer} from './poi.js';
import {
  createActive as createActiveRoomLayer,
  createLabel as createRoomLabelLayer,
  create as createRoomLayer,
} from './room.js';

/**
 * @typedef {import("ol/layer/BaseVector").Options} BaseLayerOptions
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../feature/feature.js").featureClickHandlerFunction} FeatureClickHandlerFunction
 * @typedef {import("../feature/feature.js").isClickableFunction} IsClickableFunction
 */

/**
 * @typedef {Object} VectorLayerExtendedOptions
 * @property {string} id id
 * @property {IsClickableFunction} [isFeatureClickable] whether is feature clickable
 * @property {FeatureClickHandlerFunction} [featureClickHandler] what to do if user clicked on feature
 *
 * @typedef {BaseLayerOptions & VectorLayerExtendedOptions} VectorLayerOptions
 */

/**
 * @param {string} targetId targetId
 * @param {boolean} showLabels whether show labels for MU objects
 * @param {boolean} showLocationCodes whether to show only location codes
 *
 * @return {Array<ol.layer.Vector>} layers
 */
const getDefaultLayers = (targetId, showLabels, showLocationCodes) => {
  const result = [];
  const buildings = munimap_layer_building.create(targetId);
  const rooms = createRoomLayer(targetId);
  const activeRooms = createActiveRoomLayer(targetId);
  const doors = createActiveDoorLayer(targetId);
  const poi = createActivePoiLayer(targetId);
  const roomLabels = createRoomLabelLayer(targetId, showLocationCodes);
  const buildingLabels = munimap_layer_building.createLabel(targetId);
  result.push(
    buildings,
    rooms,
    activeRooms,
    doors,
    poi,
    roomLabels,
    buildingLabels
  );
  if (showLabels === false) {
    return result;
  }
  const complexes = munimap_layer_complex.create(targetId);
  result.push(complexes);
  return result;
};

export {getDefaultLayers};
