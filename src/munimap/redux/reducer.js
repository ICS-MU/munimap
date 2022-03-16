/**
 * @module redux/store
 */
import * as actions from './action.js';
import * as mm_identify from '../identify/identify.js';
import * as mm_load from '../load.js';
import * as mm_range from '../utils/range.js';
import * as slctr from './selector.js';
import * as srcs from '../source/_constants.js';
import {EventType} from '../view/_constants.js';
import {FLOOR_RESOLUTION, RoomTypes} from '../feature/_constants.js';
import {INITIAL_STATE} from '../conf.js';
import {getAnimationRequest as getBuildingAnimationRequest} from '../view/building.js';
import {getAnimationRequest as getClusterAnimationRequest} from '../view/cluster.js';
import {getAnimationRequest as getComplexAnimationRequest} from '../view/complex.js';
import {getEventByType} from '../view/_constants.functions.js';
import {getFeaturesByPriority, getPopupFeatureUid} from '../cluster/cluster.js';
import {getFeaturesTimestamps} from '../utils/reducer.js';
import {getAnimationRequest as getGeolocationAnimationRequest} from '../view/geolocation.js';
import {getAnimationRequest as getMarkerAnimationRequest} from '../view/marker.js';
import {getFloorCode as getMarkerFloorCode} from '../feature/marker.js';
import {getAnimationRequest as getPoiAnimationRequest} from '../view/poi.js';
import {getAnimationRequest as getPubTranAnimationRequest} from '../view/pubtran.stop.js';
import {getUid} from 'ol';
import {handleDoorClick} from '../feature/door.js';
import {handleMapViewChange} from '../view/view.js';
import {handleOnClickCallback} from '../feature/feature.js';
import {handleReset} from '../reset.js';
import {isCustomMarker} from '../feature/_constants.functions.js';
import {isSameCode} from '../feature/building.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("redux").Reducer} redux.Reducer
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("../utils/animation.js").ViewOptions} ViewOptions
 * @typedef {import("../style/icon.js").IconOptions} IconOptions
 * @typedef {import("../feature/_constants.js").CustomMarkerOnClickAnimationOptions} CustomMarkerOnClickAnimationOptions
 * @typedef {import("../feature/feature.js").OnClickFunction} CustomMarkerOnClickFn
 * @typedef {import("../feature/feature.js").OnClickOptions} CustomMarkerOnClickOpts
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("../view/marker.js").MarkerAnimRequestOptions} MarkerAnimRequestOptions
 */

/**
 * @typedef {Object} IdentifyCallbackOptions
 * @property {ol.Feature} feature feature
 * @property {ol.coordinate.Coordinate} pixelInCoords pixelInCoords
 * @property {State} state state
 * @property {redux.Dispatch} asyncDispatch asyncDispatch
 * @property {string} [locationCode] locationCode
 */

/**
 * @param {IdentifyCallbackOptions} options opts
 */
const handleIdentifyCallback = (options) => {
  const {feature, pixelInCoords, state, asyncDispatch} = options;
  const targetId = slctr.getTargetId(state);
  const isIdentifyAllowed =
    slctr.isIdentifyEnabled(state) &&
    mm_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

  if (isIdentifyAllowed) {
    mm_identify.handleCallback(
      slctr.getIdentifyCallback(state),
      asyncDispatch,
      targetId,
      {feature, pixelInCoords}
    );
  }
};

/**
 * @param {IdentifyCallbackOptions} options opts
 */
const handleMarkerLocationCode = (options) => {
  const {locationCode, state, asyncDispatch} = options;
  mm_load.loadFloorsForMarker(locationCode, state, asyncDispatch);
  handleIdentifyCallback(options);
};

/**
 * @param {IdentifyCallbackOptions} options opts
 */
const handleRoomLocationCode = (options) => {
  const {locationCode, state, asyncDispatch} = options;
  mm_load.loadFloorsForRoom(locationCode, state, asyncDispatch);
  handleIdentifyCallback(options);
};

/**
 * @param {State} state state
 * @return {ViewOptions} result
 */
const getViewOptions = (state) => {
  return {
    rotation: slctr.getRotation(state),
    size: slctr.getSize(state),
    extent: slctr.getExtent(state),
    resolution: slctr.getResolution(state),
  };
};

/**
 * @param {State} state state
 * @param {ol.Feature} feature feature
 * @return {MarkerAnimRequestOptions} opts
 */
