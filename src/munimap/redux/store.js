/**
 * @module redux/store
 */
import * as actions from './action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_matomo from '../matomo/matomo.js';
import * as munimap_utils from '../utils/utils.js';
import * as redux from 'redux';
import {asyncDispatchMiddleware} from './middleware.js';
import {featuresFromParam} from '../load.js';
import {
  getPairedBasemap,
  isArcGISBasemap,
  isOSMBasemap,
} from '../layer/basemap.js';
import {loadOrDecorateMarkers} from '../create.js';

/**
 * @typedef {import("../conf.js").State} State
 */

/**
 *
 * @param {State} initialState initial state
 * @return {any} State
 */
const createReducer = (initialState) => {
  return (state = initialState, action) => {
    switch (action.type) {
      case actions.MARKERS_LOADED:
        return {
          ...state,
          markersTimestamp: Date.now(),
        };
      case actions.ZOOMTO_LOADED:
        return {
          ...state,
          zoomToTimestamp: Date.now(),
        };
      case actions.OL_MAP_RENDERED:
        return {
          ...state,
          map_size: action.payload.map_size,
        };
      case actions.OL_MAP_VIEW_CHANGE:
        return {
          ...state,
          center: action.payload.view.center,
          resolution: action.payload.view.resolution,
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
      case actions.LOAD_MARKERS:
        const requiredMarkers = state.requiredOpts.markers;
        let markerStrings;
        if (requiredMarkers && requiredMarkers.length) {
          munimap_assert.assertArray(requiredMarkers);
          munimap_utils.removeArrayDuplicates(requiredMarkers);
          markerStrings = /** @type {Array.<string>} */ (requiredMarkers);
        } else {
          markerStrings = /** @type {Array.<string>} */ ([]);
        }

        loadOrDecorateMarkers(markerStrings, state.requiredOpts).then((res) => {
          munimap_assert.assertMarkerFeatures(res);
          munimap_matomo.checkCustomMarker(res);
          action.asyncDispatch({type: actions.MARKERS_LOADED, features: res});
        });
        return {
          ...state,
          markersTimestamp: 0,
        };
      case actions.LOAD_ZOOMTO:
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
        featuresFromParam(zoomToStrings).then((res) => {
          action.asyncDispatch({type: actions.ZOOMTO_LOADED, features: res});
        });
        return {
          ...state,
          zoomToTimestamp: 0,
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
    redux.compose(
      redux.applyMiddleware(asyncDispatchMiddleware),
      w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__()
    )
  );
  return store;
};
