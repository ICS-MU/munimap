/**
 * @module view/room
 */
import VectorLayer from 'ol/layer/Vector.js';
import {DOOR_STYLE} from '../style/constants.js';
import {isActiveLayer} from '../layer/door.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 */

/**
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshActiveStyle = (layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.find((l) => isActiveLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = DOOR_STYLE;
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

export {refreshActiveStyle};
