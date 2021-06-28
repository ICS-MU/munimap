/**
 * @module cluster/cluster
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_marker from '../feature/marker.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import ClusterSource from 'ol/source/Cluster';
import VectorLayer from 'ol/layer/Vector';
import {Feature} from 'ol';

/**
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/render/Event").default} ol.render.Event
 */

/**
 * @type {RangeInterface}
 * @const
 */
const ROOM_RESOLUTION = munimap_range.createResolution(
  1.19,
  Number.POSITIVE_INFINITY
);

/**
 * @type {RangeInterface}
 * @const
 */
const BUILDING_RESOLUTION = munimap_range.createResolution(
  2.39,
  Number.POSITIVE_INFINITY
);

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'markercluster';

/**
 * @param {FeatureClickHandlerOptions} options options
 * @return {boolean} whether is clackable
 */
const isClickable = (options) => {
  return true;
};

/**
 * @enum {RangeInterface}
 * @const
 * @protected
 */
const Resolutions = {
  MARKERS_ONLY: munimap_range.createResolution(0, 2.39),
  MARKERS_AND_UNITS: munimap_range.createResolution(2.39, 9),
  MARKERS_AND_FACULTIES: munimap_range.createResolution(
    9,
    Number.POSITIVE_INFINITY
  ),
};

/**
 * @param {number} resolution resolution
 * @return {RangeInterface} range
 * @protected
 */
const getResolutionRange = (resolution) => {
  let result;
  for (const range of Object.values(Resolutions)) {
    if (munimap_range.contains(range, resolution)) {
      result = range;
    }
  }
  return result;
};

/**
 * @param {ol.Map} map map
 * @param {number|RangeInterface} resolution resolution
 * @return {Array<Feature>} features
 * @protected
 */
const getClusteredFeatures = (map, resolution) => {
  const range = munimap_utils.isNumber(resolution)
    ? getResolutionRange(/** @type {number}*/ (resolution))
    : resolution;
  const ranges = Resolutions;
  let result;
  const markers = munimap_marker.getFeatures(map).concat();
  const bldgs = munimap_building.STORE.getFeatures();
  switch (range) {
    case ranges.MARKERS_ONLY:
      result = markers;
      break;
    case ranges.MARKERS_AND_UNITS:
      result = markers.concat(munimap_building.filterHeadquaters(bldgs));
      break;
    case ranges.MARKERS_AND_FACULTIES:
      result = markers.concat(munimap_building.filterFacultyHeadquaters(bldgs));
      break;
    default:
      break;
  }
  result = result || [];
  result = [...new Set(result)];
  return result;
};

/**
 * @param {Feature} feature feature
 * @return {boolean} whether is cluster
 */
const isCluster = (feature) => {
  const clusteredFeatures = feature.get('features');
  return (
    munimap_utils.isArray(clusteredFeatures) &&
    clusteredFeatures.every((f) => f instanceof Feature)
  );
};

/**
 * @param {ol.Map} map map
 * @param {Feature} cluster cluster
 * @return {boolean} whether contains marker
 */
const containsMarker = (map, cluster) => {
  const markers = munimap_marker.getFeatures(map);
  const clusteredFeatures = cluster.get('features');
  if (clusteredFeatures) {
    return clusteredFeatures.some((feat) => markers.includes(feat));
  }
  return false;
};

/**
 * @param {Feature} feature feature
 * @return {Array.<Feature>} features
 */
const getFeatures = (feature) => {
  return isCluster(feature)
    ? /** @type {Array.<Feature>} */ (feature.get('features'))
    : [];
};

/**
 * @param {ol.Map} map map
 * @param {Feature} feature feature
 * @return {Array.<Feature>} main features
 */
const getMainFeatures = (map, feature) => {
  let result = getFeatures(feature);
  if (containsMarker(map, feature)) {
    result = result.filter(munimap_utils.partial(munimap_marker.isMarker, map));
  }
  return result;
};

/**
 * @param {ol.Map} map map
 * @param {Feature} feature feature
 * @return {Array.<Feature>} minor features
 */
const getMinorFeatures = (map, feature) => {
  let result = getFeatures(feature);
  result = result.filter((f) => !munimap_marker.isMarker(map, f));
  return result;
};

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
 * @return {ol.source.Vector} source
 */
const getSource = (map) => {
  const clusterStore = getStore(map);
  munimap_assert.assertInstanceof(clusterStore, ClusterSource);
  return clusterStore.getSource();
};

/**
 * @param {ol.Map} map map
 * @return {Array.<Feature>} source features
 * @protected
 */
const getSourceFeatures = (map) => {
  const source = getSource(map);
  return source.getFeatures();
};

