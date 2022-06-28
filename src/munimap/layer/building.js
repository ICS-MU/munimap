/**
 * @module layer/building
 */

import * as mm_assert from '../assert/assert.js';
import * as mm_building from '../feature/building.js';
import VectorLayer from 'ol/layer/Vector.js';
import {BUILDING_LABEL_LAYER_ID, BUILDING_LAYER_ID} from './constants.js';
import {BUILDING_TYPE, COMPLEX_RESOLUTION} from '../feature/constants.js';
import {getBuildingStore} from '../source/constants.js';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol").Map} ol.Map
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === BUILDING_LAYER_ID;
};

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLabelLayer = (layer) => {
  return layer.get('id') === BUILDING_LABEL_LAYER_ID;
};

/**
 * @param {ol.Map} map map
 * @return {VectorLayer|undefined} vector
 */
const getLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isLayer);
  if (result) {
    mm_assert.assert(
      result instanceof VectorLayer,
      'Expected instanceof ol/layer/Vector.'
    );
  }
  return /**@type {VectorLayer|undefined}*/ (result);
};

/**
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const create = (targetId) => {
  return new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: BUILDING_LAYER_ID,
      isFeatureClickable: mm_building.isClickable,
      featureClickHandler: mm_building.featureClickHandler,
      type: BUILDING_TYPE,
      source: getBuildingStore(targetId),
      maxResolution: COMPLEX_RESOLUTION.max,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
};

/**
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const createLabel = (targetId) => {
  return new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: BUILDING_LABEL_LAYER_ID,
      isFeatureClickable: mm_building.isClickable,
      featureClickHandler: mm_building.featureClickHandler,
      type: BUILDING_TYPE,
      source: getBuildingStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      renderOrder: null,
    })
  );
};

export {create, createLabel, getLayer, isLayer, isLabelLayer};
