/**
 * @module view/room
 */
import VectorLayer from 'ol/layer/Vector';
import {
  getStyleForActiveRoomLayer,
  getStyleForRoomLabelLayer,
  getStyleForRoomLayer,
} from '../redux/selector.js';
import {isActiveLayer, isDefaultLayer, isLabelLayer} from '../layer/room.js';

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
  const lyr =
    layers.length === 1 ? layers[0] : layers.find((l) => isDefaultLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = getStyleForRoomLayer(state);
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

/**
 * @param {State} state state
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshLabelStyle = (state, layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr =
    layers.length === 1 ? layers[0] : layers.find((l) => isLabelLayer(l));

  if (lyr && lyr instanceof VectorLayer) {
    const style = getStyleForRoomLabelLayer(state);
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

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
    const style = getStyleForActiveRoomLayer(state);
    if (style !== lyr.getStyle()) {
      lyr.setStyle(style);
    }
  }
};

export {refreshStyle, refreshActiveStyle, refreshLabelStyle};
