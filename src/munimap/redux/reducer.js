/**
 * @module redux/store
 */
import * as actions from './action.js';
import * as munimap_identify from '../identify/identify.js';
import * as munimap_load from '../load.js';
import * as munimap_range from '../utils/range.js';
import * as slctr from './selector.js';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.js';
import {INITIAL_STATE} from '../conf.js';
import {ROOM_TYPES} from '../feature/room.js';
import {getActiveStore as getActiveRoomStore} from '../source/room.js';
import {getAnimationRequest as getBuildingAnimationRequest} from '../view/building.js';
import {getStore as getBuildingStore} from '../source/building.js';
import {getAnimationRequest as getClusterAnimationRequest} from '../view/cluster.js';
import {getAnimationRequest as getComplexAnimationRequest} from '../view/complex.js';
import {getFeaturesTimestamps} from '../utils/reducer.js';
import {getAnimationRequest as getGeolocationAnimationRequest} from '../view/geolocation.js';
import {getAnimationRequest as getMarkerAnimationRequest} from '../view/marker.js';
import {getFloorCode as getMarkerFloorCode} from '../feature/marker.js';
import {getStore as getMarkerStore} from '../source/marker.js';
import {getAnimationRequest as getPoiAnimationRequest} from '../view/poi.js';
import {getPopupFeatureUid} from '../cluster/cluster.js';
import {getAnimationRequest as getPubTranAnimationRequest} from '../view/pubtran.stop.js';
import {getStore as getPubTranStore} from '../source/pubtran.stop.js';
import {getUid} from 'ol';
import {handleDoorClick} from '../feature/door.js';
import {handleMapViewChange} from '../view/view.js';
import {handleReset} from '../reset.js';
import {isCustom as isCustomMarker} from '../feature/marker.custom.js';
import {isSameCode} from '../feature/building.js';
/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("redux").Reducer} redux.Reducer
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 */

/**
 * @param {string} locationCode location code
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} payload payload
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const handleMarkerLocationCode = (
  locationCode,
  state,
  payload,
  asyncDispatch
) => {
  const featureUid = payload.featureUid;
  const pixelInCoords = payload.pixelInCoords;
  const targetId = slctr.getTargetId(state);
  const feature = getMarkerStore(targetId).getFeatureByUid(featureUid);
  const isIdentifyAllowed =
    slctr.isIdentifyEnabled(state) &&
    munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

  munimap_load.loadFloorsForMarker(locationCode, state, asyncDispatch);
  if (isIdentifyAllowed) {
    munimap_identify.handleCallback(
      slctr.getIdentifyCallback(state),
      asyncDispatch,
      targetId,
      {feature, pixelInCoords}
    );
  }
};

/**
 * @param {string} locationCode location code
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} payload payload
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const handleRoomLocationCode = (
  locationCode,
  state,
  payload,
  asyncDispatch
) => {
  const featureUid = payload.featureUid;
  const pixelInCoords = payload.pixelInCoords;
  const targetId = slctr.getTargetId(state);
  const feature = getActiveRoomStore(targetId).getFeatureByUid(featureUid);
  const isIdentifyAllowed =
    slctr.isIdentifyEnabled(state) &&
    munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

  munimap_load.loadFloorsForRoom(locationCode, state, asyncDispatch);
  if (isIdentifyAllowed) {
    munimap_identify.handleCallback(
      slctr.getIdentifyCallback(state),
      asyncDispatch,
      targetId,
      {feature, pixelInCoords}
    );
  }
};

/**
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} payload payload
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const handleIdentifyCallback = (state, payload, asyncDispatch) => {
  const featureUid = payload.featureUid;
  const pixelInCoords = payload.pixelInCoords;
  const targetId = slctr.getTargetId(state);
  const feature = getBuildingStore(targetId).getFeatureByUid(featureUid);
  munimap_identify.handleCallback(
    slctr.getIdentifyCallback(state),
    asyncDispatch,
    targetId,
    {feature, pixelInCoords}
  );
};

/**
 *
 * @param {State} initialState initial state
 * @return {redux.Reducer} reducer
 */
