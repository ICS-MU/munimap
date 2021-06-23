/**
 * @module layer/building
 */

import * as munimap_building from '../feature/building.js';
import * as munimap_complex from '../feature/complex.js';
import * as munimap_utils from '../utils/utils.js';
import VectorLayer from 'ol/layer/Vector';
import {
  labelFunction,
  selectedFloorFilter,
  selectedFloorFunction,
  styleFunction,
} from '../style/building.js';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @return {VectorLayer} layer
 */
const create = () => {
  const styleFragments = {
    selectedFloorFeature: {
      filter: selectedFloorFilter,
      style: selectedFloorFunction,
    },
    outdoorFeature: {
      filter: () => {
        return true;
      },
      style: styleFunction,
    },
  };

  return new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: munimap_building.LAYER_ID,
      isFeatureClickable: munimap_building.isClickable,
      featureClickHandler: munimap_building.featureClickHandler,
      type: munimap_building.TYPE,
      refreshStyleOnFloorChange: true,
      styleFragments: styleFragments,
      source: munimap_building.STORE,
      maxResolution: munimap_complex.RESOLUTION.max,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
};

/**
 * @param {string} lang language
 * @return {VectorLayer} layer
 */
const createLabel = (lang) => {
  const styleFragments = {
    selectedFloorFeature: {
      filter: selectedFloorFilter,
      style: () => {
        return null;
      },
    },
    outdoorFeature: {
      filter: () => {
        return true;
      },
      style: munimap_utils.partial(labelFunction, lang),
    },
  };

  return new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: munimap_building.LABEL_LAYER_ID,
      isFeatureClickable: munimap_building.isClickable,
      featureClickHandler: munimap_building.featureClickHandler,
      type: munimap_building.TYPE,
      refreshStyleOnFloorChange: true,
      styleFragments: styleFragments,
      source: munimap_building.STORE,
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      renderOrder: null,
    })
  );
};

export {create, createLabel};
