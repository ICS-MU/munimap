export const OL_MAP_VIEW_CHANGE = 'OL_MAP_VIEW_CHANGE';
export const OL_MAP_INITIALIZED = 'OL_MAP_INITIALIZED';
export const OL_MAP_MOVEEND = 'OL_MAP_MOVEEND';
export const CHANGE_INVALIDCODES_INFO = 'CHANGE_INVALIDCODES_INFO';

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
