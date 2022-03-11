/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("./conf.js").State} State
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("./feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("./feature/feature.js").getMainFeatureAtPixelFunction} getMainFeatureAtPixelFunction
 * @typedef {import("./identify/identify.js").CallbackFunction} IdentifyCallbackFunction
 */

/**
 * @type {Object<string, ol.Feature>}
 */
export const REQUIRED_CUSTOM_MARKERS = {};

/**
 * @type {Object<string, MarkerLabelFunction>}
 */
export const MARKER_LABEL_STORE = {};

/**
 * @type {Object<string, ol.Map>}
 */
export const CREATED_MAPS = {};

/**
 * @type {Object<string, HTMLElement>}
 */
export const TARGET_ELEMENTS_STORE = {};

/**
 * @type {Object<string, getMainFeatureAtPixelFunction>}
 */
export const GET_MAIN_FEATURE_AT_PIXEL_STORE = {};

/**
 * @type {Object<string, IdentifyCallbackFunction>}
 */
export const IDENTIFY_CALLBACK_STORE = {};

/**
 * @type {Object<string, redux.Store>}
 */
const STORES = {};

/**
 * @param {string} id id
 * @return {redux.Store} store
 */
export const getStoreByTargetId = (id) => STORES[id];

/**
 * @param {string} id id
 * @param {redux.Store} store store
 */
export const setStoreByTargetId = (id, store) => {
  STORES[id] = store;
};
