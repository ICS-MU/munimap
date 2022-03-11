/**
 * @module layer/complex
 */

import * as munimap_complex from '../feature/complex.js';
import VectorLayer from 'ol/layer/Vector';
import {COMPLEX_LAYER_ID} from './_constants.js';
import {COMPLEX_RESOLUTION, COMPLEX_TYPE} from '../feature/_constants.js';
import {getComplexStore} from '../source/_constants.js';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === COMPLEX_LAYER_ID;
};

/**
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const create = (targetId) => {
  return new VectorLayer(
    /**@type {VectorLayerOptions}*/ ({
      id: COMPLEX_LAYER_ID,
      isFeatureClickable: munimap_complex.isClickable,
      featureClickHandler: munimap_complex.featureClickHandler,
      type: COMPLEX_TYPE,
      source: getComplexStore(targetId),
      minResolution: COMPLEX_RESOLUTION.min,
      maxResolution: COMPLEX_RESOLUTION.max,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
};
export {create, isLayer};
