export const OL_MAP_VIEW_CHANGE = 'OL_MAP_VIEW_CHANGE';
export const OL_MAP_INITIALIZED = 'OL_MAP_INITIALIZED';

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
    }
  }
}
