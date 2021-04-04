export const OL_MAP_VIEW_CHANGE = 'OL_MAP_VIEW_CHANGE';

export function ol_map_view_change(object) {
  return {
    type: OL_MAP_VIEW_CHANGE,
    payload: {
      view: object,
    },
  };
}
