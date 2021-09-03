/**
 * @module layer/layer
 */

import * as munimap_layer_building from './building.js';
import * as munimap_layer_complex from './complex.js';
import {
  createActive as createActiveRoomLayer,
  createLabel as createRoomLabelLayer,
  create as createRoomLayer,
} from './room.js';

/**
 * @typedef {import("ol/layer/BaseVector").Options} BaseLayerOptions
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 */

/**
 * @typedef {Object} VectorLayerExtendedOptions
 * @property {string} id
 * @property {(options: FeatureClickHandlerOptions) => boolean} [isFeatureClickable]
 * @property {(options: FeatureClickHandlerOptions) => void} [featureClickHandler]
 * @property {boolean} [redrawOnFloorChange]
 *
 * @typedef {BaseLayerOptions & VectorLayerExtendedOptions} VectorLayerOptions
 */

/**
 * @type {string}
 * @const
 */
const CLICK_HANDLER = 'featureClickHandler';

/**
 * @type {string}
 * @const
 */
const IS_CLICKABLE = 'isFeatureClickable';

/**
 * @type {string}
 * @const
 */
const CLEAR_SOURCE = 'clearSourceOnFloorChange';

/**
 * @type {string}
 * @const
 */
const REDRAW = 'redrawOnFloorChange';

/**
 * @type {string}
 * @const
 */
const REFRESH_STYLE = 'refreshStyleOnFloorChange';

/**
 * @type {string}
 * @const
 */
const TYPE = 'type';

/**
 * @param {Array.<ol.layer.Vector>} layers layers
 * @protected
 */
const setDefaultLayersProps = (layers) => {
  // let activeRoomsStore;

  layers.forEach((layer) => {
    const layerId = layer.get('id');

    switch (layerId) {
      // case munimap.door.ACTIVE_LAYER_ID:
      //   var doorsStore = munimap.door.createActiveStore(map);
      //   layer.setSource(doorsStore);
      //   break;
      // case munimap.poi.ACTIVE_LAYER_ID:
      //   var poiStore = munimap.poi.createActiveStore(map);
      //   layer.setSource(poiStore);
      //   break;
      default:
        break;
    }
  });
};

/**
 * @param {string} lang lang
 * @param {boolean} showLabels whether show labels for MU objects
 * @param {boolean} showLocationCodes whether to show only location codes
 *
 * @return {Array.<ol.layer.Vector>} layers
 */
const getDefaultLayers = (lang, showLabels, showLocationCodes) => {
  const result = [];
  const buildings = munimap_layer_building.create();
  const rooms = createRoomLayer();
  const activeRooms = createActiveRoomLayer();
  // const doors = munimap.door.layer.create();
  // const poi = munimap.poi.layer.create();
  const roomLabels = createRoomLabelLayer(showLocationCodes);
  const buildingLabels = munimap_layer_building.createLabel(lang, showLabels);
  result.push(
    buildings,
    rooms,
    activeRooms,
    // doors,
    // poi,
    roomLabels,
    buildingLabels
  );
  if (showLabels === false) {
    return result;
  }
  const complexes = munimap_layer_complex.create();
  result.push(complexes);

  setDefaultLayersProps(result);
  return result;
};

export {
  CLICK_HANDLER,
  IS_CLICKABLE,
  CLEAR_SOURCE,
  REDRAW,
  REFRESH_STYLE,
  TYPE,
  getDefaultLayers,
};
