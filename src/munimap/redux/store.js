/**
 * @module redux/store
 */
import * as actions from './action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
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
import {Feature} from 'ol';
import {ROOM_TYPES, isRoom} from '../feature/room.js';
import {asyncDispatchMiddleware} from './middleware.js';
import {
  clearFloorBasedStores,
  refreshFloorBasedStores,
} from '../source/source.js';
import {
  ofFeature as extentOfFeature,
  ofFeatures as extentOfFeatures,
} from '../utils/extent.js';
import {featuresFromParam, loadFloors} from '../load.js';
import {getActiveStore as getActivePoiStore} from '../source/poi.js';
import {getActiveStore as getActiveRoomStore} from '../source/room.js';
import {getAnimationDuration} from '../utils/animation.js';
import {getAnimationRequestParams} from '../utils/animation.js';
import {getStore as getBuildingStore} from '../source/building.js';
import {getCenter, getForViewAndSize} from 'ol/extent';
import {getClosestPointToPixel} from '../feature/feature.js';
import {getStore as getClusterStore} from '../source/cluster.js';
import {getStore as getComplexStore} from '../source/complex.js';
import {getMainFeatures, getMinorFeatures} from '../cluster/cluster.js';
import {getStore as getMarkerStore} from '../source/marker.js';
import {isBuilding} from '../feature/building.js';
import {isCustom as isCustomMarker} from '../feature/marker.custom.js';
import {isCtgUid as isOptPoiCtgUid} from '../feature/optpoi.js';
import {loadOrDecorateMarkers} from '../create.js';

/**
 * @typedef {import("../conf.js").State} State
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

/**
 *
 * @param {State} initialState initial state
 * @return {redux.Reducer<State, PayloadAsyncAction>} reducer
 */
