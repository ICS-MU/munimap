/* eslint-disable no-console */
/**
 * @module redux/selector
 */

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("../../conf.js").RequiredOptions} RequiredOptions
 * @typedef {import("../../conf.js").ErrorMessageState} ErrorMessageState
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("../../feature/cluster.js").ClusterOptions} ClusterOptions
 */

/**
 * @param {State} state state
 * @return {boolean} whether is initialized
 */
const isMapInitialized = (state) => state.mapInitialized;

/**
 * @param {State} state state
 * @return {RequiredOptions} opts
 */
const getRequiredOpts = (state) => state.requiredOpts;

/**
 * @param {State} state state
 * @return {boolean} msg
 */
const getRequiredLoadingMessage = (state) => state.requiredOpts.loadingMessage;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getMarkersTimestamp = (state) => state.markersTimestamp;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getZoomToTimestamp = (state) => state.zoomToTimestamp;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getBuildingsTimestamp = (state) => state.buildingsTimestamp;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getFloorsTimestamp = (state) => state.floorsTimestamp;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getOptPoisTimestamp = (state) => state.optPoisTimestamp;

/**
 * @type {import("reselect").Selector<State, Array<string>>}
 * @param {State} state state
 * @return {Array<string>} required markers
 */
const getRequiredMarkerIds = (state) => state.requiredOpts.markerIds;

/**
 * @param {State} state state
 * @return {string|Array<string>} zoomTo
 */
const getRequiredZoomTo = (state) => state.requiredOpts.zoomTo;

/**
 * @param {State} state state
 * @return {string} basemap
 */
const getRequiredBaseMap = (state) => state.requiredOpts.baseMap;

/**
 * @param {State} state state
 * @return {boolean} basemap
 */
const getRequiredLabels = (state) => state.requiredOpts.labels;

/**
 * @param {State} state state
 * @return {boolean} basemap
 */
const getRequiredMapLinks = (state) => state.requiredOpts.mapLinks;

/**
 * @param {State} state state
 * @return {string} lang
 */
const getLang = (state) => state.requiredOpts.lang;

/**
 * @param {State} state state
 * @return {string} target
 */
const getTargetId = (state) => state.requiredOpts.targetId;

/**
 * @param {State} state state
 * @return {ol.Coordinate} center
 */
const getCenter = (state) => state.center;

/**
 * @param {State} state state
 * @return {number} rotation
 */
const getRotation = (state) => state.rotation;

/**
 * @param {State} state state
 * @return {ol.Size} map size
 */
const getSize = (state) => state.mapSize;

/**
 * @param {State} state state
 * @return {ol.Coordinate} center
 */
const getRequiredCenter = (state) => state.requiredOpts.center;

/**
 * @param {State} state state
 * @return {number} center
 */
const getRequiredZoom = (state) => state.requiredOpts.zoom;

/**
 * @param {State} state state
 * @return {number} res
 */
const getResolution = (state) => state.resolution;

/**
 * @param {State} state state
 * @return {string} selected floor
 */
const getSelectedFeature = (state) => state.selectedFeature;

/**
 * @param {State} state state
 * @return {string} marker label function id
 */
const getRequiredMarkerLabelId = (state) => state.requiredOpts.markerLabelId;

/**
 * @param {State} state state
 * @return {boolean} whether to show only location codes
 */
const getRequiredLocationCodes = (state) => state.requiredOpts.locationCodes;

/**
 * @param {State} state state
 * @return {boolean} whether to cluster faculty abbreviations
 */
const getRequiredClusterFacultyAbbr = (state) =>
  state.requiredOpts.cluster && state.requiredOpts.cluster.facultyAbbr;

/**
 * @param {State} state state
 * @return {import("../../conf.js").AnimationRequestState} animation request state
 */
const getAnimationRequest = (state) => state.animationRequest;

/**
 * @param {State} state state
 * @return {boolean} whether to simple scroll
 */
const getRequiredSimpleScroll = (state) => state.requiredOpts.simpleScroll;

/**
 * @param {State} state state
 * @return {ErrorMessageState} error message state
 */
const getErrorMessageState = (state) => state.errorMessage;

/**
 * @param {State} state state
 * @return {string} id
 */
const getRequiredIdentifyCallbackId = (state) =>
  state.requiredOpts.identifyCallbackId;

/**
 * @param {State} state state
 * @return {string} uid
 */
const getPopupFeatureUid = (state) => state.popup.uid;

/**
 * @param {State} state state
 * @return {number} timestamp
 */
const getIdentifyTimestamp = (state) => state.identifyTimestamp;

/**
 * @param {State} state state
 * @return {number} timestamp
 */
const getResetTimestamp = (state) => state.resetTimestamp;

/**
 * @param {State} state state
 * @return {ClusterOptions} cluster options
 */
const getRequiredClusterOptions = (state) => state.requiredOpts.cluster;

export {
  getAnimationRequest,
  getBuildingsTimestamp,
  getCenter,
  getErrorMessageState,
  getFloorsTimestamp,
  getIdentifyTimestamp,
  getLang,
  getMarkersTimestamp,
  getOptPoisTimestamp,
  getPopupFeatureUid,
  getRequiredBaseMap,
  getRequiredCenter,
  getRequiredClusterFacultyAbbr,
  getRequiredClusterOptions,
  getRequiredIdentifyCallbackId,
  getRequiredLabels,
  getRequiredLoadingMessage,
  getRequiredLocationCodes,
  getRequiredMapLinks,
  getRequiredMarkerIds,
  getRequiredMarkerLabelId,
  getRequiredOpts,
  getRequiredSimpleScroll,
  getRequiredZoom,
  getRequiredZoomTo,
  getResetTimestamp,
  getResolution,
  getRotation,
  getSelectedFeature,
  getSize,
  getTargetId,
  getZoomToTimestamp,
  isMapInitialized,
};
