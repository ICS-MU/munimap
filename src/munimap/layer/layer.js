/**
 * @module layer
 */

import * as munimap_building from '../feature/building.js';
import * as munimap_buildingLayer from './building.js';
import * as munimap_style from '../style/style.js';

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
 *
 * @return {Array.<ol.layer.Vector>} layers
 */
const getDefaultLayers = (map, lang) => {
  const result = [];
  const buildings = munimap_buildingLayer.create();
  // const rooms = munimap.room.layer.create();
  // const activeRooms = munimap.room.layer.createActive();
  // const doors = munimap.door.layer.create();
  // const poi = munimap.poi.layer.create();
  // const roomLabels = munimap.room.layer.createLabel(map);
  const buildingLabels = munimap_buildingLayer.createLabel(lang);
  result.push(
    buildings,
    // rooms,
    // activeRooms,
    // doors,
    // poi,
    // roomLabels,
    buildingLabels
  );
  // if (munimap_utils.isDefAndNotNull(munimap.getProps(map).options.labels) &&
  //   !munimap.getProps(map).options.labels) {
  //   return result;
  // }
  // const complexes = munimap.complex.layer.create();
  // result.push(complexes);
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
  // const markerSource = markersAwareOpts.markerSource;

  // let activeRoomsStore;

  layers.forEach((layer) => {
    const layerId = layer.get('id');

    switch (layerId) {
      // case munimap_complex.LAYER_ID:
      //   layer.setStyle(goog.partial(munimap.complex.style.function, {
      //     markerSource: markerSource,
      //     map: map
      //   })
      //   );
      //   break;
      case munimap_building.LAYER_ID:
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

    munimap_style.refreshFromFragments(map, layer);
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
