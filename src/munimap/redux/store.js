/**
 * @module redux/store
 */
import * as actions from './action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_utils from '../utils/utils.js';
import * as redux from 'redux';
import * as slctr from './selector.js';
import {asyncDispatchMiddleware} from './middleware.js';
import {changeSelected as changeSelectedFloor} from '../view/floor.js';
import {checkCustomMarker as checkCustomMarkerForMatomo} from '../matomo/matomo.js';
import {featuresFromParam} from '../load.js';
import {getSelectedFromFeatureOrCode} from '../view/view.js';
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
      // MARKERS_LOADED
      case actions.MARKERS_LOADED:
        return {
          ...state,
          markersTimestamp: Date.now(),
        };

      // ZOOMTO_LOADED
      case actions.ZOOMTO_LOADED:
        return {
          ...state,
          zoomToTimestamp: Date.now(),
        };

      // MAP_INITIALIZED
      case actions.MAP_INITIALIZED:
        return {
          ...state,
          mapInitialized: true,
        };

      // OL_MAP_VIEW_CHANGE
      case actions.OL_MAP_VIEW_CHANGE:
        return {
          ...state,
          center: action.payload.view.center,
          resolution: action.payload.view.resolution,
          mapSize: action.payload.view.mapSize,
        };

      //CREATE_MUNIMAP
      case actions.CREATE_MUNIMAP:
        if (slctr.loadMarkers(state)) {
          const requiredMarkers = state.requiredOpts.markerIds;
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
              checkCustomMarkerForMatomo(res);
              action.asyncDispatch({
                type: actions.MARKERS_LOADED,
                features: res,
              });
            }
          );
        }

        if (slctr.loadZoomTo(state)) {
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

      //BUILDINGS_LOADED
      case actions.BUILDINGS_LOADED:
        return {
          ...state,
          buildingsTimestamp: Date.now(),
        };

      //CHANGE_FLOOR
      case actions.CHANGE_FLOOR:
        const {
          selectedBuilding,
          selectedFloorCode,
        } = getSelectedFromFeatureOrCode(action.payload.featureOrCode, state);

        changeSelectedFloor(
          {
            buildingCode: selectedBuilding,
            floorCode: selectedFloorCode,
            activeFloors: slctr.getActiveFloorCodes(state),
          },
          action.asyncDispatch //=> set selected floor
        );

        return {
          ...state,
          selectedBuilding: selectedBuilding || null,
        };

      //SET_SELECTED_FLOOR
      case actions.SET_SELECTED_FLOOR:
        return {
          ...state,
          selectedFloor: action.payload.selectedFloor,
        };

      //DEAFULT
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