const createReducer = (initialState) => {
  return (state = initialState, action) => {
    let newState;
    let locationCode;
    let loadedTypes;
    let featuresTimestamps;
    let animationRequest;
    let feature;
    let isVisible;
    let isIdentifyAllowed;
    let targetId;
    let result;
    let uid;

    switch (action.type) {
      // MARKERS_LOADED
      case actions.MARKERS_LOADED:
        loadedTypes = action.payload;
        featuresTimestamps = getFeaturesTimestamps(state, loadedTypes);

        newState = {
          ...state,
          ...featuresTimestamps,
          markersTimestamp: Date.now(),
          optPoisTimestamp: loadedTypes.optPoi
            ? Date.now()
            : state.optPoisTimestamp,
        };

        if (slctr.areZoomToLoaded(newState)) {
          animationRequest = slctr.calculateAnimationRequest(newState);
          if (animationRequest) {
            newState.animationRequest = animationRequest;
          } else {
            newState.resetTimestamp = Date.now();
          }
        }
        return newState;

      // ZOOMTO_LOADED
      case actions.ZOOMTO_LOADED:
        loadedTypes = action.payload;
        featuresTimestamps = getFeaturesTimestamps(state, loadedTypes);
        newState = {
          ...state,
          ...featuresTimestamps,
          zoomToTimestamp: Date.now(),
        };

        if (slctr.areMarkersLoaded(newState)) {
          animationRequest = slctr.calculateAnimationRequest(newState);
          if (animationRequest) {
            newState.animationRequest = animationRequest;
          } else {
            newState.resetTimestamp = Date.now();
          }
        }
        return newState;

      // MAP_INITIALIZED
      case actions.MAP_INITIALIZED:
        return {
          ...state,
          mapInitialized: true,
        };

      //CREATE_MUNIMAP
      case actions.CREATE_MUNIMAP:
        if (slctr.loadMarkers(state)) {
          munimap_load.loadMarkers(state.requiredOpts, action.asyncDispatch);
        }

        if (slctr.loadZoomTo(state)) {
          munimap_load.loadZoomTo(
            state.requiredOpts.targetId,
            state.requiredOpts.zoomTo,
            action.asyncDispatch
          );
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
        if (floorCode) {
          munimap_load.loadFloorsByFloorLayer(
            {
              targetId: slctr.getTargetId(state),
              floorCode,
              newSelectedIsActive: action.payload.newSelectedIsActive,
            },
            action.asyncDispatch
          );
        }

        //new floor code or not changed old one
        result = floorCode || state.selectedFeature;
        return {
          ...state,
          floorsTimestamp: Date.now(),
          selectedFeature: result,
          popup: {
            ...state.popup,
            uid: isSameCode(result, state.selectedFeature)
              ? null
              : state.popup.uid,
          },
        };

      // OL_MAP_VIEW_CHANGE
      case actions.OL_MAP_VIEW_CHANGE:
        newState = {
          ...state,
          center: action.payload.view.center,
          resolution: action.payload.view.resolution,
          mapSize: action.payload.view.mapSize,
        };
        targetId = slctr.getTargetId(state);
        result = handleMapViewChange(targetId, newState, action.asyncDispatch);
        newState.selectedFeature =
          result !== undefined ? result : state.selectedFeature;
        return newState;

      //ROOMS_LOADED
      case actions.ROOMS_LOADED:
        const type = action.payload;
        return {
          ...state,
          defaultRoomsTimestamp:
            type === ROOM_TYPES.DEFAULT
              ? Date.now()
              : state.defaultRoomsTimestamp,
          activeRoomsTimestamp:
            type === ROOM_TYPES.ACTIVE
              ? Date.now()
              : state.activeRoomsTimestamp,
        };

      //DOORS_LOADED
      case actions.DOORS_LOADED:
        return {
          ...state,
          doorsTimestamp: Date.now(),
        };

      //SELECTED_FEATURE_CHANGED:
      case actions.SELECTED_FEATURE_CHANGED:
        const newValue = action.payload;
        const selectedFeature = state.selectedFeature;
        const isChanged = selectedFeature && selectedFeature !== newValue;
        if (isChanged) {
          const where = `polohKod LIKE '${newValue.substring(0, 5)}%'`;
          munimap_load
            .loadFloors(slctr.getTargetId(state), where)
            .then((floors) =>
              action.asyncDispatch(actions.floors_loaded(false))
            );
        }
        return {
          ...state,
          selectedFeature: isChanged ? newValue : state.selectedFeature,
          popup: {
            ...state.popup,
            uid: isChanged ? null : state.popup.uid,
          },
        };

      //TARGET_WHEELED
      case actions.TARGET_WHEELED:
        return {
          ...state,
          errorMessage: {
            ...state.errorMessage,
            render: action.payload,
            withMessage: true,
          },
        };

      //TARGET_TOUCHMOVED
      case actions.TARGET_TOUCHMOVED:
        return {
          ...state,
          errorMessage: {
            ...state.errorMessage,
            render: action.payload,
            withMessage: true,
          },
        };

      //TARGET_BLURRED
      case actions.TARGET_BLURRED:
        const invalidCodes = slctr.getInvalidCodes(state);
        const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
        const shouldBlockMap = !state.requiredOpts.simpleScroll;
        return {
          ...state,
          errorMessage: {
            ...state.errorMessage,
            render: hasInvalidCodes && !shouldBlockMap ? false : true,
            withMessage: false,
          },
        };

      //TARGET_FOCUSED
      case actions.TARGET_FOCUSED:
        return {
          ...state,
          errorMessage: {
            ...state.errorMessage,
            render: false,
            withMessage: false,
          },
        };

      //POIS_LOADED
      case actions.POIS_LOADED:
        return {
          ...state,
          poisTimestamp: Date.now(),
        };

      //GEOLOCATION_CLICKED
      case actions.GEOLOCATION_CLICKED:
        const center = action.payload || null;
        return {
          ...state,
          animationRequest: getGeolocationAnimationRequest(state, center),
        };

      //BUILDING_CLICKED
      case actions.BUILDING_CLICKED:
        feature = getBuildingStore(slctr.getTargetId(state)).getFeatureByUid(
          action.payload.featureUid
        );
        isVisible = munimap_range.contains(FLOOR_RESOLUTION, state.resolution);
        isIdentifyAllowed =
          slctr.isIdentifyEnabled(state) &&
          munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

        animationRequest = getBuildingAnimationRequest(state, action.payload);

        if (isIdentifyAllowed) {
          handleIdentifyCallback(state, action.payload, action.asyncDispatch);
        } else if (isVisible) {
          locationCode =
            feature.get('vychoziPodlazi') || feature.get('polohKod');
          if (locationCode) {
            munimap_load.loadFloorsForBuilding(
              locationCode,
              state,
              action.asyncDispatch
            );
          }
        }

        return {
          ...state,
          selectedFeature: isVisible
            ? locationCode || null
            : state.selectedFeature,
          animationRequest: animationRequest || state.animationRequest,
          popup: {
            ...state.popup,
            uid: null,
          },
        };

      //COMPLEX_CLICKED
      case actions.COMPLEX_CLICKED:
        animationRequest = getComplexAnimationRequest(state, action.payload);
        return {
          ...state,
          animationRequest,
        };

      //CLUSTER_CLICKED
      case actions.CLUSTER_CLICKED:
        animationRequest = getClusterAnimationRequest(state, action.payload);
        uid = getPopupFeatureUid(state, action.payload);
        if (animationRequest) {
          return {
            ...state,
            animationRequest,
            popup: {
              ...INITIAL_STATE.popup,
              uid: uid || INITIAL_STATE.popup.uid,
            },
          };
        }
        return {
          ...state,
          popup: {
            ...INITIAL_STATE.popup,
            uid: uid || INITIAL_STATE.popup.uid,
          },
        };

      //MARKER_CLICKED
      case actions.MARKER_CLICKED:
        feature = getMarkerStore(slctr.getTargetId(state)).getFeatureByUid(
          action.payload.featureUid
        );
        animationRequest = getMarkerAnimationRequest(state, action.payload);
        uid = !!feature.get('detail') && getUid(feature);

        if (!isCustomMarker(feature)) {
          locationCode = getMarkerFloorCode(feature);
          if (locationCode) {
            handleMarkerLocationCode(
              locationCode,
              state,
              action.payload,
              action.asyncDispatch
            );
          }
        }

        return {
          ...state,
          selectedFeature: locationCode || state.selectedFeature,
          animationRequest: animationRequest || state.animationRequest,
          popup: {
            ...INITIAL_STATE.popup,
            uid: uid || INITIAL_STATE.popup.uid,
          },
        };

      //POI_CLICKED
      case actions.POI_CLICKED:
        animationRequest = getPoiAnimationRequest(state, action.payload);
        return {
          ...state,
          animationRequest: animationRequest || state.animationRequest,
        };

      //PUBTRAN_CLICKED
      case actions.PUBTRAN_CLICKED:
        feature = getPubTranStore(slctr.getTargetId(state)).getFeatureByUid(
          action.payload.featureUid
        );
        animationRequest = getPubTranAnimationRequest(state, action.payload);
        uid = !!feature.get('nazev') && getUid(feature);

        return {
          ...state,
          animationRequest: animationRequest || state.animationRequest,
          popup: {
            ...INITIAL_STATE.popup,
            uid: uid || INITIAL_STATE.popup.uid,
          },
        };

      //ROOM_CLICKED
      case actions.ROOM_CLICKED:
        feature = getActiveRoomStore(slctr.getTargetId(state)).getFeatureByUid(
          action.payload.featureUid
        );
        locationCode = feature.get('polohKod')
          ? feature.get('polohKod').substring(0, 8)
          : null;
        uid = state.popup.uid;

        if (locationCode) {
          const wasOtherFloorSelected =
            state.selectedFeature &&
            locationCode.slice(0, 5) !== state.selectedFeature.slice(0, 5);
          if (wasOtherFloorSelected) {
            uid = null;
          }
          handleRoomLocationCode(
            locationCode,
            state,
            action.payload,
            action.asyncDispatch
          );
        }

        return {
          ...state,
          selectedFeature: locationCode,
          popup: {
            ...state.popup,
            uid,
          },
        };

      // DOOR_CLICKED
      case actions.DOOR_CLICKED:
        handleDoorClick(state, action.payload, action.asyncDispatch);
        return {
          ...state,
        };

      //POPUP_CLOSED
      case actions.POPUP_CLOSED:
        return {
          ...state,
          popup: {
            ...state.popup,
            uid: null,
          },
        };

      //IDENTIFY_RESET
      case actions.IDENTIFY_RESETED:
        munimap_identify.handleCallback(
          slctr.getIdentifyCallback(state),
          action.asyncDispatch,
          slctr.getTargetId(state)
        );
        return {
          ...state,
        };

      //RESET_MUNIMAP
      case actions.RESET_MUNIMAP:
        newState = handleReset(state, action.payload, action.asyncDispatch);
        return newState;

      //IDENTIFY_FEATURE_CHANGED
      case actions.IDENTIFY_FEATURE_CHANGED:
        return {
          ...state,
          identifyTimestamp: Date.now(),
        };

      // RESET_DONE
      case actions.RESET_DONE:
        return {
          ...state,
          resetTimestamp: Date.now(),
        };

      //DEAFULT
      default:
        return state;
    }
  };
};

export {createReducer};