const getMarkerAnimRequestOptions = (state, feature) => {
  return {
    ...getViewOptions(state),
    feature,
    popupCoords: slctr.getPopupPositionInCoords(state),
    isIdentifyAllowed:
      slctr.isIdentifyEnabled(state) &&
      mm_identify.isAllowed(feature, state.requiredOpts.identifyTypes),
  };
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
    let targetId;
    let result;
    let uid;
    let callbackResult;

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
          mm_load.loadMarkers(state.requiredOpts, action.asyncDispatch);
        }

        if (slctr.loadZoomTo(state)) {
          mm_load.loadZoomTo(
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
          mm_load.loadFloorsByFloorLayer(
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
        result = handleMapViewChange(
          targetId,
          action.asyncDispatch,
          slctr.getSelectedLocationCode(newState)
        );
        newState.selectedFeature =
          result !== undefined ? result : state.selectedFeature;
        return newState;

      //ROOMS_LOADED
      case actions.ROOMS_LOADED:
        const type = action.payload;
        return {
          ...state,
          defaultRoomsTimestamp:
            type === RoomTypes.DEFAULT
              ? Date.now()
              : state.defaultRoomsTimestamp,
          activeRoomsTimestamp:
            type === RoomTypes.ACTIVE ? Date.now() : state.activeRoomsTimestamp,
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
          mm_load
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
        const noGeomCodes = slctr.getNoGeomCodes(state);
        const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
        const hasNoGeom = noGeomCodes && noGeomCodes.length > 0;
        const shouldBlockMap = !state.requiredOpts.simpleScroll;
        return {
          ...state,
          errorMessage: {
            ...state.errorMessage,
            render:
              (hasInvalidCodes || hasNoGeom) && !shouldBlockMap ? false : true,
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
        feature = srcs
          .getBuildingStore(slctr.getTargetId(state))
          .getFeatureByUid(action.payload.featureUid);
        isVisible = mm_range.contains(FLOOR_RESOLUTION, state.resolution);
        animationRequest = getBuildingAnimationRequest(state, action.payload);

        handleIdentifyCallback({
          state,
          feature,
          pixelInCoords: action.payload.pixelInCoords,
          asyncDispatch: action.asyncDispatch,
        });
        if (isVisible) {
          locationCode =
            feature.get('vychoziPodlazi') || feature.get('polohKod');
          if (locationCode) {
            mm_load.loadFloorsForBuilding(
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
        const features = getFeaturesByPriority(
          slctr.getTargetId(state),
          action.payload.featureUid,
          slctr.getRequiredClusterOptions(state)
        );
        uid = getPopupFeatureUid(features);
        callbackResult = handleOnClickCallback(
          features[0],
          {centerToFeature: false, zoomToFeature: true},
          getEventByType(EventType.CLICK, slctr.getTargetId(state))
        );

        newState = {
          ...state,
          popup: {
            ...INITIAL_STATE.popup,
            uid: uid || INITIAL_STATE.popup.uid,
          },
        };
        animationRequest = getClusterAnimationRequest({
          clusteredFeatures: features,
          popupCoords: slctr.getPopupPositionInCoords(newState),
          ...callbackResult,
          ...getViewOptions(state),
        });
        newState.animationRequest = animationRequest || state.animationRequest;
        return newState;

      //MARKER_CLICKED
      case actions.MARKER_CLICKED:
        feature = srcs
          .getMarkerStore(slctr.getTargetId(state))
          .getFeatureByUid(action.payload.featureUid);
        callbackResult = handleOnClickCallback(
          feature,
          {centerToFeature: true, zoomToFeature: true},
          getEventByType(EventType.CLICK, slctr.getTargetId(state))
        );

        newState = {
          ...state,
          popup: {
            ...INITIAL_STATE.popup,
            uid:
              (!!feature.get('detail') && action.payload.featureUid) ||
              INITIAL_STATE.popup.uid,
          },
        };

        animationRequest = getMarkerAnimationRequest({
          ...getMarkerAnimRequestOptions(newState, feature),
          ...callbackResult,
          pixelInCoords: action.payload.pixelInCoords,
        });
        newState.animationRequest = animationRequest || state.animationRequest;

        if (!isCustomMarker(feature)) {
          locationCode = getMarkerFloorCode(feature);
          if (locationCode) {
            handleMarkerLocationCode({
              locationCode,
              state,
              feature,
              pixelInCoords: action.payload.pixelInCoords,
              asyncDispatch: action.asyncDispatch,
            });
          }
        }
        newState.selectedFeature = locationCode || state.selectedFeature;
        return newState;

      //POI_CLICKED
      case actions.POI_CLICKED:
        animationRequest = getPoiAnimationRequest(state, action.payload);
        return {
          ...state,
          animationRequest: animationRequest || state.animationRequest,
        };

      //PUBTRAN_CLICKED
      case actions.PUBTRAN_CLICKED:
        feature = srcs
          .getPubTranStore(slctr.getTargetId(state))
          .getFeatureByUid(action.payload.featureUid);
        animationRequest = getPubTranAnimationRequest({
          featureUid: action.payload.featureUid,
          targetId: slctr.getTargetId(state),
          ...getViewOptions(state),
        });
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
        feature = srcs
          .getActiveRoomStore(slctr.getTargetId(state))
          .getFeatureByUid(action.payload.featureUid);
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
          handleRoomLocationCode({
            locationCode,
            state,
            feature,
            pixelInCoords: action.payload.pixelInCoords,
            asyncDispatch: action.asyncDispatch,
          });
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
        handleDoorClick(
          {
            ...action.payload,
            targetId: slctr.getTargetId(state),
            isIdentifyEnabled: slctr.isIdentifyEnabled(state),
            identifyCallback: slctr.getIdentifyCallback(state),
            identifyTypes: state.requiredOpts.identifyTypes,
          },
          action.asyncDispatch
        );
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
        mm_identify.handleCallback(
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
