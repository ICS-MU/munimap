/**
 * @module layer/complex
 */

import * as munimap_complex from '../feature/complex.js';
import VectorLayer from 'ol/layer/Vector';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'complex';

/**
 * @return {VectorLayer} layer
 */
const create = () => {
  return new VectorLayer(
    /**@type {VectorLayerOptions}*/ ({
      id: LAYER_ID,
      isFeatureClickable: munimap_complex.isClickable,
      featureClickHandler: munimap_complex.featureClickHandler,
      type: munimap_complex.TYPE,
      source: munimap_complex.STORE,
      minResolution: munimap_complex.RESOLUTION.min,
      maxResolution: munimap_complex.RESOLUTION.max,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
};
export {LAYER_ID, create};
