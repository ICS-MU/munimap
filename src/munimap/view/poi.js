/**
 * @module view/poi
 */
import VectorLayer from 'ol/layer/Vector';
import {isActiveLayer} from '../layer/poi.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../redux/selector.js").AllStyleFunctionsResult} AllStyleFunctionsResult
 */

/**
 * @param {Array<ol.layer.Base>} layers layers
 * @param {AllStyleFunctionsResult} styles styles
 */
const refreshActiveStyle = (layers, styles) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.find((l) => isActiveLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = styles.styleForPoiActiveLayer;
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

export {refreshActiveStyle};
