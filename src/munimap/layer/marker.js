/**
 * @module layer/marker
 */

import * as munimap_cluster from '../cluster/cluster.js';
import * as munimap_marker from '../feature/marker.js';
import * as munimap_markerStyle from '../style/marker.js';
import * as munimap_utils from '../utils/utils.js';
import VectorLayer from 'ol/layer/Vector';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view.js").AddLayersOptions} AddLayersOptions
 */

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} lyr
 */
export const create = (map, options) => {
  const {markers, lang, muAttrs, locationCodes} = options;
  const markerSource = munimap_marker.STORE;
  markerSource.setAttributions(muAttrs);
  markerSource.addFeatures(markers);

  const markerOptions = {
    map: map,
    markerSource: markerSource,
    //markerLabel: options.markerLabel,
    lang: lang,
    locationCodes: locationCodes,
  };
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
      id: munimap_marker.LAYER_ID,
      isFeatureClickable: munimap_marker.isClickable,
      featureClickHandler: munimap_marker.featureClickHandler,
      redrawOnFloorChange: true,
      source: markerSource,
      style: munimap_utils.partial(
        munimap_markerStyle.styleFunction,
        markerOptions
      ),
      maxResolution: clusterResolution.min,
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      renderOrder: null,
    })
  );
  markerLayer.once('precompose', munimap_markerStyle.getPattern);

  return markerLayer;
};
