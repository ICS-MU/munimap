/**
 * @module redux/action
 */

import {
  sendEvent,
  sendEventForCustomMarker,
  sendEventForOptions,
} from '../matomo/matomo.js';

/**
 * @typedef {import("../create.js").Options} CreateOptions
 * @typedef {import("../feature/floor.js").Options} FloorOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("redux").AnyAction} redux.AnyAction
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("../matomo/matomo.js").Options} MatomoOptions
 * @typedef {import("../conf.js").ErrorMessageState} ErrorMessageState
 * @typedef {import("../utils/animation.js").AnimationRequestOptions} AnimationRequestOptions
 */

/**
 * @typedef {Object} LoadedTypes
 * @property {boolean} building building
 * @property {boolean} room room
 * @property {boolean} door door
 */

/**
 * @type {string}
 * @const
 */
export const OL_MAP_VIEW_CHANGE = 'OL_MAP_VIEW_CHANGE';

/**
 * @type {string}
 * @const
 */
export const CREATE_MUNIMAP = 'CREATE_MUNIMAP';

/**
 * @type {string}
 * @const
 */
export const MARKERS_LOADED = 'MARKERS_LOADED';

/**
 * @type {string}
 * @const
 */
export const MAP_INITIALIZED = 'MAP_INITIALIZED';

/**
 * @type {string}
 * @const
 */
export const OL_MAP_PRECOMPOSED = 'OL_MAP_PRECOMPOSED';

/**
 * @type {string}
 * @const
 */
export const ZOOMTO_LOADED = 'ZOOMTO_LOADED';

/**
 * @type {string}
 * @const
 */
export const LOG_ACTION_HAPPENED = 'LOG_ACTION_HAPPENED';

/**
 * @type {string}
 * @const
 */
export const BUILDINGS_LOADED = 'BUILDINGS_LOADED';

/**
 * @type {string}
 * @const
 */
export const FLOORS_LOADED = 'FLOORS_LOADED';

/**
 * @type {string}
 * @const
 */
export const ROOMS_LOADED = 'ROOMS_LOADED';

/**
 * @type {string}
 * @const
 */
export const DOORS_LOADED = 'DOORS_LOADED';

/**
 * @type {string}
 * @const
 */
export const SELECTED_FEATURE_CHANGED = 'SELECTED_FEATURE_CHANGED';

/**
 * @type {string}
 * @const
 */
export const TARGET_WHEELED = 'TARGET_WHEELED';

/**
 * @type {string}
 * @const
 */
export const TARGET_TOUCHMOVED = 'TARGET_TOUCHMOVED';

/**
 * @type {string}
 * @const
 */
export const TARGET_BLURRED = 'TARGET_BLURRED';

/**
 * @type {string}
 * @const
 */
export const TARGET_FOCUSED = 'TARGET_FOCUSED';

/**
 * @type {string}
 * @const
 */
export const POIS_LOADED = 'POIS_LOADED';

/**
 * @type {string}
 * @const
 */
export const VIEW_ANIMATION_REQUESTED = 'VIEW_ANIMATION_REQUESTED';

/**
 * @param {Array<ol.Feature|string>} markers markers
 * @param {LoadedTypes} loadedTypes loaded feature types
 * @return {redux.AnyAction} action
 */
export function markers_loaded(markers, loadedTypes) {
  sendEventForCustomMarker(markers);
  return {
    type: MARKERS_LOADED,
    payload: loadedTypes,
  };
}

/**
 * @param {LoadedTypes} loadedTypes loaded feature types
 * @return {redux.AnyAction} action
 */
export function zoomTo_loaded(loadedTypes) {
  return {
    type: ZOOMTO_LOADED,
    payload: loadedTypes,
  };
}

/**
 * Inital for creating munimap. At first, action sends info to matomo and
 * after that creates and returns action object.
 * @param {MatomoOptions} options options
 * @return {redux.AnyAction} action
 */
export function create_munimap(options) {
  sendEvent('map', 'create');
  sendEventForOptions(options);

  return {
    type: CREATE_MUNIMAP,
  };
}

/**
 * @return {redux.AnyAction} action
 */
export function map_initialized() {
  return {
    type: MAP_INITIALIZED,
  };
}

/**
 * @param {{resolution: number}} object action object
 * @return {redux.AnyAction} action
 */
export function map_precomposed(object) {
  return {
    type: OL_MAP_PRECOMPOSED,
    payload: {
      resolution: object.resolution,
    },
  };
}

/**
 * @param {{
 *    center: ol.Coordinate,
 *    resolution: number,
 *    mapSize: ol.Size
 * }} object action object
 * @return {redux.AnyAction} action
 */
export function ol_map_view_change(object) {
  return {
    type: OL_MAP_VIEW_CHANGE,
    payload: {
      view: object,
    },
  };
}

/**
 * @param {{
 *    category: string,
 *    action: string
 * }} object action object
 * @return {redux.AnyAction} action
 */
export function log_action_happened(object) {
  sendEvent(object.category, object.action);
  return {
    type: LOG_ACTION_HAPPENED,
  };
}

/**
 * @return {redux.AnyAction} action
 */
export function buildings_loaded() {
  return {
    type: BUILDINGS_LOADED,
  };
}

/**
 * @param {boolean} newSelectedIsActive newSelectedIsActive
 * @return {redux.AnyAction} action
 */
export function floors_loaded(newSelectedIsActive) {
  return {
    type: FLOORS_LOADED,
    payload: {newSelectedIsActive},
  };
}

/**
 * @param {string} roomType loaded room type
 * @return {redux.AnyAction} action
 */
export function rooms_loaded(roomType) {
  return {
    type: ROOMS_LOADED,
    payload: roomType,
  };
}

/**
 * @return {redux.AnyAction} action
 */
export function doors_loaded() {
  return {
    type: DOORS_LOADED,
  };
}

/**
 * @param {string} code new code (bldg, floor)
 * @return {redux.AnyAction} action
 */
export function selected_feature_changed(code) {
  return {
    type: SELECTED_FEATURE_CHANGED,
    payload: code,
  };
}

/**
 * @param {ErrorMessageState} errorMessageProps error message props
 * @return {redux.AnyAction} action
 */
export function target_touchmoved(errorMessageProps) {
  return {
    type: TARGET_TOUCHMOVED,
    payload: errorMessageProps,
  };
}

/**
 * @param {ErrorMessageState} errorMessageProps error message props
 * @return {redux.AnyAction} action
 */
export function target_wheeled(errorMessageProps) {
  return {
    type: TARGET_WHEELED,
    payload: errorMessageProps,
  };
}

/**
 * @param {ErrorMessageState} errorMessageProps error message props
 * @return {redux.AnyAction} action
 */
export function target_focused(errorMessageProps) {
  return {
    type: TARGET_FOCUSED,
    payload: errorMessageProps,
  };
}

/**
 * @param {ErrorMessageState} errorMessageProps error message props
 * @return {redux.AnyAction} action
 */
export function target_blurred(errorMessageProps) {
  return {
    type: TARGET_BLURRED,
    payload: errorMessageProps,
  };
}

/**
 * @return {redux.AnyAction} action
 */
export function pois_loaded() {
  return {
    type: POIS_LOADED,
  };
}

/**
 * @param {AnimationRequestOptions} object object
 * @return {redux.AnyAction} action
 */
export function view_animation_requested(object) {
  return {
    type: VIEW_ANIMATION_REQUESTED,
    payload: object,
  };
}