const createReducer = (initialState) => {
  return (state = initialState, action) => {
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

              const loadedTypes = {
                building: res.some(
                  (f) => f instanceof Feature && isBuilding(f)
                ),
                room: res.some((f) => f instanceof Feature && isRoom(f)),
                door: res.some((f) => f instanceof Feature && isDoor(f)),
                optPoi: requiredMarkers.some((el) => isOptPoiCtgUid(el)),
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
        return {
          ...state,
          animationRequest: {
            ...initialState.animationRequest,
            center: action.payload.center,
            resolution: action.payload.resolution,
            duration: action.payload.duration,
            extent: action.payload.extent,
          },
        };

      //INITIAL_LAYERS_ADDED
      case actions.INITIAL_LAYERS_ADDED:
        return {
          ...state,
          initialLayersAdded: true,
        };

      //BUILDING_CLICKED
      case actions.BUILDING_CLICKED:
        featureUid = action.payload.featureUid;
        pixelInCoords = action.payload.pixelInCoords;
        const extent = slctr.getExtent(state);
        feature = getBuildingStore().getFeatureByUid(featureUid);
        isVisible = munimap_range.contains(FLOOR_RESOLUTION, state.resolution);

        if (!isVisible /*&& !munimap_utils.isDef(identifyCallback)*/) {
          const point = getClosestPointToPixel(feature, pixelInCoords, extent);
          animationRequest = getAnimationRequestParams(point, {
            resolution: FLOOR_RESOLUTION.max,
            rotation: state.rotation,
            size: slctr.getSize(state),
            extent: slctr.getExtent(state),
          });
          return {
            ...state,
            animationRequest: {
              ...initialState.animationRequest,
              ...animationRequest,
            },
          };
        } else {
          result = feature.get('vychoziPodlazi') || feature.get('polohKod');
          if (result) {
            const where = `polohKod LIKE '${result.substring(0, 5)}%'`;
            loadFloors(where).then((floors) =>
              action.asyncDispatch(actions.floors_loaded(false))
            );
            // if (jpad.func.isDef(identifyCallback)) {
            //   munimap.identify.refreshVisibility(map, newLocCode);
            // }
          }
          return {
            ...state,
            selectedFeature: result || null,
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
        const size = slctr.getSize(state);
        const futureRes =
          complexBldgs.length === 1
            ? FLOOR_RESOLUTION.max / 2
            : COMPLEX_RESOLUTION.min / 2;

        const futureExtent = getForViewAndSize(
          getCenter(featuresExtent),
          futureRes,
          slctr.getRotation(state),
          size
        );
        const duration = getAnimationDuration(
          slctr.getExtent(state),
          featuresExtent
        );

        return {
          ...state,
          animationRequest: {
            ...initialState.animationRequest,
            extent: futureExtent,
            duration,
          },
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
          // const detail = /** @type {string} */(firstFeature.get('detail'));
          // if (detail) {
          //   munimap.bubble.show(firstFeature, map, detail, 0, 20);
          // }
          const opts = {
            resolution: resolutionRange.max,
            rotation: slctr.getRotation(state),
            size: slctr.getSize(state),
            extent: slctr.getExtent(state),
          };

          if (isCustomMarker(firstFeature)) {
            featuresExtent = extentOfFeature(firstFeature);
            center = getCenter(featuresExtent);
            animationRequest = getAnimationRequestParams(center, opts);
          } else {
            isVisible = munimap_range.contains(
              resolutionRange,
              slctr.getResolution(state)
            );
            if (!isVisible) {
              featuresExtent = extentOfFeature(firstFeature);
              center = getCenter(featuresExtent);
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
            animationRequest: {
              ...initialState.animationRequest,
              ...animationRequest,
            },
          };
        }
        return {
          ...state,
        };

      //MARKER_CLICKED
      case actions.MARKER_CLICKED:
        featureUid = action.payload.featureUid;
        pixelInCoords = action.payload.pixelInCoords;
        feature = getMarkerStore().getFeatureByUid(featureUid);
        resolutionRange = isDoor(feature) ? DOOR_RESOLUTION : FLOOR_RESOLUTION;
        isVisible = munimap_range.contains(resolutionRange, state.resolution);
        // var identifyCallback = munimap.getProps(map).options.identifyCallback;

        animationRequest = null;
        if (!isVisible /*&& !jpad.func.isDef(identifyCallback)*/) {
          let point;
          if (isRoom(feature) || isDoor(feature) || isCustomMarker(feature)) {
            point = getCenter(extentOfFeature(feature));
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
        // const detail = /** @type {string} */ (feature.get('detail'));
        // if (detail) {
        //   munimap.bubble.show(feature, map, detail, 0, 20, undefined, true);
        // }

        if (animationRequest) {
          return {
            ...state,
            animationRequest: {
              ...initialState.animationRequest,
              ...animationRequest,
            },
          };
        }
        return {
          ...state,
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
            animationRequest: {
              ...initialState.animationRequest,
              ...animationRequest,
            },
          };
        }
        return {
          ...state,
        };

      //PUBTRAN_CLICKED
      case actions.PUBTRAN_CLICKED:
        console.error('Not implemented yet!');
        // var feature = options.feature;
        // var map = options.map;
        // var lang = map.get(munimap.PROPS_NAME).lang;
        // var title = /**@type {string}*/ (feature.get('nazev'));
        // var link = 'https://idos.idnes.cz/idsjmk/spojeni/?';
        // var linkToAttributes = {
        //   href: encodeURI(link + 't=' + title),
        //   target: '_blank'
        // };
        // var linkFromAttributes = {
        //   href: encodeURI(link + 'f=' + title),
        //   target: '_blank'
        // };

        // var main = goog.dom.createDom('div', 'munimap-title',
        //   goog.dom.createTextNode(title));
        // var linkToEl = goog.dom.createDom('a', linkToAttributes,
        //   goog.dom.createTextNode(
        //     munimap.lang.getMsg(munimap.lang.Translations.CONNECTION_TO, lang)));
        // var linkFromEl = goog.dom.createDom('a', linkFromAttributes,
        //   goog.dom.createTextNode(
        //     munimap.lang.getMsg(munimap.lang.Translations.CONNECTION_FROM, lang)));
        // var linkEl = goog.dom.createDom('div', null, goog.dom.createTextNode(
        //   munimap.lang.getMsg(munimap.lang.Translations.FIND_CONNECTION, lang)
        //   + ': '));

        // var mainText = goog.dom.getOuterHtml(main);
        // var linkToElText = goog.dom.getOuterHtml(linkToEl);
        // var linkFromElText = goog.dom.getOuterHtml(linkFromEl);
        // var linkElText = linkEl.innerHTML;
        // var detail = mainText + '<div>' + linkElText + linkToElText + ' / ' +
        //     linkFromElText + '</div>';
        // munimap.bubble.show(feature, map, detail, 0, 0,
        //   munimap.pubtran.stop.RESOLUTION, true);

        return {
          ...state,
        };

      //ROOM_CLICKED
      case actions.ROOM_CLICKED:
        featureUid = action.payload.featureUid;
        feature = getActiveRoomStore().getFeatureByUid(featureUid);
        locationCode = feature.get('polohKod');
        result = locationCode ? locationCode.substr(0, 8) : null;
        if (result) {
          const where = `polohKod LIKE '${result.substring(0, 5)}%'`;
          loadFloors(where).then((floors) =>
            action.asyncDispatch(actions.floors_loaded(true))
          );
          // if (jpad.func.isDef(identifyCallback)) {
          //   munimap.identify.refreshVisibility(map, newLocCode);
          // }
        }
        return {
          ...state,
          selectedFeature: result,
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
