/**
 * @module layer/cluster
 */
import * as munimap_cluster from '../cluster/cluster.js';
import * as munimap_marker from '../feature/marker.js';
import * as munimap_utils from '../utils/utils.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {EnhancedClusterSource, clusterCompareFn} from '../source/cluster.js';
import {Point} from 'ol/geom';
import {styleFunction as clusterStyleFunction} from '../style/cluster.js';
import {getCenter} from 'ol/extent';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("../view.js").AddLayersOptions} AddLayersOptions
 */

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} marker cluster layer
 */
export const create = (map, options) => {
  const {markers, lang, muAttrs, clusterFacultyAbbr, locationCodes} = options;
  const clusterFeatures = markers.concat();
  const markerClusterSrc = new EnhancedClusterSource({
    attributions: muAttrs,
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
    markerSource: munimap_marker.STORE,
    //markerLabel: options.markerLabel,
    lang: lang,
    clusterFacultyAbbr: clusterFacultyAbbr,
    locationCodes: locationCodes,
  };

  const markerClusterLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: munimap_cluster.LAYER_ID,
      isFeatureClickable: munimap_cluster.isClickable,
      featureClickHandler: munimap_cluster.featureClickHandler,
      source: markerClusterSrc,
      style: munimap_utils.partial(clusterStyleFunction, markerOptions),
      minResolution: clusterResolution.min,
      renderOrder: null,
    })
  );
  return markerClusterLayer;
};
