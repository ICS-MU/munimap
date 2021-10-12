/**
 * @module view/room
 */
import VectorLayer from 'ol/layer/Vector';
import {STYLE} from '../style/door.js';
import {isActiveLayer} from '../layer/door.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 */

/**
 * @param {State} state state
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshActiveStyle = (state, layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr =
    layers.length === 1 ? layers[0] : layers.find((l) => isActiveLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = STYLE;
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

export {refreshActiveStyle};
