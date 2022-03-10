/**
 * @module reset
 */
import * as actions from './redux/action.js';
import * as munimap_identify from './identify/identify.js';
import * as munimap_utils from './utils/utils.js';
import * as slctr from './redux/selector.js';
import Feature from 'ol/Feature';
import {
  IDENTIFY_CALLBACK_STORE,
  REQUIRED_CUSTOM_MARKERS,
  getStoreByTargetId,
} from './create.constants.js';
import {INITIAL_STATE} from './conf.js';
import {clearAndLoadMarkers, loadZoomTo} from './load.js';
import {
  createStore as createIdentifyStore,
  getStore as getIdentifyStore,
} from './source/identify.js';
import {getStore as getMarkerStore} from './source/marker.js';

/**
 * @typedef {import("./conf.js").State} State
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("./conf.js").RequiredOptions} RequiredOptions
 * @typedef {import("./feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("./identify/identify.js").CallbackFunction} IdentifyCallbackFunction
 */

/**
 * @typedef {Object} Options
 * @property {number} zoom zoom
 * @property {ol.coordinate.Coordinate} center center
 * @property {Array<string>|Array<ol.Feature>} markers markers
 * @property {Array<string>|string} zoomTo zoomTo
 * @property {Array<string>} markerFilter markerFilter
 * @property {MarkerLabelFunction} markerLabel markerLabel
 * @property {Array<string>} poiFilter poiFilter
 * @property {Array<string>} identifyTypes identifyTypes
 * @property {IdentifyCallbackFunction} identifyCallback identifyCallback
 */

/**
 * @param {State} state state
 * @param {RequiredOptions} options payload
 * @return {State} new state
 */
const createNewState = (state, options) => {
  const markerIdsEquals =
    options.markerIds &&
    munimap_utils.arrayEquals(options.markerIds, state.requiredOpts.markerIds);

  return {
    ...state,
    resetTimestamp: 0,
    requiredOpts: {
      ...state.requiredOpts,
      zoom: options.zoom || INITIAL_STATE.requiredOpts.zoom,
      center: options.center || INITIAL_STATE.requiredOpts.center,
      markerIds: markerIdsEquals
        ? options.markerIds
        : INITIAL_STATE.requiredOpts.markerIds,
      zoomTo: INITIAL_STATE.requiredOpts.zoomTo,
      markerFilter:
        options.markerFilter || INITIAL_STATE.requiredOpts.markerFilter,
      poiFilter: options.poiFilter || INITIAL_STATE.requiredOpts.poiFilter,
      identifyTypes:
        options.identifyTypes || INITIAL_STATE.requiredOpts.identifyTypes,
      identifyCallbackId:
        options.identifyCallbackId ||
        INITIAL_STATE.requiredOpts.identifyCallbackId,
    },
  };
};

/**
 * @param {State} state state
 * @param {RequiredOptions} payload payload
 * @return {boolean} whether marker options are changed
 */
const areMarkerDependenciesChanged = (state, payload) => {
  const markerIdsEquals =
    payload.markerIds &&
    munimap_utils.arrayEquals(payload.markerIds, state.requiredOpts.markerIds);
  return (
    payload.markerIds &&
    (!markerIdsEquals || !!payload.markerFilter || !!payload.poiFilter)
  );
};

/**
 * @param {State} state state
 * @param {RequiredOptions} payload payload
 * @return {boolean} whether marker options are changed
 */
const shouldClearMarkers = (state, payload) => {
  return !payload.markerIds && state.requiredOpts.markerIds.length > 0;
};

/**
 * @param {State} state state
 * @param {RequiredOptions} payload payload
 * @param {redux.Dispatch} asyncDispatch async dispatch
 * @return {string|undefined} callback id
 */
