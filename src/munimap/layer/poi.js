/**
 * @module layer/poi
 */

import VectorLayer from 'ol/layer/Vector.js';
import {ACTIVE_POI_LAYER_ID} from './constants.js';
import {POI_RESOLUTION, POI_TYPE} from '../feature/constants.js';
import {featureClickHandler, isClickable} from '../feature/poi.js';
import {getActivePoiStore} from '../source/constants.js';

/**
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is active layer
 */
const isActiveLayer = function (layer) {
  return layer.get('id') === ACTIVE_POI_LAYER_ID;
};

/**
 * @param {string} targetId targetId
 * @return {VectorLayer} layer
 */
const createActive = (targetId) => {
  const layer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: ACTIVE_POI_LAYER_ID,
      isFeatureClickable: isClickable,
      featureClickHandler: featureClickHandler,
      type: POI_TYPE,
      maxResolution: POI_RESOLUTION.max,
      source: getActivePoiStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
    })
  );
  return layer;
};

export {createActive, isActiveLayer};
