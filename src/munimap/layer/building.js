/**
 * @module layer/building
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import VectorLayer from 'ol/layer/Vector';
import {RESOLUTION as COMPLEX_RESOLUTION} from '../feature/complex.constants.js';
import {LABEL_LAYER_ID, LAYER_ID} from './building.constants.js';
import {getStore as getBuildingStore} from '../source/building.constants.js';
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
  return layer.get('id') === LAYER_ID;
};

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLabelLayer = (layer) => {
  return layer.get('id') === LABEL_LAYER_ID;
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
      id: LAYER_ID,
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
      id: LABEL_LAYER_ID,
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
