/**
 * @module redux/store
 */
import * as actions from './action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_identify from '../identify/identify.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import * as ol_extent from 'ol/extent';
import * as redux from 'redux';
import * as slctr from './selector.js';
import {
  ID_FIELD_NAME as COMPLEX_ID_FIELD_NAME,
  RESOLUTION as COMPLEX_RESOLUTION,
} from '../feature/complex.js';
import {RESOLUTION as DOOR_RESOLUTION, isDoor} from '../feature/door.js';
import {
  RESOLUTION as FLOOR_RESOLUTION,
  getFloorLayerIdByCode,
  isCode as isFloorCode,
} from '../feature/floor.js';
import {Feature, getUid} from 'ol';
import {INITIAL_STATE} from '../conf.js';
import {ROOM_TYPES, isRoom} from '../feature/room.js';
import {asyncDispatchMiddleware} from './middleware.js';
import {calculateParameters as calculateTooltipParameters} from '../view/tooltip.js';
import {
  clearFloorBasedStores,
  refreshFloorBasedStores,
} from '../source/source.js';
import {
  createStore as createIdentifyStore,
  getStore as getIdentifyStore,
} from '../source/identify.js';
import {
  ofFeature as extentOfFeature,
  ofFeatures as extentOfFeatures,
} from '../utils/extent.js';
import {featuresFromParam, loadFloors} from '../load.js';
import {getActiveStore as getActiveDoorStore} from '../source/door.js';
import {getActiveStore as getActivePoiStore} from '../source/poi.js';
import {getActiveStore as getActiveRoomStore} from '../source/room.js';
import {getAnimationDuration} from '../utils/animation.js';
import {getAnimationRequestParams} from '../utils/animation.js';
import {getStore as getBuildingStore} from '../source/building.js';
import {getClosestPointToPixel} from '../feature/feature.js';
import {getStore as getClusterStore} from '../source/cluster.js';
import {getStore as getComplexStore} from '../source/complex.js';
import {getMainFeatures, getMinorFeatures} from '../cluster/cluster.js';
import {getStore as getMarkerStore} from '../source/marker.js';
import {getStore as getOptPoiStore} from '../source/optpoi.js';
import {getStore as getPubTranStore} from '../source/pubtran.stop.js';
import {isBuilding} from '../feature/building.js';
import {isCustom as isCustomMarker} from '../feature/marker.custom.js';
import {isCtgUid as isOptPoiCtgUid} from '../feature/optpoi.js';
import {loadOrDecorateMarkers} from '../create.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").AnimationRequestOptions} AnimationRequestOptions
 * @typedef {import("../conf.js").PopupState} PopupState
 * @typedef {import("./action.js").LoadedTypes} LoadedTypes
 * @typedef {import("./action.js").PayloadAsyncAction} PayloadAsyncAction
 * @typedef {import("ol/geom").Point} ol.geom.Point
 */

/**
 * @typedef {Object} FeatureTimestampOptions
 * @property {number} buildingsTimestamp timestamp
 * @property {number} defaultRoomsTimestamp timestamp
 * @property {number} doorsTimestamp timestamp
 */

/**
 * @param {State} state state
 * @param {LoadedTypes} loadedTypes loaded types
 * @return {FeatureTimestampOptions} timestamps
 */
const getFeaturesTimestamps = (state, loadedTypes) => {
  return {
    buildingsTimestamp: Object.values(loadedTypes).some((t) => t)
      ? Date.now()
      : state.buildingsTimestamp,
    defaultRoomsTimestamp: loadedTypes.room
      ? Date.now()
      : state.defaultRoomsTimestamp,
    doorsTimestamp: loadedTypes.door ? Date.now() : state.doorsTimestamp,
  };
};

const getLoadedTypes = (features, opt_requiredMarkers) => {
  const result = {
    building: features.some((f) => f instanceof Feature && isBuilding(f)),
    room: features.some((f) => f instanceof Feature && isRoom(f)),
    door: features.some((f) => f instanceof Feature && isDoor(f)),
  };
  if (opt_requiredMarkers) {
    result.optPoi = opt_requiredMarkers.some((el) => isOptPoiCtgUid(el));
  }
  return result;
};

