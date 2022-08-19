/**
 * @module create
 */
import * as actions from './redux/action.js';
import * as mm_utils from './utils/utils.js';
import * as mm_view from './view/view.js';
import Feature from 'ol/Feature.js';
import MunimapComponent from './components/munimap.jsx';
import React from 'react';
import {
  GET_MAIN_FEATURE_AT_PIXEL_STORE,
  IDENTIFY_CALLBACK_STORE,
  MARKER_LABEL_STORE,
  REQUIRED_CUSTOM_MARKERS,
  TARGET_ELEMENTS_STORE,
  setStoreByTargetId,
} from './constants.js';
import {INITIAL_STATE} from './conf.js';
import {Provider} from 'react-redux';
import {assertOptions} from './assert/assert.params.js';
// eslint-disable-next-line import/extensions
import {createRoot} from 'react-dom/client';
import {createStore} from './redux/store.js';
import {v4 as uuidv4} from 'uuid';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("./conf.js").State} State
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("./feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("./feature/feature.js").getMainFeatureAtPixelFunction} getMainFeatureAtPixelFunction
 * @typedef {import("./feature/identify.js").CallbackFunction} IdentifyCallbackFunction
 * @typedef {import("./feature/cluster.js").ClusterOptions} ClusterOptions
 */

/**
 * @typedef {object} Options
 * @property {string|HTMLElement} target target
 * @property {number} [zoom] zoom
 * @property {ol.coordinate.Coordinate} [center] center
 * @property {Array<string>|string} [zoomTo] zoom to
 * @property {Array<string>|Array<Feature>} [markers] markers
 * @property {string} [lang] language
 * @property {boolean} [loadingMessage] loading message
 * @property {string} [baseMap] basemap
 * @property {boolean} [mapLinks] maplinks
 * @property {boolean} [labels] labels
 * @property {boolean} [locationCodes] location codes
 * @property {boolean} [simpleScroll] simple scroll
 * @property {MarkerLabelFunction} [markerLabel] marker label function
 * @property {boolean} [pubTran] public transportation stops
 * @property {Array<string>} [poiFilter] poi filter
 * @property {Array<string>} [markerFilter] marker filter
 * @property {getMainFeatureAtPixelFunction} [getMainFeatureAtPixel] getMainFeatureAtPixel function
 * @property {Array<string>} [identifyTypes] identifyTypes
 * @property {IdentifyCallbackFunction} [identifyCallback] identifyCallback function
 * @property {boolean} [tooltips] tooltips
 * @property {ClusterOptions} [cluster] cluster
 */

/**
 * @param {Options} options options
 * @return {string} id in store
 */
const addTargetElementToStore = (options) => {
  const targetEl = mm_utils.isElement(options.target)
    ? /** @type {HTMLElement}*/ (options.target)
    : document.getElementById(/** @type {string}*/ (options.target));
  const targetId =
    targetEl.id && targetEl.id.length > 0 ? targetEl.id : uuidv4();

  TARGET_ELEMENTS_STORE[targetId] = targetEl;

  return targetId;
};

/**
 * @param {Options} options Options
 * @param {string} targetId id in store
 * @return {State} State
 */
const getInitialState = (options, targetId) => {
  const initialState = {
    ...INITIAL_STATE,
    requiredOpts: {
      ...INITIAL_STATE.requiredOpts,
      targetId: targetId,
    },
  };
  if (options.markers !== undefined) {
    const reqMarkers = /** @type {Array<string>}*/ ([]);
    options.markers.forEach((marker, idx) => {
      if (marker instanceof Feature) {
        const id = `CUSTOM_MARKER_${targetId}_${idx}`;
        REQUIRED_CUSTOM_MARKERS[id] = marker;
        reqMarkers.push(id);
      } else {
        reqMarkers.push(marker);
      }
    });

    initialState.requiredOpts.markerIds = reqMarkers;
  }
  if (options.zoomTo !== undefined) {
    initialState.requiredOpts.zoomTo = options.zoomTo;
  }
  if (options.lang !== undefined) {
    initialState.requiredOpts.lang = options.lang;
  }
  if (options.loadingMessage !== undefined) {
    initialState.requiredOpts.loadingMessage = options.loadingMessage;
  }
  if (options.baseMap !== undefined) {
    initialState.requiredOpts.baseMap = options.baseMap;
  }
  if (options.mapLinks !== undefined) {
    initialState.requiredOpts.mapLinks = options.mapLinks;
  }
  if (options.labels !== undefined) {
    initialState.requiredOpts.labels = options.labels;
  }
  if (options.locationCodes !== undefined) {
    initialState.requiredOpts.locationCodes = options.locationCodes;
  }
  if (options.simpleScroll !== undefined) {
    initialState.requiredOpts.simpleScroll = options.simpleScroll;
  }
  if (options.markerLabel !== undefined) {
    const id = `REQUIRED_MARKER_LABEL_${targetId}`;
    MARKER_LABEL_STORE[id] = options.markerLabel;
    initialState.requiredOpts.markerLabelId = id;
  }
  if (options.pubTran !== undefined) {
    initialState.requiredOpts.pubTran = options.pubTran;
  }
  if (options.zoom !== undefined) {
    initialState.requiredOpts.zoom = options.zoom;
  }
  if (options.center !== undefined) {
    initialState.requiredOpts.center = options.center;
  }
  if (options.poiFilter !== undefined) {
    initialState.requiredOpts.poiFilter = options.poiFilter;
  }
  if (options.markerFilter !== undefined) {
    initialState.requiredOpts.markerFilter = options.markerFilter;
  }
  if (options.getMainFeatureAtPixel !== undefined) {
    const id = `GET_MAIN_FEATURE_AT_PIXEL_${targetId}`;
    GET_MAIN_FEATURE_AT_PIXEL_STORE[id] = options.getMainFeatureAtPixel;
    initialState.requiredOpts.getMainFeatureAtPixelId = id;
  }
  if (options.identifyTypes !== undefined) {
    initialState.requiredOpts.identifyTypes = options.identifyTypes;
  }
  if (options.identifyCallback !== undefined) {
    const id = `IDENTIFY_CALLBACK_${targetId}`;
    IDENTIFY_CALLBACK_STORE[id] = options.identifyCallback;
    initialState.requiredOpts.identifyCallbackId = id;
  }
  if (options.tooltips !== undefined) {
    initialState.requiredOpts.tooltips = options.tooltips;
  }
  if (options.cluster !== undefined) {
    initialState.requiredOpts.cluster = options.cluster;
  }

  return initialState;
};

/**
 * Add css as external stylesheet.
 * External websites only add JS file and CSS must be added by script (see
 * munimap quickstart docs).
 */
const ensureCss = () => {
  if (PRODUCTION) {
    const links = document.head.querySelectorAll(
      'link[href$="munimaplib.css"]'
    );

    if (links.length === 0) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = `${PROD_DOMAIN}${APP_PATH}munimaplib.css`;
      document.head.appendChild(cssLink);
    }
  }
};

/**
 * @param {Options} options Options
 * @return {Promise<ol.Map>} initialized map
 */
export default (options) => {
  return new Promise((resolve, reject) => {
    assertOptions(options);
    ensureCss();

    const targetId = addTargetElementToStore(options);
    const initialState = getInitialState(options, targetId);
    const store = createStore(initialState);
    setStoreByTargetId(targetId, store);

    mm_view.createFeatureStores(store);
    store.dispatch(
      actions.create_munimap({
        mapLinks: options.mapLinks,
        pubTran: options.pubTran,
        baseMap: options.baseMap,
        identifyTypes: options.identifyTypes,
        identifyCallback: options.identifyCallback,
      })
    );

    const root = createRoot(TARGET_ELEMENTS_STORE[targetId]);
    root.render(
      <Provider store={store}>
        <React.StrictMode>
          <MunimapComponent afterInit={(map) => resolve(map)} />
        </React.StrictMode>
      </Provider>
    );
  });
};
