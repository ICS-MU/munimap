/**
 * @module cluster/cluster
 */
import * as actions from '../redux/action.js';
import * as mm_assert from '../assert/assert.js';
import * as mm_building from './building.js';
import * as mm_marker from './marker.js';
import * as mm_range from '../utils/range.js';
import * as mm_utils from '../utils/utils.js';
import {Feature, getUid} from 'ol';
import {getAbbr} from './unit.js';
import {
  getBuildingStore,
  getClusterStore,
  getMarkerStore,
} from '../source/constants.js';
import {getPropertySafe} from '../utils/object.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("../style/icon.js").IconOptions} IconOptions
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/render/Event").default} ol.render.Event
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @typedef {object} GetPopupFeatureOptions
 * @property {string} targetId targetId
 * @property {string} featureUid featureUid
 */

/**
 * @typedef {{
 *    marked: ({
 *      icon: ({
 *        single: (IconOptions|undefined),
 *        multiple: (IconOptions|undefined)
 *      }|undefined),
 *      color: ({
 *        single: (string|undefined),
 *        multiple: (string|undefined)
 *      }|undefined)
 *    }|undefined),
 *    unmarked: ({
 *      icon: ({
 *        single: (IconOptions|undefined),
 *        multiple: (IconOptions|undefined)
 *      }|undefined),
 *      color: ({
 *        single: (string|undefined),
 *        multiple: (string|undefined)
 *      }|undefined)
 *    }|undefined),
 *    facultyAbbr: (boolean|undefined),
 *    distance: (number|undefined)
 * }} ClusterOptions
 */

/**
 * @type {RangeInterface}
 * @const
 */
const ROOM_RESOLUTION = mm_range.createResolution(
  1.19,
  Number.POSITIVE_INFINITY
);

/**
 * @type {RangeInterface}
 * @const
 */
const BUILDING_RESOLUTION = mm_range.createResolution(
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
  MARKERS_ONLY: mm_range.createResolution(0, 2.39),
  MARKERS_AND_UNITS: mm_range.createResolution(2.39, 9),
  MARKERS_AND_FACULTIES: mm_range.createResolution(9, Number.POSITIVE_INFINITY),
};

/**
 * @param {number} resolution resolution
 * @return {RangeInterface} range
 * @protected
 */