/**
 *
 * @param {State} initialState initial state
 * @return {redux.Reducer<State, PayloadAsyncAction>} reducer
 */
const createReducer = (initialState) => {
  return (state = initialState, action) => {
    const popupOpts = /**@type {PopupState}*/ ({});
    let newState;
    let locationCode;
    let loadedTypes;
    let featuresTimestamps;
    let animationRequest;
    let featureUid;
    let feature;
    let featuresExtent;
    let resolutionRange;
    let isVisible;
    let pixelInCoords;
    let isIdentifyAllowed;
    let title;

    switch (action.type) {
      // MARKERS_LOADED
      case actions.MARKERS_LOADED:
        loadedTypes = action.payload;
        featuresTimestamps = getFeaturesTimestamps(state, loadedTypes);
        return {
          ...state,
          ...featuresTimestamps,
          markersTimestamp: Date.now(),
          optPoisTimestamp: loadedTypes.optPoi
            ? Date.now()
            : state.optPoisTimestamp,
        };

      // ZOOMTO_LOADED
      case actions.ZOOMTO_LOADED:
        loadedTypes = action.payload;
        featuresTimestamps = getFeaturesTimestamps(state, loadedTypes);
        return {
          ...state,
          ...featuresTimestamps,
          zoomToTimestamp: Date.now(),
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
              const loadedTypes = getLoadedTypes(res);
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
            const loadedTypes = getLoadedTypes(res);
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

        if (
          result &&
          state.selectedFeature &&
          result.slice(0, 5) !== state.selectedFeature.slice(0, 5)
        ) {
          popupOpts.uid = null;
        }

        return {
          ...state,
          floorsTimestamp: Date.now(),
          selectedFeature: result,
          popup: {
            ...state.popup,
            ...popupOpts,
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
        locationCode = slctr.getSelectedLocationCode(newState);
        if (locationCode !== undefined) {
          //null is valid value
          if (locationCode !== null) {
            //set to state - it can be building/floor code
            newState.selectedFeature = locationCode;
            const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
            loadFloors(where).then((floors) =>
              action.asyncDispatch(
                actions.floors_loaded(isFloorCode(locationCode))
              )
            );
          } else {
            //deselect feature from state
            newState.selectedFeature = null;
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

      //SELECTED_FEATURE_CHANGED:
      case actions.SELECTED_FEATURE_CHANGED:
        const newValue = action.payload;
        const selectedFeature = state.selectedFeature;
        newState = {
          ...state,
          popup: {
            ...state.popup,
          },
        };
        if (selectedFeature && selectedFeature !== newValue) {
          newState.selectedFeature = newValue;
          newState.popup.uid = null;
          const where = `polohKod LIKE '${newValue.substring(0, 5)}%'`;
          loadFloors(where).then((floors) =>
            action.asyncDispatch(actions.floors_loaded(false))
          );
        }
        return newState;

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
        const buffExt = ol_extent.buffer(
          slctr.getExtent(state),
          state.resolution * 100
        );
        const ext = ol_extent.boundingExtent([center, slctr.getCenter(state)]);
        const duration = getAnimationDuration(
          buffExt,
          ol_extent.boundingExtent([center])
        );
        const size = slctr.getSize(state);
        const extResolution = Math.max(
          ol_extent.getWidth(ext) / size[0],
          ol_extent.getHeight(ext) / size[1]
        );

        const initialAnimationRequest = /**@type {AnimationRequestOptions}*/ (
          initialState.animationRequest[0]
        );
        if (ol_extent.containsCoordinate(buffExt, center)) {
          return {
            ...state,
            animationRequest: [
              {
                ...initialAnimationRequest,
                center,
                duration: duration,
                resolution: 0.59, //zoom 18
              },
            ],
          };
        } else {
          return {
            ...state,
            animationRequest: [
              [
                {
                  ...initialAnimationRequest,
                  resolution: Math.max(extResolution, 1.19), //zoom 17
                  duration: duration / 2,
                },
                {
                  ...initialAnimationRequest,
                  resolution: 0.59, //zoom 18
                  duration: duration / 2,
                },
              ],
              {
                ...initialAnimationRequest,
                center: center,
                duration: duration,
              },
            ],
          };
        }

      //BUILDING_CLICKED
      case actions.BUILDING_CLICKED:
        featureUid = action.payload.featureUid;
        pixelInCoords = action.payload.pixelInCoords;
        const extent = slctr.getExtent(state);
        feature = getBuildingStore().getFeatureByUid(featureUid);
        isVisible = munimap_range.contains(FLOOR_RESOLUTION, state.resolution);
        isIdentifyAllowed =
          slctr.isIdentifyEnabled(state) &&
          munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

        if (!isVisible && !isIdentifyAllowed) {
          const point = getClosestPointToPixel(feature, pixelInCoords, extent);
          animationRequest = getAnimationRequestParams(point, {
            resolution: FLOOR_RESOLUTION.max,
            rotation: state.rotation,
            size: slctr.getSize(state),
            extent: slctr.getExtent(state),
          });
          return {
            ...state,
            animationRequest: [
              {
                ...initialState.animationRequest[0],
                ...animationRequest,
              },
            ],
            popup: {
              ...state.popup,
              uid: null,
            },
          };
        } else if (isIdentifyAllowed) {
          munimap_identify.handleCallback(
            slctr.getIdentifyCallback(state),
            action.asyncDispatch,
            {feature, pixelInCoords}
          );
          return {
            ...state,
            popup: {
              ...state.popup,
              uid: null,
            },
          };
        } else {
          result = feature.get('vychoziPodlazi') || feature.get('polohKod');
          if (result) {
            const where = `polohKod LIKE '${result.substring(0, 5)}%'`;
            loadFloors(where).then((floors) =>
              action.asyncDispatch(actions.floors_loaded(false))
            );
          }
          return {
            ...state,
            selectedFeature: result || null,
            popup: {
              ...state.popup,
              uid: null,
            },
          };
        }

      //COMPLEX_CLICKED
      case actions.COMPLEX_CLICKED:
        featureUid = action.payload.featureUid;
        feature = getComplexStore().getFeatureByUid(featureUid);

        const complexId = /**@type {number}*/ (
          feature.get(COMPLEX_ID_FIELD_NAME)
        );
        const complexBldgs = getBuildingStore()
          .getFeatures()
          .filter((bldg) => {
            const cId = bldg.get('arealId');
            if (munimap_utils.isDefAndNotNull(cId)) {
              munimap_assert.assertNumber(cId);
              if (complexId === cId) {
                return true;
              }
            }
            return false;
          });
        featuresExtent = extentOfFeatures(complexBldgs);
        const futureRes =
          complexBldgs.length === 1
            ? FLOOR_RESOLUTION.max / 2
            : COMPLEX_RESOLUTION.min / 2;

        const futureExtent = ol_extent.getForViewAndSize(
          ol_extent.getCenter(featuresExtent),
          futureRes,
          slctr.getRotation(state),
          slctr.getSize(state)
        );

        return {
          ...state,
          animationRequest: [
            {
              ...initialState.animationRequest[0],
              extent: futureExtent,
              duration: getAnimationDuration(
                slctr.getExtent(state),
                featuresExtent
              ),
            },
          ],
        };

      //CLUSTER_CLICKED
      case actions.CLUSTER_CLICKED:
        featureUid = action.payload.featureUid;
        feature = getClusterStore().getFeatureByUid(featureUid);

        let clusteredFeatures = getMainFeatures(feature);
        if (state.requiredOpts.clusterFacultyAbbr) {
          const minorFeatures = getMinorFeatures(feature);
          clusteredFeatures = clusteredFeatures.concat(minorFeatures);
        }

        const firstFeature = clusteredFeatures[0];
        munimap_assert.assertInstanceof(firstFeature, Feature);
        resolutionRange = isDoor(firstFeature)
          ? DOOR_RESOLUTION
          : FLOOR_RESOLUTION;
        if (clusteredFeatures.length === 1) {
          let center;

          if (firstFeature.get('popupDetails')) {
            popupOpts.uid = getUid(firstFeature);
          }

          const opts = {
            resolution: resolutionRange.max,
            rotation: slctr.getRotation(state),
            size: slctr.getSize(state),
            extent: slctr.getExtent(state),
          };

          if (isCustomMarker(firstFeature)) {
            featuresExtent = extentOfFeature(firstFeature);
            center = ol_extent.getCenter(featuresExtent);
            animationRequest = getAnimationRequestParams(center, opts);
          } else {
            isVisible = munimap_range.contains(
              resolutionRange,
              slctr.getResolution(state)
            );
            if (!isVisible) {
              featuresExtent = extentOfFeature(firstFeature);
              center = ol_extent.getCenter(featuresExtent);
              animationRequest = getAnimationRequestParams(center, opts);
            }
          }
        } else {
          featuresExtent = extentOfFeatures(clusteredFeatures);
          animationRequest = {
            extent: featuresExtent,
            duration: getAnimationDuration(
              slctr.getExtent(state),
              featuresExtent
            ),
          };
        }

        if (animationRequest) {
          return {
            ...state,
            animationRequest: [
              {
                ...initialState.animationRequest[0],
                ...animationRequest,
              },
            ],
            popup: {
              ...initialState.popup,
              ...popupOpts,
            },
          };
        }
        return {
          ...state,
          popup: {
            ...initialState.popup,
            ...popupOpts,
          },
        };

      //MARKER_CLICKED
      case actions.MARKER_CLICKED:
        featureUid = action.payload.featureUid;
        pixelInCoords = action.payload.pixelInCoords;
        feature = getMarkerStore().getFeatureByUid(featureUid);
        resolutionRange = isDoor(feature) ? DOOR_RESOLUTION : FLOOR_RESOLUTION;
        isVisible = munimap_range.contains(resolutionRange, state.resolution);
        isIdentifyAllowed =
          slctr.isIdentifyEnabled(state) &&
          munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

        animationRequest = null;
        if (!isVisible && !isIdentifyAllowed) {
          let point;
          if (isRoom(feature) || isDoor(feature) || isCustomMarker(feature)) {
            point = ol_extent.getCenter(extentOfFeature(feature));
          } else {
            point = getClosestPointToPixel(
              feature,
              pixelInCoords,
              slctr.getExtent(state)
            );
          }
          animationRequest = getAnimationRequestParams(point, {
            resolution: resolutionRange.max,
            rotation: slctr.getRotation(state),
            size: slctr.getSize(state),
            extent: slctr.getExtent(state),
          });
        }

        if (feature.get('popupDetails')) {
          popupOpts.uid = getUid(feature);
        }

        if (!isCustomMarker(feature)) {
          const markerLocationCode = feature.get('polohKod');
          locationCode = markerLocationCode
            ? markerLocationCode.slice(0, 8)
            : null;
          if (locationCode) {
            const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
            const activeFloorCodes = slctr.getActiveFloorCodes(state);
            loadFloors(where).then((floors) =>
              action.asyncDispatch(
                actions.floors_loaded(activeFloorCodes.includes(locationCode))
              )
            );
            if (isIdentifyAllowed) {
              munimap_identify.handleCallback(
                slctr.getIdentifyCallback(state),
                action.asyncDispatch,
                {feature, pixelInCoords}
              );
            }
          }
        }

        if (animationRequest) {
          return {
            ...state,
            selectedFeature: locationCode || state.selectedFeature,
            animationRequest: [
              {
                ...initialState.animationRequest[0],
                ...animationRequest,
              },
            ],
            popup: {
              ...initialState.popup,
              ...popupOpts,
            },
          };
        }
        return {
          ...state,
          selectedFeature: locationCode || state.selectedFeature,
          popup: {
            ...initialState.popup,
            ...popupOpts,
          },
        };

      //POI_CLICKED
      case actions.POI_CLICKED:
        featureUid = action.payload.featureUid;
        feature = getActivePoiStore().getFeatureByUid(featureUid);

        animationRequest = null;
        isVisible = munimap_range.contains(FLOOR_RESOLUTION, state.resolution);
        if (!isVisible) {
          const point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
          const coords = point.getCoordinates();
          animationRequest = getAnimationRequestParams(coords, {
            resolution: FLOOR_RESOLUTION.max,
            rotation: slctr.getRotation(state),
            size: slctr.getSize(state),
            extent: slctr.getExtent(state),
          });
        }

        if (animationRequest) {
          return {
            ...state,
            animationRequest: [
              {
                ...initialState.animationRequest[0],
                ...animationRequest,
              },
            ],
          };
        }
        return {
          ...state,
        };

      //PUBTRAN_CLICKED
      case actions.PUBTRAN_CLICKED:
        featureUid = action.payload.featureUid;
        feature = getPubTranStore().getFeatureByUid(featureUid);

        const point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
        const coords = point.getCoordinates();
        animationRequest = getAnimationRequestParams(coords, {
          resolution: slctr.getResolution(state),
          rotation: slctr.getRotation(state),
          size: slctr.getSize(state),
          extent: slctr.getExtent(state),
        });

        title = /**@type {string}*/ (feature.get('nazev'));
        if (title) {
          popupOpts.uid = getUid(feature);
        }

        return {
          ...state,
          animationRequest: [
            {
              ...initialState.animationRequest[0],
              ...animationRequest,
            },
          ],
          popup: {
            ...initialState.popup,
            ...popupOpts,
          },
        };

      //ROOM_CLICKED
      case actions.ROOM_CLICKED:
        featureUid = action.payload.featureUid;
        pixelInCoords = action.payload.pixelInCoords;
        feature = getActiveRoomStore().getFeatureByUid(featureUid);
        locationCode = feature.get('polohKod');
        result = locationCode ? locationCode.substr(0, 8) : null;
        isIdentifyAllowed =
          slctr.isIdentifyEnabled(state) &&
          munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

        if (result) {
          if (
            state.selectedFeature &&
            result.slice(0, 5) !== state.selectedFeature.slice(0, 5)
          ) {
            popupOpts.uid = null;
          }
          const where = `polohKod LIKE '${result.substring(0, 5)}%'`;
          loadFloors(where).then((floors) =>
            action.asyncDispatch(actions.floors_loaded(true))
          );

          if (isIdentifyAllowed) {
            munimap_identify.handleCallback(
              slctr.getIdentifyCallback(state),
              action.asyncDispatch,
              {feature, pixelInCoords}
            );
          }
        }
        return {
          ...state,
          selectedFeature: result,
          popup: {
            ...state.popup,
            ...popupOpts,
          },
        };

      // DOOR_CLICKED
      case actions.DOOR_CLICKED:
        featureUid = action.payload.featureUid;
        pixelInCoords = action.payload.pixelInCoords;
        feature = getActiveDoorStore().getFeatureByUid(featureUid);
        isIdentifyAllowed =
          slctr.isIdentifyEnabled(state) &&
          munimap_identify.isAllowed(feature, state.requiredOpts.identifyTypes);

        if (isIdentifyAllowed) {
          munimap_identify.handleCallback(
            slctr.getIdentifyCallback(state),
            action.asyncDispatch,
            {feature, pixelInCoords}
          );
        }
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
          action.asyncDispatch
        );
        return {
          ...state,
        };

      //POINTERMOVE_TIMEOUT_EXPIRED
      case actions.POINTERMOVE_TIMEOUT_EXPIRED:
        const params = calculateTooltipParameters({
          ...action.payload,
          resolution: slctr.getResolution(state),
          lang: slctr.getLang(state),
          locationCodes: state.requiredOpts.locationCodes,
        });

        return {
          ...state,
          tooltip: {
            ...state.tooltip,
            ...params,
          },
        };

      //TOOLTIP_CANCELLED
      case actions.TOOLTIP_CANCELLED:
        return {
          ...state,
          tooltip: {
            ...initialState.tooltip,
          },
        };

      //RESET_MUNIMAP
      case actions.RESET_MUNIMAP:
        const markerIdsEquals =
          action.payload.markerIds &&
          munimap_utils.arrayEquals(
            action.payload.markerIds,
            state.requiredOpts.markerIds
          );
        newState = /** @type {State}*/ ({
          ...state,
          requiredOpts: {
            ...state.requiredOpts,
            zoom: action.payload.zoom || INITIAL_STATE.requiredOpts.zoom,
            center: action.payload.center || INITIAL_STATE.requiredOpts.center,
            markerIds: markerIdsEquals
              ? action.payload.markerIds
              : INITIAL_STATE.requiredOpts.markerIds,
            zoomTo: INITIAL_STATE.requiredOpts.zoomTo,
            markerFilter:
              action.payload.markerFilter ||
              INITIAL_STATE.requiredOpts.markerFilter,
            poiFilter:
              action.payload.poiFilter || INITIAL_STATE.requiredOpts.poiFilter,
            identifyTypes:
              action.payload.identifyTypes ||
              INITIAL_STATE.requiredOpts.identifyTypes,
            identifyCallbackId:
              action.payload.identifyCallbackId ||
              INITIAL_STATE.requiredOpts.identifyCallbackId,
          },
        });

        //clear stores and load markers
        if (
          action.payload.markerIds &&
          (!markerIdsEquals ||
            !!action.payload.markerFilter ||
            !!action.payload.poiFilter)
        ) {
          const requiredMarkers = action.payload.markerIds;
          newState.requiredOpts.markerIds = requiredMarkers;
          newState.markersTimestamp = 0;
          newState.optPoisTimestamp = 0;
          getMarkerStore().clear();
          getOptPoiStore().clear();
          getClusterStore().clear();

          let markerStrings;
          if (requiredMarkers.length) {
            munimap_assert.assertArray(requiredMarkers);
            munimap_utils.removeArrayDuplicates(requiredMarkers);
            markerStrings = /** @type {Array<string>} */ (requiredMarkers);
          } else {
            markerStrings = /** @type {Array<string>} */ ([]);
          }

          loadOrDecorateMarkers(markerStrings, newState.requiredOpts).then(
            (res) => {
              munimap_assert.assertMarkerFeatures(res);
              const loadedTypes = getLoadedTypes(res, requiredMarkers);
              getMarkerStore().addFeatures(res);
              action.asyncDispatch(actions.markers_loaded(res, loadedTypes));
            }
          );
        } else if (
          !action.payload.markerIds &&
          state.requiredOpts.markerIds.length > 0
        ) {
          getMarkerStore().clear();
        }

        //load zoomTo
        if (action.payload.zoomTo) {
          let zoomToStrings;
          newState.requiredOpts.zoomTo = action.payload.zoomTo;
          newState.zoomToTimestamp = 0;

          if (action.payload.zoomTo.length) {
            zoomToStrings = /**@type {Array<string>}*/ (
              munimap_utils.isString(action.payload.zoomTo)
                ? [action.payload.zoomTo]
                : action.payload.zoomTo
            );
          } else {
            zoomToStrings = [];
          }
          featuresFromParam(zoomToStrings).then((res) => {
            const loadedTypes = getLoadedTypes(res);
            action.asyncDispatch(actions.zoomTo_loaded(loadedTypes));
          });
        }

        //manage identify callback
        if (action.payload.identifyCallbackId) {
          //new callback in munimap.reset
          const store = getIdentifyStore();
          if (store) {
            store.once('clear', () =>
              action.asyncDispatch(actions.identifyFeatureChanged())
            );
            store.clear();
          } else {
            createIdentifyStore();
          }
        } else if (slctr.isIdentifyEnabled(state)) {
          //same callback as in munimap.create => handle with undefined
          munimap_identify.handleCallback(
            slctr.getIdentifyCallback(state),
            action.asyncDispatch
          );
          newState.requiredOpts.identifyCallbackId =
            state.requiredOpts.identifyCallbackId;
        }

        return newState;

      //REQUIRED_VIEW_CHANGED
      case actions.REQUIRED_VIEW_CHANGED:
        if (action.payload.extent) {
          animationRequest = {
            extent: action.payload.extent,
            duration: action.payload.duration,
          };
          return {
            ...state,
            animationRequest: [
              {
                ...INITIAL_STATE.animationRequest[0],
                ...animationRequest,
              },
            ],
          };
        }
        return {...state};

      //IDENTIFY_FEATURE_CHANGED
      case actions.IDENTIFY_FEATURE_CHANGED:
        return {
          ...state,
          identifyTimestamp: Date.now(),
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
