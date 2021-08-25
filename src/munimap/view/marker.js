/**
 * @module view/marker
 */
import VectorLayer from 'ol/layer/Vector';
import {getStyleForMarkerLayer} from '../redux/selector.js';
import {isLayer} from '../layer/marker.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 */

/**
 * @param {State} state state
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshStyle = (state, layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.length === 1 ? layers[0] : layers.find((l) => isLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    lyr.setStyle(getStyleForMarkerLayer(state));
  }
};

export {refreshStyle};
