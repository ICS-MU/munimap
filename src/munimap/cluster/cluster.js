/**
 * @module cluster/cluster
 */
import * as actions from '../redux/action.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_marker from '../feature/marker.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import {Feature} from 'ol';
import {getStore as getBuildingStore} from '../source/building.js';
import {getStore as getMarkerStore} from '../source/marker.js';

/**
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("../feature/feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/render/Event").default} ol.render.Event
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("redux").Dispatch} redux.Dispatch
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
 * @param {IsClickableOptions} options options
 * @return {boolean} whether is clackable
 */
const isClickable = (options) => {
  return true;
};

/**
 * @param {redux.Dispatch} dispatch dispatch
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (dispatch, options) => {
  dispatch(actions.clusterClicked(options));
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
 * @param {number|RangeInterface} resolution resolution
 * @return {Array<Feature>} features
 * @protected
 */
const getClusteredFeatures = (resolution) => {
  const range = munimap_utils.isNumber(resolution)
    ? getResolutionRange(/** @type {number}*/ (resolution))
    : resolution;
  const ranges = Resolutions;
  let result;
  const markers = getMarkerStore().getFeatures().concat();
  const bldgs = getBuildingStore().getFeatures();
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
 * @param {Feature|ol.render.Feature} feature feature
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
 * @param {Feature} cluster cluster
 * @return {boolean} whether contains marker
 */
const containsMarker = (cluster) => {
  const markers = getMarkerStore().getFeatures();
  const clusteredFeatures = cluster.get('features');
  if (clusteredFeatures) {
    return clusteredFeatures.some((feat) => markers.includes(feat));
  }
  return false;
};

/**
 * @param {Feature|ol.render.Feature} feature feature
 * @return {Array<Feature>} features
 */
const getFeatures = (feature) => {
  return isCluster(feature)
    ? /** @type {Array<Feature>} */ (feature.get('features'))
    : [];
};

/**
 * @param {Feature} feature feature
 * @return {Array<Feature>} main features
 */
const getMainFeatures = (feature) => {
  let result = getFeatures(feature);
  if (containsMarker(feature)) {
    result = result.filter(munimap_marker.isMarker);
  }
  return result;
};

/**
 * @param {Feature} feature feature
 * @return {Array<Feature>} minor features
 */
const getMinorFeatures = (feature) => {
  let result = getFeatures(feature);
  result = result.filter((f) => !munimap_marker.isMarker(f));
  return result;
};

export {
  BUILDING_RESOLUTION,
  ROOM_RESOLUTION,
  Resolutions,
  isClickable,
  featureClickHandler,
  getMainFeatures,
  getFeatures,
  getResolutionRange,
  getMinorFeatures,
  getClusteredFeatures,
};
