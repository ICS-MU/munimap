import * as actions from './action.js';
import * as munimap_utils from './utils.js';
import * as redux from 'redux';
import {getPairedBasemap, isArcGISBasemap, isOSMBasemap} from './basemap.js';

/**
 * @typedef {import("./conf.js").State} State
 */

/**
 *
 * @param {State} initialState initial state
 * @return {any} State
 */
const createReducer = (initialState) => {
  return (state = initialState, action) => {
    switch (action.type) {
      case actions.OL_MAP_VIEW_CHANGE:
        return {
          ...state,
          zoom: action.payload.view.zoom,
          center: action.payload.view.center,
          center_proj: action.payload.view.center_proj,
        };
      case actions.OL_MAP_INITIALIZED:
        return {
          ...state,
          loadingMessage: action.payload.props.loadingMessage,
        };
      case actions.CHANGE_INVALIDCODES_INFO:
        return {
          ...state,
          invalidCodesInfo: action.payload.invalidCodesInfo,
        };
      case actions.OL_MAP_MOVEEND:
        //restriction to zoom 12 and latitude 60°N/S
        const inSafeLatLonRange = munimap_utils.inRange(
          action.payload.center[1],
          -8399737.89, //60° N
          8399737.89 //60° S
        );
        const isSafeResolutionRange = munimap_utils.inRange(
          action.payload.resolution,
          38.21851414258813,
          Infinity
        );

        const switchToOSM =
          isArcGISBasemap(state.baseMap) &&
          !isSafeResolutionRange &&
          !inSafeLatLonRange;
        const switchToArcGIS =
          isOSMBasemap(state.baseMap) &&
          action.payload.defaultBaseMap !== state.baseMap &&
          (isSafeResolutionRange || inSafeLatLonRange);

        const baseMapId =
          switchToOSM || switchToArcGIS
            ? getPairedBasemap(state.baseMap)
            : state.baseMap;

        return {
          ...state,
          baseMap: baseMapId,
        };
      default:
        return state;
    }
  };
};

/**
 * @param {State} initialState initial state
 * @return {any} store
 */
export const createStore = (initialState) => {
  const reducer = createReducer(initialState);
  const w = /** @type any */ (window);

  const store = redux.createStore(
    reducer,
    initialState,
    w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__()
  );
  return store;
};
