/**
 * @module layer/cluster
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_cluster from '../cluster/cluster.js';
import * as munimap_utils from '../utils/utils.js';
import ClusterSource from 'ol/source/Cluster';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {EnhancedClusterSource, clusterCompareFn} from '../source/cluster.js';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {Point} from 'ol/geom';
import {styleFunction as clusterStyleFunction} from '../style/cluster.js';
import {getCenter} from 'ol/extent';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view.js").AddLayersOptions} AddLayersOptions
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
 * @return {VectorLayer} layer
 */
const getLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isLayer);
  munimap_assert.assertInstanceof(result, VectorLayer);
  return /** @type {VectorLayer}*/ (result);
};

/**
 * @param {ol.Map} map map
 * @return {ClusterSource} source
 */
const getStore = (map) => {
  const layer = getLayer(map);
  const result = layer.getSource();
  munimap_assert.assertInstanceof(result, ClusterSource);
  return /** @type {ClusterSource}*/ (result);
};

/**
 * @param {ol.Map} map map
 * @return {VectorSource} source
 */
const getSource = (map) => {
  const clusterStore = getStore(map);
  munimap_assert.assertInstanceof(clusterStore, ClusterSource);
  return clusterStore.getSource();
};

/**
 * @param {ol.Map} map map
 * @return {Array.<ol.Feature>} source features
 * @protected
 */
const getSourceFeatures = (map) => {
  const source = getSource(map);
  return source.getFeatures();
};

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} marker cluster layer
 */
const create = (map, options) => {
  const {markers, lang, showLabels} = options;
  const clusterFeatures = markers.concat();
  const markerClusterSrc = new EnhancedClusterSource({
    attributions: options.muAttrs,
    source: new VectorSource({
      features: clusterFeatures,
    }),
    compareFn: munimap_utils.partial(clusterCompareFn, map, lang),
    geometryFunction: (feature) => {
      let result = null;
      const geom = feature.getGeometry();
      if (geom instanceof Point) {
        result = geom;
      } else if (geom) {
        result = new Point(getCenter(geom.getExtent()));
      }
      return result;
    },
    distance: 80,
  });

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

  const markerOptions = {
    map: map,
    markerSource: options.markerSource,
    markerLabel: options.markerLabel,
    lang: options.lang,
    clusterFacultyAbbr: options.clusterFacultyAbbr,
    locationCodes: options.locationCodes,
  };

  const markerClusterLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: LAYER_ID,
      isFeatureClickable: munimap_cluster.isClickable,
      featureClickHandler: munimap_cluster.featureClickHandler,
      source: markerClusterSrc,
      style: munimap_utils.partial(clusterStyleFunction, markerOptions),
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
      munimap_cluster.updateClusteredFeatures(map, res, showLabels);
    }

    mapProps.currentRes = res;
  });
  return markerClusterLayer;
};

export {create, getSource, getSourceFeatures};