const handleIdentifyCallback = (state, payload, asyncDispatch) => {
  const targetId = slctr.getTargetId(state);
  let result;
  if (payload.identifyCallbackId) {
    //new callback in munimap.reset
    const store = getIdentifyStore(targetId);
    if (store) {
      store.once('clear', () =>
        asyncDispatch(actions.identifyFeatureChanged())
      );
      store.clear();
    } else {
      createIdentifyStore(targetId);
    }
  } else if (slctr.isIdentifyEnabled(state)) {
    //same callback as in munimap.create => handle with undefined
    munimap_identify.handleCallback(
      slctr.getIdentifyCallback(state),
      asyncDispatch,
      targetId
    );
    result = state.requiredOpts.identifyCallbackId;
  }
  return result;
};

/**
 * @param {State} state state
 * @param {RequiredOptions} payload payload
 * @param {redux.Dispatch} asyncDispatch async dispatch
 * @return {State} new state
 */
const handleReset = (state, payload, asyncDispatch) => {
  const targetId = slctr.getTargetId(state);
  const newState = createNewState(state, payload);

  //clear stores and load markers
  if (areMarkerDependenciesChanged(state, payload)) {
    const requiredMarkers = payload.markerIds;
    newState.requiredOpts.markerIds = requiredMarkers;
    newState.markersTimestamp = 0;
    newState.optPoisTimestamp = 0;
    clearAndLoadMarkers(targetId, newState, requiredMarkers, asyncDispatch);
  } else if (shouldClearMarkers(state, payload)) {
    getMarkerStore(targetId).clear();
  }

  //load zoomTo
  const requiredZoomTo = payload.zoomTo;
  if (requiredZoomTo) {
    newState.requiredOpts.zoomTo = requiredZoomTo;
    newState.zoomToTimestamp = 0;
    loadZoomTo(targetId, requiredZoomTo, asyncDispatch);
  }

  //handle identify callback
  const callbackId = handleIdentifyCallback(state, payload, asyncDispatch);
  if (callbackId !== undefined) {
    newState.requiredOpts.identifyCallbackId = callbackId;
  }

  //set animation if loading ended
  if (slctr.areMarkersAndZoomToLoaded(newState)) {
    const animationRequest = slctr.calculateAnimationRequest(newState);
    if (animationRequest) {
      newState.animationRequest = animationRequest;
    } else {
      newState.resetTimestamp = Date.now();
    }
  }
  return newState;
};

/**
 * @param {ol.Map} map map
 * @param {Options} options Options
 * @return {Promise<ol.Map>} initialized map
 */
export default (map, options) => {
  let unsubscribe;

  return new Promise((resolve, reject) => {
    const mapTargetEl = map.getTargetElement();
    const targetId = mapTargetEl.parentElement.parentElement.id;

    const store = getStoreByTargetId(targetId);
    if (!store) {
      throw new Error(`Store (for id: ${targetId}) not found!`);
    }

    const opts = /** @type {RequiredOptions}*/ ({
      zoom: options.zoom,
      center: options.center,
      zoomTo: options.zoomTo,
      markerFilter: options.markerFilter,
      poiFilter: options.poiFilter,
      identifyTypes: options.identifyTypes,
    });

    if (options.markers !== undefined) {
      const reqMarkers = /** @type {Array<string>}*/ ([]);
      for (const prop of Object.getOwnPropertyNames(REQUIRED_CUSTOM_MARKERS)) {
        delete REQUIRED_CUSTOM_MARKERS[prop];
      }
      options.markers.forEach((marker, idx) => {
        if (marker instanceof Feature) {
          const id = `CUSTOM_MARKER_${targetId}_${idx}`;
          REQUIRED_CUSTOM_MARKERS[id] = marker;
          reqMarkers.push(id);
        } else {
          reqMarkers.push(marker);
        }
      });

      opts.markerIds = reqMarkers;
    }

    if (options.identifyCallback !== undefined) {
      const id = `IDENTIFY_CALLBACK_${targetId}`;
      if (options.identifyCallback !== IDENTIFY_CALLBACK_STORE[id]) {
        IDENTIFY_CALLBACK_STORE[id] = options.identifyCallback;
        opts.identifyCallbackId = id;
      }
    }

    //resolve map as animation callback
    unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.resetTimestamp > 0) {
        resolve(map);
        unsubscribe();
      }
    });
    store.dispatch(actions.resetMunimap(opts));
  });
};

export {handleReset};
