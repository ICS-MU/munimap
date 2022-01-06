/**
 * @module reset
 */
import * as actions from './redux/action.js';
import Feature from 'ol/Feature';
import {
  IDENTIFY_CALLBACK_STORE,
  REQUIRED_CUSTOM_MARKERS,
  getStoreByTargetId,
} from './create.js';

/**
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
 * @param {ol.Map} map map
 * @param {Options} options Options
 */
export default (map, options) => {
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
  store.dispatch(actions.resetMunimap(opts));
};
