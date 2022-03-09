/**
 * @module layer/complex
 */

import * as munimap_complex from '../feature/complex.js';
import VectorLayer from 'ol/layer/Vector';
import {RESOLUTION as COMPLEX_RESOLUTION} from '../feature/complex.constants.js';
import {getStore as getComplexStore} from '../source/complex.js';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'complex';

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === LAYER_ID;
};

/**
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const create = (targetId) => {
  return new VectorLayer(
    /**@type {VectorLayerOptions}*/ ({
      id: LAYER_ID,
      isFeatureClickable: munimap_complex.isClickable,
      featureClickHandler: munimap_complex.featureClickHandler,
      type: munimap_complex.getType(),
      source: getComplexStore(targetId),
      minResolution: COMPLEX_RESOLUTION.min,
      maxResolution: COMPLEX_RESOLUTION.max,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
};
export {LAYER_ID, create, isLayer};
