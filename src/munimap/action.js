import * as munimap_assert from './assert.js';
import * as munimap_utils from './utils.js';
import {featuresFromParam} from './load.js';
import {loadOrDecorateMarkers} from './create.js';

export const OL_MAP_VIEW_CHANGE = 'OL_MAP_VIEW_CHANGE';
export const OL_MAP_INITIALIZED = 'OL_MAP_INITIALIZED';
export const OL_MAP_MOVEEND = 'OL_MAP_MOVEEND';
export const CHANGE_INVALIDCODES_INFO = 'CHANGE_INVALIDCODES_INFO';
export const LOAD_MARKERS = 'LOAD_MARKERS';
export const MARKERS_LOADED = 'MARKERS_LOADED';
export const OL_MAP_RENDERED = 'OL_MAP_RENDERED';
export const ZOOMTO_LOADED = 'ZOOMTO_LOADED';
export const INITIALIZE_MAP = 'INITIALIZE_MAP';

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
  return (dispatch, getState) => {
    const state = getState();

    const requiredMarkers = state.requiredOpts.markers;
    let markerStrings;
    if (requiredMarkers && requiredMarkers.length) {
      munimap_assert.assertArray(requiredMarkers);
      munimap_utils.removeArrayDuplicates(requiredMarkers);
      markerStrings = /** @type {Array.<string>} */ (requiredMarkers);
    } else {
      markerStrings = /** @type {Array.<string>} */ ([]);
    }

    return loadOrDecorateMarkers(markerStrings, state.requiredOpts).then(
      (res) => {
        dispatch(markers_loaded());
      }
    );
  };
}

export function load_zoomTo() {
  return (dispatch, getState) => {
    const state = getState();

    let zoomToStrings;
    if (state.requiredOpts.zoomTo && state.requiredOpts.zoomTo.length) {
      zoomToStrings = /** @type {Array.<string>} */ (munimap_utils.isString(
        state.requiredOpts.zoomTo
      )
        ? [state.requiredOpts.zoomTo]
        : state.requiredOpts.zoomTo);
    } else {
      zoomToStrings = [];
    }

    if (zoomToStrings.length) {
      return featuresFromParam(zoomToStrings).then((res) => {
        dispatch(zoomTo_loaded());
      });
    } else {
      dispatch(zoomTo_loaded());
      return [];
    }
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

export function initMap(object) {
  return {
    type: INITIALIZE_MAP,
    payload: {
      initMap: object.initMap,
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
