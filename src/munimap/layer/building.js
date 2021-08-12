/**
 * @module layer/building
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_complex from '../feature/complex.js';
import * as munimap_utils from '../utils/utils.js';
import VectorLayer from 'ol/layer/Vector';
import {getStore as getBuildingStore} from '../view/building.js';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol").Map} ol.Map
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'building';

/**
 * @type {string}
 * @const
 */
const LABEL_LAYER_ID = 'building-label';

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
 * @return {VectorLayer} layer
 */
const create = () => {
  return new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LAYER_ID,
      isFeatureClickable: munimap_building.isClickable,
      featureClickHandler: munimap_building.featureClickHandler,
      type: munimap_building.getType(),
      source: getBuildingStore(),
      maxResolution: munimap_complex.RESOLUTION.max,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
};

/**
 * @param {string} lang language
 * @param {boolean} showLabels wherther to show labels for MU objects
 * @return {VectorLayer} layer
 */
const createLabel = (lang, showLabels) => {
  return new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LABEL_LAYER_ID,
      isFeatureClickable: munimap_building.isClickable,
      featureClickHandler: munimap_building.featureClickHandler,
      type: munimap_building.getType(),
      source: getBuildingStore(),
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      renderOrder: null,
    })
  );
};

export {LAYER_ID, LABEL_LAYER_ID, create, createLabel, isLayer, isLabelLayer};