/**
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (options) => {
  console.error('Not implemented yet!');
  // const feature = options.feature;
  // const map = options.map;
  // const resolution = options.resolution;
  // const view = map.getView();
  // const size = map.getSize() || null;
  // const viewExtent = view.calculateExtent(size);

  // let clusteredFeatures = getMainFeatures(map, feature);
  // const clusterFacultyAbbr = munimap.getProps(map).options.clusterFacultyAbbr;

  // if (clusterFacultyAbbr) {
  //   const minorFeatures = getMinorFeatures(map, feature);
  //   clusteredFeatures = clusteredFeatures.concat(minorFeatures);
  // }

  // const firstFeature = clusteredFeatures[0];
  // goog.asserts.assertInstanceof(firstFeature, Feature);
  // const resolutionRange = (munimap.door.isDoor(firstFeature)) ?
  //   munimap.door.RESOLUTION : munimap.floor.RESOLUTION;
  // let extent;
  // if (clusteredFeatures.length === 1) {
  //   let center;
  //   const detail = /** @type {string} */(firstFeature.get('detail'));
  //   if (detail) {
  //     munimap.bubble.show(firstFeature, map, detail, 0, 20);
  //   }
  //   if (munimap.marker.custom.isCustom(firstFeature)) {
  //     extent = munimap.extent.ofFeature(firstFeature);
  //     center = ol.extent.getCenter(extent);
  //     munimap.map.zoomToPoint(map, center, resolutionRange.max);
  //   } else {
  //     const isVisible = munimap.range.contains(resolutionRange, resolution);
  //     if (!isVisible) {
  //       extent = munimap.extent.ofFeature(firstFeature);
  //       center = ol.extent.getCenter(extent);
  //       munimap.map.zoomToPoint(map, center, resolutionRange.max);
  //     }
  //     munimap.changeFloor(map, firstFeature);
  //     if (isVisible) {
  //       munimap.info.refreshVisibility(map);
  //     }
  //   }
  // } else {
  //   const showOneBuilding = false;
  //   let duration;
  //   if (showOneBuilding) {
  //     extent = munimap.extent.ofFeatures(clusteredFeatures);
  //     goog.asserts.assertArray(size);
  //     const bldgExtent = ol.extent.getForViewAndSize(
  //       ol.extent.getCenter(extent), resolutionRange.max,
  //       view.getRotation(), size);
  //     if (ol.extent.containsExtent(bldgExtent, extent)) {
  //       extent = bldgExtent;
  //     }
  //     duration = munimap.move.getAnimationDuration(viewExtent, extent);
  //     view.fit(extent, {
  //       duration: duration
  //     });
  //   } else {
  //     extent = munimap.extent.ofFeatures(clusteredFeatures);
  //     goog.asserts.assertArray(size);
  //     duration = munimap.move.getAnimationDuration(viewExtent, extent);
  //     view.fit(extent, {
  //       duration: duration
  //     });
  //   }
  //   map.renderSync();
  // }
};

/**
 * @param {ol.Map} map map
 * @param {number} resolution resolution
 */
const updateClusteredFeatures = (map, resolution) => {
  // if (munimap_utils.isDefAndNotNull(munimap.getProps(map).options.labels) &&
  //   !munimap.getProps(map).options.labels) {
  //   return;
  // }
  const oldFeatures = getSourceFeatures(map);
  const features = getClusteredFeatures(map, resolution);
  let allFeatures = oldFeatures.concat(features);
  allFeatures = [...new Set(allFeatures)];
  const bucket = {
    'remove': [],
    'add': [],
  };
  allFeatures.forEach((feature) => {
    if (oldFeatures.indexOf(feature) >= 0 && features.indexOf(feature) < 0) {
      bucket['remove'].push(feature);
    } else if (
      oldFeatures.indexOf(feature) < 0 &&
      features.indexOf(feature) >= 0
    ) {
      bucket['add'].push(feature);
    }
  });
  const featuresToRemove = bucket['remove'] || [];
  const featuresToAdd = bucket['add'] || [];

  const source = getSource(map);
  if (featuresToRemove.length > 0) {
    featuresToRemove.forEach((feature) => {
      source.removeFeature(feature);
    });
  }
  if (featuresToAdd.length > 0) {
    source.addFeatures(featuresToAdd);
  }
};

// /**
//  * @param {ol.render.Event} evt event
//  */
// const handleMapPrecomposeEvt = (evt) => {
//   dát asi do reduxu
//   const map = /**@type {ol.Map}*/ (evt.target);
//   // const mapProps = munimap.getProps(map);
//   const viewState = evt.frameState.viewState;

//   // const oldRes = mapProps.currentResolution;
//   const res = viewState.resolution;

//   // const oldRange = getResolutionRange(oldRes);
//   // const range = getResolutionRange(res);

//   // if (range !== oldRange) {
//   //updateClusteredFeatures(map, res);
//   // }

//   // mapProps.currentResolution = res;
// };

export {
  BUILDING_RESOLUTION,
  ROOM_RESOLUTION,
  LAYER_ID,
  Resolutions,
  isClickable,
  featureClickHandler,
  getMainFeatures,
  getFeatures,
  getResolutionRange,
  getMinorFeatures,
  updateClusteredFeatures,
  //handleMapPrecomposeEvt,
};
