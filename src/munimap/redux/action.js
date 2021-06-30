/**
 * @module redux/action
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
export const LOAD_MARKERS = 'LOAD_MARKERS';

/**
 * @type {string}
 * @const
 */
export const LOAD_ZOOMTO = 'LOAD_ZOOMTO';

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
export function load_markers() {
  return {
    type: LOAD_MARKERS,
  };
}

/**
 * @return {redux.AnyAction} action
 */
export function load_zoomTo() {
  return {
    type: LOAD_ZOOMTO,
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
