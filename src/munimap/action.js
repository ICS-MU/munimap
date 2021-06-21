export const OL_MAP_VIEW_CHANGE = 'OL_MAP_VIEW_CHANGE';
export const OL_MAP_INITIALIZED = 'OL_MAP_INITIALIZED';
export const OL_MAP_MOVEEND = 'OL_MAP_MOVEEND';
export const CHANGE_INVALIDCODES_INFO = 'CHANGE_INVALIDCODES_INFO';
export const LOAD_MARKERS = 'LOAD_MARKERS';
export const LOAD_ZOOMTOS = 'LOAD_ZOOMTOS';
export const MARKERS_LOADED = 'MARKERS_LOADED';
export const OL_MAP_RENDERED = 'OL_MAP_RENDERED';
export const ZOOMTO_LOADED = 'ZOOMTO_LOADED';

export function markers_loaded() {
  return {
    type: MARKERS_LOADED,
  };
}

export function zoomTo_loaded() {
  return {
    type: ZOOMTO_LOADED,
  };
}

export function load_markers() {
  return {
    type: LOAD_MARKERS,
  };
}

export function load_zoomTo() {
  return {
    type: LOAD_ZOOMTOS,
  };
}

export function map_rendered(object) {
  return {
    type: OL_MAP_RENDERED,
    payload: {
      map_size: object.map_size,
    },
  };
}

export function ol_map_view_change(object) {
  return {
    type: OL_MAP_VIEW_CHANGE,
    payload: {
      view: object,
    },
  };
}

export function ol_map_initialized(object) {
  return {
    type: OL_MAP_INITIALIZED,
    payload: {
      props: object,
    },
  };
}

export function change_invalidcodes_info(object) {
  return {
    type: CHANGE_INVALIDCODES_INFO,
    payload: {
      invalidCodesInfo: object,
    },
  };
}

export function ol_map_moveend(object) {
  return {
    type: OL_MAP_MOVEEND,
    payload: object,
  };
}
