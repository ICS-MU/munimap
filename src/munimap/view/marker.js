/**
 * @module view/marker
 */
import VectorLayer from 'ol/layer/Vector';
import {isLayer} from '../layer/marker.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../redux/selector.js").AllStyleFunctionsResult} AllStyleFunctionsResult
 */

/**
 * @param {Array<ol.layer.Base>} layers layers
 * @param {AllStyleFunctionsResult} styles styles
 */
const refreshStyle = (layers, styles) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.length === 1 ? layers[0] : layers.find((l) => isLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = styles.styleForMarkerLayer;
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

export {refreshStyle};
