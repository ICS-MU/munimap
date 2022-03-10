/**
 * @module layer/building
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import VectorLayer from 'ol/layer/Vector';
import {BUILDING_LABEL_LAYER_ID, BUILDING_LAYER_ID} from './_constants.js';
import {RESOLUTION as COMPLEX_RESOLUTION} from '../feature/complex.constants.js';
import {getBuildingStore} from '../source/_constants.js';
import {getType} from '../feature/building.constants.js';

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
    munimap_assert.assert(
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
      isFeatureClickable: munimap_building.isClickable,
      featureClickHandler: munimap_building.featureClickHandler,
      type: getType(),
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
      isFeatureClickable: munimap_building.isClickable,
      featureClickHandler: munimap_building.featureClickHandler,
      type: getType(),
      source: getBuildingStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      renderOrder: null,
    })
  );
};

export {create, createLabel, getLayer, isLayer, isLabelLayer};
