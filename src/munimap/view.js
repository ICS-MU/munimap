/**
 * @module view
 */
import * as actions from './redux/action.js';
import * as munimap_lang from './lang/lang.js';
import TileLayer from 'ol/layer/Tile';
import createControls from './control/mapcontrolsview.js';
import {createStore as createBuildingStore} from './view/building.js';
import {create as createClusterLayer} from './layer/cluster.js';
import {createStore as createComplexStore} from './view/complex.js';
import {create as createMarkerLayer} from './layer/marker.js';
import {createStore as createMarkerStore} from './view/marker.js';
import {create as createPubtranLayer} from './layer/pubtran.stop.js';
import {createStore as createUnitStore} from './view/unit.js';
import {getDefaultLayers} from './layer/layer.js';
import {
  refreshLabelStyle as refreshBuildingLabelStyle,
  refreshStyle as refreshBuildingStyle,
} from './view/building.js';
import {refreshStyle as refreshComplexStyle} from './view/complex.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import('./conf.js').RequiredOptions} RequiredOptions
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("./feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("./conf.js").State} State
 * @typedef {import("./create").MapListenersOptions} MapListenersOptions
 */

/**
 * @typedef {Object} AddLayersOptions
 * @property {Array<ol.Feature>} markers
 * @property {string} lang
 * @property {ol.AttributionLike} muAttrs
 * @property {boolean} [clusterFacultyAbbr]
 * @property {boolean} [showLabels]
 * @property {boolean} [locationCodes]
 * @property {MarkerLabelFunction} [markerLabel]
 * @property {boolean} [pubTran]
 * @property {ol.source.Vector} [markerSource]
 */

/**
 * @param {Element} target target
 * @param {string} lang language
 */
const addLoadingMessage = (target, lang) => {
  const messageDiv = document.createElement('div');
  messageDiv.id = 'message_' + target.id.toString();
  messageDiv.className = 'loading-message';
  messageDiv.style.cssText =
    'color: #999; font-size: 30px;' +
    ' font-weight: bold; vertical-align: middle; ' +
    ' font-family: Arial, Helvetica, sans-serif; ' +
    ' position: absolute; top: 0; left: 0; width: 100%;' +
    ' height: 100%; text-align: center;';

  const innerDiv = document.createElement('div');
  innerDiv.className = 'inner';
  innerDiv.style.cssText =
    'display:inline-block; vertical-align: middle; position: relative;';

  const message = document.createElement('p');
  message.className = 'text';
  message.appendChild(
    document.createTextNode(
      munimap_lang.getMsg(munimap_lang.Translations.LOADING_MAP, lang)
    )
  );

  const styleElInnerHTML =
    `#message_${target.id.toString()}` +
    `:before {box-sizing: inherit; content: \'\'; display: inline-block; ` +
    `height: 100%; vertical-align: middle; margin-right: -0.25em;}`;

  const styleEl = document.createElement('style');
  styleEl.id = 'message_' + target.id.toString() + '_style';
  styleEl.appendChild(document.createTextNode(styleElInnerHTML));

  messageDiv.appendChild(innerDiv);
  innerDiv.appendChild(message);
  target.appendChild(styleEl);
  target.appendChild(messageDiv);
};

/**
 * @param {Element} target target element
 */
const removeLoadingMessage = (target) => {
  const id = target.id.toString();
  const messageEl = document.getElementById(`message_${id}`);

  if (messageEl) {
    document.getElementById(`message_${id}`).remove();
    document.getElementById(`message_${id}_style`).remove();
  }
};

/**
 * @param {boolean} add whether to add or remove
 * @param {Element} target target element
 * @param {string} lang language
 */
const toggleLoadingMessage = (add, target, lang) => {
  add ? addLoadingMessage(target, lang) : removeLoadingMessage(target);
};

/**
 * Ensure basemap and change it if necessary.
 * @param {TileLayer} basemapLayer basemap
 * @param {ol.Map} map map
 */
const ensureBaseMap = (basemapLayer, map) => {
  if (map === undefined) {
    return;
  }
  const layers = map.getLayers();

  const currentIndex = layers
    .getArray()
    .findIndex((layer) => layer instanceof TileLayer);
  const currentId = layers.item(currentIndex).get('id');
  const newId = basemapLayer.get('id');

  if (currentId !== newId) {
    layers.setAt(currentIndex, basemapLayer);
  }
};

/**
 * Add controls to map.
 * @param {ol.Map} map map
 * @param {redux.Store} store store
 * @param {RequiredOptions} requiredOpts opts
 */
const addCustomControls = (map, store, requiredOpts) => {
  createControls(map, store, requiredOpts);
};

/**
 * Add layers to map.
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 */
const addLayers = (map, options) => {
  const {lang, showLabels} = options;
  const markerLayer = createMarkerLayer(map, options);
  options.markerSource = markerLayer.getSource();

  const markerClusterLayer = createClusterLayer(map, options);
  const layers = getDefaultLayers(lang, showLabels);
  layers.forEach((layer) => map.addLayer(layer));

  if (options.pubTran) {
    const pubTranLayer = createPubtranLayer(lang);
    map.addLayer(pubTranLayer);
  }

  map.addLayer(markerClusterLayer);
  map.addLayer(markerLayer);
};

/**
 * Attach listeners to Map.
 * @param {ol.Map} map map
 * @param {MapListenersOptions} options opts
 */
const attachMapListeners = (map, options) => {
  const {store, view, createInvalidCodesInfo, createLimitScrollInfo} = options;

  map.once('rendercomplete', () => {
    if (createInvalidCodesInfo) {
      createInvalidCodesInfo();
    }
    if (createLimitScrollInfo) {
      createLimitScrollInfo();
    }
    store.dispatch(
      actions.map_rendered({
        map_size: map.getSize(),
      })
    );
  });

  map.on('moveend', () => {
    store.dispatch(
      actions.ol_map_view_change({
        center: view.getCenter(),
        resolution: view.getResolution(),
      })
    );
  });
};

/**
 * Create global stores for features - buildings, rooms...
 * @param {redux.Store} reduxStore store
 */
const createFeatureStores = (reduxStore) => {
  const callbackFn = (action) => () => reduxStore.dispatch(action);
  createBuildingStore(callbackFn(actions.buildings_loaded()));
  createMarkerStore();
  createComplexStore();
  createUnitStore();
};

/**
 * Refresh styles for layers.
 * @param {State} state state
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshStyles = (state, layers) => {
  refreshBuildingStyle(state, layers);
  refreshBuildingLabelStyle(state, layers);
  refreshComplexStyle(state, layers);
};

export {
  attachMapListeners,
  ensureBaseMap,
  addCustomControls,
  addLayers,
  toggleLoadingMessage,
  createFeatureStores,
  refreshStyles,
};
