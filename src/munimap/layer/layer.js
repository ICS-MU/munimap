/**
 * @module layer/layer
 */

import * as munimap_layer_building from './building.js';
import * as munimap_layer_complex from './complex.js';
import * as munimap_style_complex from '../style/complex.js';
import * as munimap_utils from '../utils/utils.js';

/**
 * @typedef {import("ol/layer/BaseVector").Options} BaseLayerOptions
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../style/style.js").MarkersAwareOptions} MarkersAwareOptions
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 */

/**
 * @typedef {Object} VectorLayerExtendedOptions
 * @property {string} id
 * @property {(options: FeatureClickHandlerOptions) => boolean} isFeatureClickable
 * @property {(options: FeatureClickHandlerOptions) => void} featureClickHandler
 * @property {boolean} [redrawOnFloorChange]
 *
 * @typedef {BaseLayerOptions & VectorLayerExtendedOptions} VectorLayerOptions
 */

/**
 *
 * @typedef {Object} DefaultLayersPropsOptions
 * @property {Array.<ol.layer.Vector>} layers
 * @property {MarkersAwareOptions} markersAwareOptions
 * }}
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
const STYLE_FRAGMENTS = 'styleFragments';

/**
 * @type {string}
 * @const
 */
const TYPE = 'type';

/**
 * @param {ol.Map} map map
 * @param {string} lang lang
 * @param {boolean} showLabels whether show labels for MU objects
 *
 * @return {Array.<ol.layer.Vector>} layers
 */
const getDefaultLayers = (map, lang, showLabels) => {
  const result = [];
  const buildings = munimap_layer_building.create();
  // const rooms = munimap.room.layer.create();
  // const activeRooms = munimap.room.layer.createActive();
  // const doors = munimap.door.layer.create();
  // const poi = munimap.poi.layer.create();
  // const roomLabels = munimap.room.layer.createLabel(map);
  const buildingLabels = munimap_layer_building.createLabel(lang, showLabels);
  result.push(
    buildings,
    // rooms,
    // activeRooms,
    // doors,
    // poi,
    // roomLabels,
    buildingLabels
  );
  if (showLabels === false) {
    return result;
  }
  const complexes = munimap_layer_complex.create();
  result.push(complexes);
  return result;
};

/**
 * @param {DefaultLayersPropsOptions} options opts
 * @protected
 */
const setDefaultLayersProps = (options) => {
  const layers = options.layers;
  const markersAwareOpts = options.markersAwareOptions;
  const map = markersAwareOpts.map || null;

  // let activeRoomsStore;

  layers.forEach((layer) => {
    const layerId = layer.get('id');

    switch (layerId) {
      case munimap_layer_complex.LAYER_ID:
        layer.setStyle(
          munimap_utils.partial(
            munimap_style_complex.styleFunction,
            markersAwareOpts
          )
        );
        break;
      case munimap_layer_building.LAYER_ID:
        break;
      // case munimap.room.DEFAULT_LAYER_ID:
      //   layer.once('precompose', munimap.room.style.setCorridorStyle);
      //   break;
      // case munimap.room.ACTIVE_LAYER_ID:
      //   if (!activeRoomsStore) {
      //     activeRoomsStore = munimap.room.createActiveStore(map);
      //   }
      //   layer.setSource(activeRoomsStore);
      //   layer.once('precompose', munimap.room.style.setCorridorStyle);
      //   break;
      // case munimap.room.label.LAYER_ID:
      //   if (!activeRoomsStore) {
      //     activeRoomsStore = munimap.room.createActiveStore(map);
      //   }
      //   layer.setSource(activeRoomsStore);
      //   break;
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

export {
  CLICK_HANDLER,
  IS_CLICKABLE,
  CLEAR_SOURCE,
  REDRAW,
  REFRESH_STYLE,
  STYLE_FRAGMENTS,
  TYPE,
  getDefaultLayers,
  setDefaultLayersProps,
};