const getResolutionRange = (resolution) => {
  let result;
  for (const range of Object.values(Resolutions)) {
    if (mm_range.contains(range, resolution)) {
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
  const range = mm_utils.isNumber(resolution)
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
      result = markers.concat(mm_building.filterHeadquaters(bldgs));
      break;
    case ranges.MARKERS_AND_FACULTIES:
      result = markers.concat(mm_building.filterFacultyHeadquaters(bldgs));
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
    mm_utils.isArray(clusteredFeatures) &&
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
    result = result.filter((f) => mm_marker.isMarker(targetId, f));
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
  result = result.filter((f) => !mm_marker.isMarker(targetId, f));
  return result;
};

/**
 * @param {string} targetId targetId
 * @param {Feature|string} featureOrUid feature or feature uid
 * @param {ClusterOptions} opt_options options
 * @return {Array<Feature>} features
 */
const getFeaturesByPriority = (targetId, featureOrUid, opt_options) => {
  const feature = /** @type {Feature} */ (
    mm_utils.isString(featureOrUid)
      ? getClusterStore(targetId).getFeatureByUid(
          /** @type {string}*/ (featureOrUid)
        )
      : featureOrUid
  );

  let clusteredFeatures = getMainFeatures(targetId, feature);
  if (opt_options && opt_options.facultyAbbr) {
    const minorFeatures = getMinorFeatures(targetId, feature);
    clusteredFeatures = clusteredFeatures.concat(minorFeatures);
  }

  return clusteredFeatures;
};

/**
 * @param {string} targetId targetId
 * @param {Feature|string} featureOrUid feature or feature uid
 * @param {ClusterOptions} opt_options options
 * @return {Feature} features
 */
const getFirstFeatureByPriority = (targetId, featureOrUid, opt_options) => {
  const features = getFeaturesByPriority(targetId, featureOrUid, opt_options);
  return features.length > 0 ? features[0] : null;
};

/**
 *
 * @param {Array<Feature>} minorFeatures minor features
 * @param {boolean} isMarked is marked
 * @param {string} lang lang
 * @return {string|undefined} titleparts
 */
const getMinorTitleParts = (minorFeatures, isMarked, lang) => {
  let minorTitle;
  if (isMarked) {
    if (minorFeatures.length > 0) {
      const units = mm_building.getFacultiesOfBuildings(minorFeatures);
      const titleParts = [];

      units.forEach((unit) => {
        const abbr = getAbbr(unit, lang);
        if (abbr) {
          titleParts.push(abbr);
        }
      });
      titleParts.sort();
      if (titleParts.length > 5) {
        let result = [];
        for (let i = 0, len = titleParts.length; i < len; i += 5) {
          result.push(titleParts.slice(i, i + 5));
        }
        result = result.map((item) => item.join(', '));
        minorTitle = result.join('\n');
      } else {
        minorTitle = titleParts.join(', ');
      }
    }
  }
  return minorTitle;
};

/**
 * @param {Array<Feature>} clusteredFeatures clustered features
 * @return {string} feature uid
 */
const getPopupFeatureUid = (clusteredFeatures) => {
  let uid;

  if (clusteredFeatures.length === 1) {
    const firstFeature = clusteredFeatures[0];
    mm_assert.assertInstanceof(firstFeature, Feature);
    if (firstFeature.get('detail')) {
      uid = getUid(firstFeature);
    }
  }
  return uid;
};

/**
 * @param {ClusterOptions} [opt_options] opts
 * @return {IconOptions?} opts
 */
const getMultipleMarkedIconOptions = (opt_options) => {
  return getPropertySafe(() => opt_options.marked.icon.multiple, null);
};

/**
 * @param {ClusterOptions} [opt_options] opts
 * @return {IconOptions?} opts
 */
const getSingleMarkedIconOptions = (opt_options) => {
  return getPropertySafe(() => opt_options.marked.icon.single, null);
};

/**
 * @param {ClusterOptions} [opt_options] opts
 * @return {IconOptions?} opts
 */
const getMultipleUnmarkedIconOptions = (opt_options) => {
  return getPropertySafe(() => opt_options.unmarked.icon.multiple, null);
};

/**
 * @param {ClusterOptions} [opt_options] opts
 * @return {IconOptions?} opts
 */
const getSingleUnmarkedIconOptions = (opt_options) => {
  return getPropertySafe(() => opt_options.unmarked.icon.single, null);
};

/**
 * @param {ClusterOptions} [opt_options] opts
 * @return {string?} color
 */
const getMultipleMarkedColor = (opt_options) => {
  return getPropertySafe(() => opt_options.marked.color.multiple, null);
};

/**
 * @param {ClusterOptions} [opt_options] opts
 * @return {string?} color
 */
const getSingleMarkedColor = (opt_options) => {
  return getPropertySafe(() => opt_options.marked.color.single, null);
};

/**
 * @param {ClusterOptions} [opt_options] opts
 * @return {string?} color
 */
const getMultipleUnmarkedColor = (opt_options) => {
  return getPropertySafe(() => opt_options.unmarked.color.multiple, null);
};

/**
 * @param {ClusterOptions} [opt_options] opts
 * @return {string?} color
 */
const getSingleUnmarkedColor = (opt_options) => {
  return getPropertySafe(() => opt_options.unmarked.color.single, null);
};

export {
  BUILDING_RESOLUTION,
  ROOM_RESOLUTION,
  Resolutions,
  isClickable,
  featureClickHandler,
  getClusteredFeatures,
  getFeatures,
  getFeaturesByPriority,
  getFirstFeatureByPriority,
  getMainFeatures,
  getMinorFeatures,
  getMinorTitleParts,
  getMultipleMarkedColor,
  getMultipleMarkedIconOptions,
  getMultipleUnmarkedColor,
  getMultipleUnmarkedIconOptions,
  getPopupFeatureUid,
  getResolutionRange,
  getSingleMarkedColor,
  getSingleMarkedIconOptions,
  getSingleUnmarkedColor,
  getSingleUnmarkedIconOptions,
};
