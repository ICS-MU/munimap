/**
 * @module layer/marker
 */

import * as munimap_cluster from '../cluster/cluster.js';
import * as munimap_marker from '../feature/marker.js';
import * as munimap_markerStyle from '../style/marker.js';
import VectorLayer from 'ol/layer/Vector';
import {getStore} from '../source/marker.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view/view.js").AddLayersOptions} AddLayersOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'marker';

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === LAYER_ID;
};

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} lyr
 */
const create = (map, options) => {
  const {markers, muAttrs} = options;

  const markerSource = getStore();
  markerSource.setAttributions(muAttrs);
  markerSource.addFeatures(markers);

  const clusterResolution = munimap_cluster.BUILDING_RESOLUTION;
  // if (
  //   markers.length &&
  //   (markers.some((el) => {
  //     return munimap.room.isRoom(el);
  //   }) ||
  //     markers.some((el) => {
  //       return munimap.door.isDoor(el);
  //     })
  // ) {
  //   clusterResolution = munimap_cluster.ROOM_RESOLUTION;
  // }
  const markerLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LAYER_ID,
      isFeatureClickable: munimap_marker.isClickable,
      featureClickHandler: munimap_marker.featureClickHandler,
      redrawOnFloorChange: true,
      source: markerSource,
      maxResolution: clusterResolution.min,
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      renderOrder: null,
    })
  );
  markerLayer.once('precompose', munimap_markerStyle.getPattern);

  return markerLayer;
};

export {LAYER_ID, create, isLayer};
