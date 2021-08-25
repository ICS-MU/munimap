/**
 * @module view/building
 */
import VectorLayer from 'ol/layer/Vector';
import {
  getStyleForBuildingLabelLayer,
  getStyleForBuildingLayer,
} from '../redux/selector.js';
import {isLabelLayer, isLayer} from '../layer/building.js';

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
    lyr.setStyle(getStyleForBuildingLayer(state));
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
    lyr.setStyle(getStyleForBuildingLabelLayer(state));
  }
};

export {refreshStyle, refreshLabelStyle};
