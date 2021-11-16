/**
 * @module redux/store
 */
import * as actions from './action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_utils from '../utils/utils.js';
import * as redux from 'redux';
import * as slctr from './selector.js';
import {Feature} from 'ol';
import {ROOM_TYPES, isRoom} from '../feature/room.js';
import {asyncDispatchMiddleware} from './middleware.js';
import {
  clearFloorBasedStores,
  refreshFloorBasedStores,
} from '../source/source.js';
import {featuresFromParam, loadFloors} from '../load.js';
import {
  getFloorLayerIdByCode,
  isCode as isFloorCode,
} from '../feature/floor.js';
import {isBuilding} from '../feature/building.js';
import {isDoor} from '../feature/door.js';
import {loadOrDecorateMarkers} from '../create.js';
import {setBuildingTitle} from '../view/info.js';

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
    let newState;
    let loadedTypes;

    switch (action.type) {
      // MARKERS_LOADED
      case actions.MARKERS_LOADED:
        loadedTypes = action.payload;
        return {
          ...state,
          markersTimestamp: Date.now(),
          buildingsTimestamp: Object.values(loadedTypes).some((t) => t)
            ? Date.now()
            : state.buildingsTimestamp,
          defaultRoomsTimestamp: loadedTypes.room
            ? Date.now()
            : state.defaultRoomsTimestamp,
          doorsTimestamp: loadedTypes.door ? Date.now() : state.doorsTimestamp,
        };

      // ZOOMTO_LOADED
      case actions.ZOOMTO_LOADED:
        loadedTypes = action.payload;
        return {
          ...state,
          zoomToTimestamp: Date.now(),
          buildingsTimestamp: Object.values(loadedTypes).some((t) => t)
            ? Date.now()
            : state.buildingsTimestamp,
          defaultRoomsTimestamp: loadedTypes.room
            ? Date.now()
            : state.defaultRoomsTimestamp,
          doorsTimestamp: loadedTypes.door ? Date.now() : state.doorsTimestamp,
        };

      // MAP_INITIALIZED
      case actions.MAP_INITIALIZED:
        return {
          ...state,
          mapInitialized: true,
        };

      //CREATE_MUNIMAP
      case actions.CREATE_MUNIMAP:
        if (slctr.loadMarkers(state)) {
          const requiredMarkers = state.requiredOpts.markerIds;
          let markerStrings;
          if (requiredMarkers && requiredMarkers.length) {
            munimap_assert.assertArray(requiredMarkers);
            munimap_utils.removeArrayDuplicates(requiredMarkers);
            markerStrings = /** @type {Array<string>} */ (requiredMarkers);
          } else {
            markerStrings = /** @type {Array<string>} */ ([]);
          }

          loadOrDecorateMarkers(markerStrings, state.requiredOpts).then(
            (res) => {
              munimap_assert.assertMarkerFeatures(res);

              const loadedTypes = {
                building: res.some(
                  (f) => f instanceof Feature && isBuilding(f)
                ),
                room: res.some((f) => f instanceof Feature && isRoom(f)),
                door: res.some((f) => f instanceof Feature && isDoor(f)),
              };

              action.asyncDispatch(actions.markers_loaded(res, loadedTypes));
            }
          );
        }

        if (slctr.loadZoomTo(state)) {
          let zoomToStrings;
          if (state.requiredOpts.zoomTo && state.requiredOpts.zoomTo.length) {
            zoomToStrings = /**@type {Array<string>}*/ (
              munimap_utils.isString(state.requiredOpts.zoomTo)
                ? [state.requiredOpts.zoomTo]
                : state.requiredOpts.zoomTo
            );
          } else {
            zoomToStrings = [];
          }
          featuresFromParam(zoomToStrings).then((res) => {
            const loadedTypes = {
              building: res.some((f) => f instanceof Feature && isBuilding(f)),
              room: res.some((f) => f instanceof Feature && isRoom(f)),
              door: res.some((f) => f instanceof Feature && isDoor(f)),
            };
            action.asyncDispatch(actions.zoomTo_loaded(loadedTypes));
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

      //FLOORS_LOADED
      case actions.FLOORS_LOADED:
        const floorCode = slctr.calculateSelectedFloor(state);
        const newSelectedIsActive = action.payload.newSelectedIsActive;
        let result;
        let flId;
        if (floorCode) {
          result = floorCode;
          flId = getFloorLayerIdByCode(floorCode);

          if (!newSelectedIsActive) {
            const where = 'vrstvaId = ' + flId;
            loadFloors(where).then((floors) => {
              if (floors) {
                refreshFloorBasedStores();
              }
              action.asyncDispatch(actions.floors_loaded(true));
            });
          }
        } else {
          //selected feature has not been changed
          result = state.selectedFeature;
        }

        return {
          ...state,
          floorsTimestamp: Date.now(),
          selectedFeature: result,
        };

      // OL_MAP_VIEW_CHANGE
      case actions.OL_MAP_VIEW_CHANGE:
        newState = {
          ...state,
          center: action.payload.view.center,
          resolution: action.payload.view.resolution,
          mapSize: action.payload.view.mapSize,
        };
        const locationCode = slctr.getSelectedLocationCode(newState);
        if (locationCode !== undefined) {
          //null is valid value
          if (locationCode !== null) {
            //set to state - it can be building/floor code
            newState.selectedFeature = locationCode;

            const titleOpts = slctr.getBuildingTitle(newState);
            setBuildingTitle(state.requiredOpts.target, titleOpts);

            const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
            loadFloors(where).then((floors) =>
              action.asyncDispatch(
                actions.floors_loaded(isFloorCode(locationCode))
              )
            );
          } else {
            //deselect feature from state
            newState.selectedFeature = null;

            const titleOpts = slctr.getBuildingTitle(newState);
            setBuildingTitle(state.requiredOpts.target, titleOpts);

            clearFloorBasedStores();
          }
        }
        return newState;

      //ROOMS_LOADED
      case actions.ROOMS_LOADED:
        const type = action.payload;
        if (type === ROOM_TYPES.DEFAULT) {
          return {
            ...state,
            defaultRoomsTimestamp: Date.now(),
          };
        } else if (type === ROOM_TYPES.ACTIVE) {
          return {
            ...state,
            activeRoomsTimestamp: Date.now(),
          };
        }
        return state;

      //DOORS_LOADED
      case actions.DOORS_LOADED:
        return {
          ...state,
          doorsTimestamp: Date.now(),
        };

      //NEW_FLOOR_SELECTED:
      case actions.NEW_FLOOR_SELECTED:
        newState = {
          ...state,
          selectedFeature: action.payload,
        };
        refreshFloorBasedStores();
        return newState;

      //FLOOR_SELECT_CHANGED:
      case actions.FLOOR_SELECT_CHANGED:
        const newValue = action.payload;
        const selectedFeature = state.selectedFeature;
        newState = {
          ...state,
        };
        if (selectedFeature && selectedFeature !== newValue) {
          newState.selectedFeature = newValue;
          const where = `polohKod LIKE '${newValue.substring(0, 5)}%'`;
          loadFloors(where).then((floors) =>
            action.asyncDispatch(actions.floors_loaded(false))
          );
          // if (jpad.func.isDef(identifyCallback)) {
          //   munimap.identify.refreshVisibility(map, newLocCode);
          // }
        }
        return newState;

      //TARGET_WHEELED
      //TARGET_TOUCHMOVED
      //TARGET_BLURRED
      //TARGET_FOCUSED
      case actions.TARGET_WHEELED:
      case actions.TARGET_TOUCHMOVED:
      case actions.TARGET_BLURRED:
      case actions.TARGET_FOCUSED:
        return {
          ...state,
          errorMessage: {
            ...state.errorMessage,
            render: action.payload.render,
            withMessage: action.payload.withMessage,
          },
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

  const reduxToolsExt =
    w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__();
  let enhancer;
  if (reduxToolsExt) {
    enhancer = redux.compose(
      redux.applyMiddleware(asyncDispatchMiddleware),
      w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__()
    );
  } else {
    enhancer = redux.applyMiddleware(asyncDispatchMiddleware);
  }

  const store = redux.createStore(reducer, initialState, enhancer);
  return store;
};
