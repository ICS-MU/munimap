/**
 * @module redux/store
 */
import * as actions from './action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_matomo from '../matomo/matomo.js';
import * as munimap_utils from '../utils/utils.js';
import * as redux from 'redux';
import * as slctr from './selector.js';
import {asyncDispatchMiddleware} from './middleware.js';
import {featuresFromParam} from '../load.js';
import {loadOrDecorateMarkers} from '../create.js';

/**
 * @typedef {import("../conf.js").State} State
 */

/**
 *
 * @param {State} initialState initial state
 * @return {redux.Reducer<State, redux.AnyAction>} reducer
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

      //CREATE_MUNIMAP
      case actions.CREATE_MUNIMAP:
        if (slctr.loadMarkers(initialState)) {
          const requiredMarkers = state.requiredOpts.markers;
          let markerStrings;
          if (requiredMarkers && requiredMarkers.length) {
            munimap_assert.assertArray(requiredMarkers);
            munimap_utils.removeArrayDuplicates(requiredMarkers);
            markerStrings = /** @type {Array.<string>} */ (requiredMarkers);
          } else {
            markerStrings = /** @type {Array.<string>} */ ([]);
          }

          loadOrDecorateMarkers(markerStrings, state.requiredOpts).then(
            (res) => {
              munimap_assert.assertMarkerFeatures(res);
              munimap_matomo.checkCustomMarker(res);
              action.asyncDispatch({
                type: actions.MARKERS_LOADED,
                features: res,
              });
            }
          );
        }

        if (slctr.loadZoomTo(initialState)) {
          let zoomToStrings;
          if (state.requiredOpts.zoomTo && state.requiredOpts.zoomTo.length) {
            zoomToStrings = /**@type {Array.<string>}*/ (munimap_utils.isString(
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
        }
        return {
          ...state,
          markersTimestamp: 0,
          zoomToTimestamp: 0,
        };
      default:
        return state;
    }
  };
};

/**
 * @param {State} initialState initial state
 * @return {redux.Store} store
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
