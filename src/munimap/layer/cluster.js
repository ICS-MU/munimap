/**
 * @module layer/cluster
 */
import * as munimap_cluster from '../cluster/cluster.js';
import VectorLayer from 'ol/layer/Vector';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {createStore as createClusterStore} from '../view/cluster.js';
import {updateClusteredFeatures} from '../view/cluster.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view/view.js").AddLayersOptions} AddLayersOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").MapProps} MapProps
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'markercluster';

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is layer
 */
const isLayer = (layer) => layer.get('id') === LAYER_ID;

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} marker cluster layer
 */
const create = (map, options) => {
  const {markers, lang, showLabels, muAttrs} = options;
  const clusterFeatures = markers.concat();
  const markerClusterSrc = createClusterStore(clusterFeatures, muAttrs, lang);
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

  const markerClusterLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LAYER_ID,
      isFeatureClickable: munimap_cluster.isClickable,
      featureClickHandler: munimap_cluster.featureClickHandler,
      source: markerClusterSrc,
      minResolution: clusterResolution.min,
      renderOrder: null,
    })
  );

  markerClusterLayer.on('prerender', (evt) => {
    const mapProps = /** @type {MapProps}*/ (map.get(MUNIMAP_PROPS_ID));
    const oldRes = mapProps.currentRes;
    const res = evt.frameState.viewState.resolution;

    const oldRange = munimap_cluster.getResolutionRange(oldRes);
    const range = munimap_cluster.getResolutionRange(res);

    if (range !== oldRange) {
      updateClusteredFeatures(map, res, showLabels);
    }

    mapProps.currentRes = res;
  });
  return markerClusterLayer;
};

export {create, isLayer};
