/**
 * @typedef {import("../create.js").Options} CreateOptions
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
export const OL_MAP_RENDERED = 'OL_MAP_RENDERED';

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
export const MATOMO_SEND = 'MATOMO_SEND';

/**
 * @type {string}
 * @const
 */
export const MATOMO_SEND_FOR_OPTS = 'MATOMO_SEND_FOR_OPTS';

/**
 * @typedef {import("redux").AnyAction} redux.AnyAction
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 */

/**
 * @return {redux.AnyAction} action
 */
export function markers_loaded() {
  return {
    type: MARKERS_LOADED,
  };
}

/**
 * @return {redux.AnyAction} action
 */
export function zoomTo_loaded() {
  return {
    type: ZOOMTO_LOADED,
  };
}

/**
 * @return {redux.AnyAction} action
 */
export function create_munimap() {
  return {
    type: CREATE_MUNIMAP,
  };
}

/**
 * @param {{map_size: ol.Size}} object action object
 * @return {redux.AnyAction} action
 */
export function map_rendered(object) {
  return {
    type: OL_MAP_RENDERED,
    payload: {
      map_size: object.map_size,
    },
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
 *    resolution: number
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
export function send_to_matomo(object) {
  return {
    type: MATOMO_SEND,
    payload: {
      category: object.category,
      action: object.action,
    },
  };
}

/**
 * @param {CreateOptions} options action object
 * @return {redux.AnyAction} action
 */
export function send_to_matomo_for_opts(options) {
  return {
    type: MATOMO_SEND_FOR_OPTS,
    payload: {
      options,
    },
  };
}
