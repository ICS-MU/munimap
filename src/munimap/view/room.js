/**
 * @module view/room
 */
import VectorLayer from 'ol/layer/Vector';
import {isActiveLayer, isDefaultLayer, isLabelLayer} from '../layer/room.js';

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
  const lyr = layers.find((l) => isDefaultLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = styles.styleForRoomLayer;
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

/**
 * @param {Array<ol.layer.Base>} layers layers
 * @param {AllStyleFunctionsResult} styles styles
 */
const refreshLabelStyle = (layers, styles) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.find((l) => isLabelLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = styles.styleForRoomLabelLayer;
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

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
    const style = styles.styleForRoomActiveLayer;
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

export {refreshStyle, refreshActiveStyle, refreshLabelStyle};
