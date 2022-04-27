/**
 * @module redux/reducer/reducer
 */
import * as actions from '../action.js';
import * as mm_load_fl from '../../load/feature/floor.js';
import * as mm_range from '../../utils/range.js';
import * as slctr from '../selector/selector.js';
import * as srcs from '../../source/constants.js';
import {EventType} from '../../view/constants.js';
import {FLOOR_RESOLUTION} from '../../feature/constants.js';
import {INITIAL_STATE} from '../../conf.js';
import {getAnimationRequest as getBuildingAnimationRequest} from './building.js';
import {getAnimationRequest as getClusterAnimationRequest} from './cluster.js';
import {getAnimationRequest as getComplexAnimationRequest} from './complex.js';
import {getEventByType} from '../../view/utils.js';
import {
  getFeaturesByPriority,
  getPopupFeatureUid,
} from '../../feature/cluster.js';
import {getAnimationRequest as getGeolocationAnimationRequest} from './geolocation.js';
import {getAnimationRequest as getMarkerAnimationRequest} from './marker.js';
import {getFloorCode as getMarkerFloorCode} from '../../feature/marker.js';
import {getAnimationRequest as getPoiAnimationRequest} from './poi.js';
import {getAnimationRequest as getPubTranAnimationRequest} from './pubtran.stop.js';
import {getUid} from 'ol';
import {getViewOptions} from './utils.js';
import {handleOnClickCallback as handleFeatureOnClickCallback} from '../../feature/feature.js';
import {
  handleIdentifyCallback,
  handleIdentifyCallbackByOptions,
} from './identify.js';
import {handleMapViewChange} from '../../view/view.js';
import {handleReset} from '../../reset.js';
import {isCustomMarker} from '../../feature/utils.js';
import {isSameCode} from '../../feature/building.js';
import {loadMarkers, loadZoomTo} from '../../load/feature/marker.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("redux").Reducer} redux.Reducer
 */

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
    let animationRequest;
    let feature;
    let isVisible;
    let targetId;
    let result;
    let uid;
    let callbackResult;
    let callbackId;

    switch (action.type) {
      // MARKERS_LOADED
      case actions.MARKERS_LOADED:
        loadedTypes = action.payload;

        newState = {
          ...state,
          buildingsTimestamp: Object.values(loadedTypes).some((t) => t)
            ? Date.now()
            : state.buildingsTimestamp,
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
        newState = {
          ...state,
          buildingsTimestamp: Object.values(loadedTypes).some((t) => t)
            ? Date.now()
            : state.buildingsTimestamp,
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
          loadMarkers(state.requiredOpts, action.asyncDispatch);
        }

        if (slctr.loadZoomTo(state)) {
          loadZoomTo(
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
          mm_load_fl.loadFloorsByFloorLayer(
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

      //SELECTED_FEATURE_CHANGED:
      case actions.SELECTED_FEATURE_CHANGED:
        const newValue = action.payload;
        const selectedFeature = state.selectedFeature;
        const isChanged = selectedFeature && selectedFeature !== newValue;
        if (isChanged) {
          const where = `polohKod LIKE '${newValue.substring(0, 5)}%'`;
          mm_load_fl
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

        callbackId = handleIdentifyCallbackByOptions({
          state,
          feature,
          pixelInCoords: action.payload.pixelInCoords,
        });
        if (isVisible) {
          locationCode =
            feature.get('vychoziPodlazi') || feature.get('polohKod');
          if (locationCode) {
            mm_load_fl.loadFloorsForBuilding(
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
          identifyTimestamp: callbackId ? Date.now() : state.identifyTimestamp,
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
        callbackResult = handleFeatureOnClickCallback(
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
        callbackResult = handleFeatureOnClickCallback(
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
          state: newState,
          feature,
          ...callbackResult,
          pixelInCoords: action.payload.pixelInCoords,
        });
        newState.animationRequest = animationRequest || state.animationRequest;

        if (!isCustomMarker(feature)) {
          locationCode = getMarkerFloorCode(feature);
          if (locationCode) {
            callbackId = handleIdentifyCallbackByOptions({
              state,
              feature,
              pixelInCoords: action.payload.pixelInCoords,
            });
            if (!callbackId) {
              mm_load_fl.loadFloorsForMarker(
                locationCode,
                state,
                action.asyncDispatch
              );
            }
          }
        }
        newState.selectedFeature = locationCode || state.selectedFeature;
        newState.identifyTimestamp = callbackId
          ? Date.now()
          : newState.identifyTimestamp;
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
          mm_load_fl.loadFloorsForRoom(
            locationCode,
            state,
            action.asyncDispatch
          );
          callbackId = handleIdentifyCallbackByOptions({
            state,
            feature,
            pixelInCoords: action.payload.pixelInCoords,
          });
        }

        return {
          ...state,
          selectedFeature: locationCode,
          popup: {
            ...state.popup,
            uid,
          },
          identifyTimestamp: callbackId ? Date.now() : state.identifyTimestamp,
        };

      // DOOR_CLICKED
      case actions.DOOR_CLICKED:
        feature = srcs
          .getActiveDoorStore(slctr.getTargetId(state))
          .getFeatureByUid(action.payload.featureUid);

        callbackId = handleIdentifyCallbackByOptions({
          state,
          feature,
          pixelInCoords: action.payload.pixelInCoords,
        });
        return {
          ...state,
          identifyTimestamp: callbackId ? Date.now() : state.identifyTimestamp,
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
        handleIdentifyCallback(
          slctr.getIdentifyCallback(state),
          slctr.getTargetId(state)
        );
        return {
          ...state,
          identifyTimestamp: Date.now(),
        };

      //RESET_MUNIMAP
      case actions.RESET_MUNIMAP:
        newState = handleReset(state, action.payload, action.asyncDispatch);
        return newState;

      // ANIMATION_FINISHED_AFTER_RESET
      case actions.ANIMATION_FINISHED_AFTER_RESET:
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
