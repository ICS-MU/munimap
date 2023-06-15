/**
 * @module view/pubtran.stop
 */
import VectorLayer from 'ol/layer/Vector.js';
import {isLayer} from '../layer/pubtran.stop.js';
import {styleFunction} from '../style/pubtran.stop.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshStyle = (layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.find((l) => isLayer(l));

  if (lyr && lyr instanceof VectorLayer && styleFunction !== lyr.getStyle()) {
    lyr.setStyle(styleFunction);
  }
};

export {refreshStyle};
