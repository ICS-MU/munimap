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
 * @typedef {import("../view/view.js").PointerMoveTimeoutOptions} PointerMoveTimeoutOptions
 * @typedef {import("../feature/floor.js").Options} FloorOptions
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("redux").Action} redux.Action
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("../matomo/matomo.js").Options} MatomoOptions
 * @typedef {import("../conf.js").AnimationRequestOptions} AnimationRequestOptions
 */

/**
 * @typedef {Object} PayloadPropObj
 * @property {*} [payload] payload
 * @property {redux.Dispatch} [asyncDispatch] dispatch
 *
 * @typedef {redux.Action & PayloadPropObj} PayloadAsyncAction
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
export const BUILDING_CLICKED = 'BUILDING_CLICKED';

/**
 * @type {string}
 * @const
 */
export const COMPLEX_CLICKED = 'COMPLEX_CLICKED';

/**
 * @type {string}
 * @const
 */
export const CLUSTER_CLICKED = 'CLUSTER_CLICKED';

/**
 * @type {string}
 * @const
 */
export const MARKER_CLICKED = 'MARKER_CLICKED';

/**
 * @type {string}
 * @const
 */
export const POI_CLICKED = 'POI_CLICKED';

/**
 * @type {string}
 * @const
 */
export const PUBTRAN_CLICKED = 'PUBTRAN_CLICKED';

/**
 * @type {string}
 * @const
 */
export const ROOM_CLICKED = 'ROOM_CLICKED';

/**
 * @type {string}
 * @const
 */
export const DOOR_CLICKED = 'DOOR_CLICKED';

/**
 * @type {string}
 * @const
 */
export const GEOLOCATION_CLICKED = 'GEOLOCATION_CLICKED';

/**
 * @type {string}
 * @const
 */
export const POPUP_CLOSED = 'POPUP_CLOSED';

/**
 * @type {string}
 * @const
 */
export const IDENTIFY_RESETED = 'IDENTIFY_RESETED';

/**
 * @type {string}
 * @const
 */
export const POINTERMOVE_TIMEOUT_EXPIRED = 'POINTERMOVE_TIMEOUT_EXPIRED';

/**
 * @type {string}
 * @const
 */
export const TOOLTIP_CANCELLED = 'TOOLTIP_CANCELLED';

/**
 * @param {Array<ol.Feature|string>} markers markers
 * @param {LoadedTypes} loadedTypes loaded feature types
 * @return {PayloadAsyncAction} action
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
 * @return {PayloadAsyncAction} action
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
 * @return {PayloadAsyncAction} action
 */
export function create_munimap(options) {
  sendEvent('map', 'create');
  sendEventForOptions(options);

  return {
    type: CREATE_MUNIMAP,
  };
}

/**
 * @return {PayloadAsyncAction} action
 */
export function map_initialized() {
  return {
    type: MAP_INITIALIZED,
  };
}

/**
 * @param {{resolution: number}} object action object
 * @return {PayloadAsyncAction} action
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
 * @return {PayloadAsyncAction} action
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
 * @return {PayloadAsyncAction} action
 */
export function log_action_happened(object) {
  sendEvent(object.category, object.action);
  return {
    type: LOG_ACTION_HAPPENED,
  };
}

/**
 * @return {PayloadAsyncAction} action
 */
export function buildings_loaded() {
  return {
    type: BUILDINGS_LOADED,
  };
}

/**
 * @param {boolean} newSelectedIsActive newSelectedIsActive
 * @return {PayloadAsyncAction} action
 */
export function floors_loaded(newSelectedIsActive) {
  return {
    type: FLOORS_LOADED,
    payload: {newSelectedIsActive},
  };
}

/**
 * @param {string} roomType loaded room type
 * @return {PayloadAsyncAction} action
 */
export function rooms_loaded(roomType) {
  return {
    type: ROOMS_LOADED,
    payload: roomType,
  };
}

/**
 * @return {PayloadAsyncAction} action
 */
export function doors_loaded() {
  return {
    type: DOORS_LOADED,
  };
}

/**
 * @param {string} code new code (bldg, floor)
 * @return {PayloadAsyncAction} action
 */
export function selected_feature_changed(code) {
  return {
    type: SELECTED_FEATURE_CHANGED,
    payload: code,
  };
}

/**
 * @param {boolean} isMunimapActive whether is munimap el active in document
 * @return {PayloadAsyncAction} action
 */
export function target_touchmoved(isMunimapActive) {
  return {
    type: TARGET_TOUCHMOVED,
    payload: isMunimapActive,
  };
}

/**
 * @param {boolean} isMunimapActive whether is munimap el active in document
 * @return {PayloadAsyncAction} action
 */
export function target_wheeled(isMunimapActive) {
  return {
    type: TARGET_WHEELED,
    payload: isMunimapActive,
  };
}

/**
 * @return {PayloadAsyncAction} action
 */
export function target_focused() {
  return {
    type: TARGET_FOCUSED,
  };
}

/**
 * @return {PayloadAsyncAction} action
 */
export function target_blurred() {
  return {
    type: TARGET_BLURRED,
  };
}

/**
 * @return {PayloadAsyncAction} action
 */
export function pois_loaded() {
  return {
    type: POIS_LOADED,
  };
}

/**
 * @param {FeatureClickHandlerOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function buildingClicked(object) {
  return {
    type: BUILDING_CLICKED,
    payload: object,
  };
}

/**
 * @param {FeatureClickHandlerOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function complexClicked(object) {
  return {
    type: COMPLEX_CLICKED,
    payload: object,
  };
}

/**
 * @param {FeatureClickHandlerOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function clusterClicked(object) {
  return {
    type: CLUSTER_CLICKED,
    payload: object,
  };
}

/**
 * @param {FeatureClickHandlerOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function markerClicked(object) {
  return {
    type: MARKER_CLICKED,
    payload: object,
  };
}

/**
 * @param {FeatureClickHandlerOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function poiClicked(object) {
  return {
    type: POI_CLICKED,
    payload: object,
  };
}

/**
 * @param {FeatureClickHandlerOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function pubtranClicked(object) {
  return {
    type: PUBTRAN_CLICKED,
    payload: object,
  };
}

/**
 * @param {FeatureClickHandlerOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function roomClicked(object) {
  return {
    type: ROOM_CLICKED,
    payload: object,
  };
}

/**
 * @param {FeatureClickHandlerOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function doorClicked(object) {
  return {
    type: DOOR_CLICKED,
    payload: object,
  };
}

/**
 * @param {AnimationRequestOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function geolocationClicked(object) {
  return {
    type: GEOLOCATION_CLICKED,
    payload: object,
  };
}

/**
 * @return {PayloadAsyncAction} action
 */
export function popupClosed() {
  return {
    type: POPUP_CLOSED,
  };
}

/**
 * @return {PayloadAsyncAction} action
 */
export function identifyReseted() {
  sendEvent('identify-reset', 'click');
  return {
    type: IDENTIFY_RESETED,
  };
}

/**
 * @param {PointerMoveTimeoutOptions} object object
 * @return {PayloadAsyncAction} action
 */
export function pointerMoveTimeoutExpired(object) {
  return {
    type: POINTERMOVE_TIMEOUT_EXPIRED,
    payload: object,
  };
}

/**
 * @param {PointerMoveTimeoutOptions} [object] object
 * @return {PayloadAsyncAction} action
 */
export function tooltipCancelled(object) {
  return {
    type: TOOLTIP_CANCELLED,
    payload: object,
  };
}
