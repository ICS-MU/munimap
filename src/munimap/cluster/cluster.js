/**
 * @module cluster/cluster
 */
import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_marker from '../feature/marker.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import {Feature} from 'ol';
import {
  getBuildingStore,
  getClusterStore,
  getMarkerStore,
} from '../source/_constants.js';
import {getUid} from 'ol';

/**
 * @typedef {import("../conf.js").State} State
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
 * @typedef {Object} GetPopupFeatureOptions
 * @property {string} targetId targetId
 * @property {string} featureUid featureUid
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
 * @param {string} targetId targetId
 * @param {number|RangeInterface} resolution resolution
 * @return {Array<Feature>} features
 * @protected
 */
const getClusteredFeatures = (targetId, resolution) => {
  const range = munimap_utils.isNumber(resolution)
    ? getResolutionRange(/** @type {number}*/ (resolution))
    : resolution;
  const ranges = Resolutions;
  let result;
  const markers = getMarkerStore(targetId).getFeatures().concat();
  const bldgs = getBuildingStore(targetId).getFeatures();
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
 * @param {string} targetId targetId
 * @param {Feature} cluster cluster
 * @return {boolean} whether contains marker
 */
const containsMarker = (targetId, cluster) => {
  const markers = getMarkerStore(targetId).getFeatures();
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
 * @param {string} targetId targetId
 * @param {Feature} feature feature
 * @return {Array<Feature>} main features
 */
const getMainFeatures = (targetId, feature) => {
  let result = getFeatures(feature);
  if (containsMarker(targetId, feature)) {
    result = result.filter((f) => munimap_marker.isMarker(targetId, f));
  }
  return result;
};

/**
 * @param {string} targetId targetId
 * @param {Feature} feature feature
 * @return {Array<Feature>} minor features
 */
const getMinorFeatures = (targetId, feature) => {
  let result = getFeatures(feature);
  result = result.filter((f) => !munimap_marker.isMarker(targetId, f));
  return result;
};

/**
 * @param {State} state state
 * @param {GetPopupFeatureOptions} options payload
 * @return {string} feature uid
 */
const getPopupFeatureUid = (state, options) => {
  const {featureUid, targetId} = options;
  const feature = getClusterStore(targetId).getFeatureByUid(featureUid);
  let uid;

  let clusteredFeatures = getMainFeatures(targetId, feature);
  if (state.requiredOpts.clusterFacultyAbbr) {
    const minorFeatures = getMinorFeatures(targetId, feature);
    clusteredFeatures = clusteredFeatures.concat(minorFeatures);
  }

  const firstFeature = clusteredFeatures[0];
  munimap_assert.assertInstanceof(firstFeature, Feature);

  if (clusteredFeatures.length === 1) {
    if (firstFeature.get('detail')) {
      uid = getUid(firstFeature);
    }
  }
  return uid;
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
  getPopupFeatureUid,
};
