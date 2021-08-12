/**
 * @module view
 */
import * as actions from './redux/action.js';
import * as munimap_assert from './assert/assert.js';
import * as munimap_lang from './lang/lang.js';
import * as munimap_layer from './layer/layer.js';
import * as munimap_utils from './utils/utils.js';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import createControls from './control/mapcontrolsview.js';
import {BASEMAPS} from './layer/basemap.js';
import {RESOLUTION_COLOR, refresh as refreshStyle} from './style/style.js';
import {createStore as createBuildingStore} from './view/building.js';
import {create as createClusterLyr} from './layer/cluster.js';
import {createStore as createComplexStore} from './view/complex.js';
import {create as createMarkerLyr} from './layer/marker.js';
import {createStore as createMarkerStore} from './view/marker.js';
import {create as createPubtranStopLayer} from './layer/pubtran.stop.js';
import {createStore as createUnitStore} from './view/unit.js';

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
 * @param {TileLayer} raster raster
 * @param {string} baseMap options
 */
const setBaseMapStyle = (raster, baseMap) => {
  raster.on('prerender', (evt) => {
    const ctx = evt.context;
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //set opacity of the layer according to current resolution
    const resolution = evt.frameState.viewState.resolution;
    const resColor = RESOLUTION_COLOR.find((obj, i, arr) => {
      return resolution > obj.resolution || i === arr.length - 1;
    });
    raster.setOpacity(resColor.opacity);
  });
  if (
    (baseMap === BASEMAPS.OSM_BW || baseMap === BASEMAPS.ARCGIS_BW) &&
    !munimap_utils.isUserAgentIE()
  ) {
    raster.on('postrender', (evt) => {
      const ctx = evt.context;
      ctx.globalCompositeOperation = 'color';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = '#000000';
      ctx.globalCompositeOperation = 'source-over';
    });
  }
};

/**
 * @param {string} basemapId basemap id
 * @param {string=} lang lang
 * @return {TileLayer} layer
 */
const createTileLayer = (basemapId, lang) => {
  let source;

  if (basemapId === BASEMAPS.ARCGIS || basemapId === BASEMAPS.ARCGIS_BW) {
    const esriAttribution =
      '© <a href="http://help.arcgis.com/' +
      'en/communitymaps/pdf/WorldTopographicMap_Contributors.pdf"' +
      ' target="_blank">Esri</a>';

    source = new XYZ({
      url:
        'https://server.arcgisonline.com/ArcGIS/rest/services/' +
        'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attributions: [esriAttribution],
      crossOrigin: null,
      maxZoom: 19,
    });
  } else if (basemapId === BASEMAPS.OSM || basemapId === BASEMAPS.OSM_BW) {
    munimap_assert.assert(
      munimap_utils.isDefAndNotNull(lang),
      'Language must be set.'
    );
    const osmAttribution = munimap_lang.getMsg(
      munimap_lang.Translations.OSM_ATTRIBUTION_HTML,
      lang
    );

    source = new OSM({
      attributions: [osmAttribution],
      crossOrigin: null,
      maxZoom: 18,
    });
  }

  const layer = new TileLayer({source});
  layer.set('id', basemapId);
  setBaseMapStyle(layer, basemapId);
  return layer;
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
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {ol.layer.Vector} layer
 */
const createMarkerLayer = (map, options) => {
  return createMarkerLyr(map, options);
};

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {Array<ol.layer.Vector>} default layers
 */
const getDefaultLayers = (map, options) => {
  const {markerSource, markerLabel, lang, showLabels} = options;
  const layers = munimap_layer.getDefaultLayers(map, lang, showLabels);

  munimap_layer.setDefaultLayersProps({
    layers,
    markersAwareOptions: {
      map: map,
      markerSource: markerSource,
      markerLabel: markerLabel,
      lang,
    },
  });

  return layers;
};

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {ol.layer.Vector} marker cluster layer
 */
const createClusterLayer = (map, options) => {
  return createClusterLyr(map, options);
};

/**
 * @param {string} lang language
 * @return {ol.layer.Vector} layer
 */
const createPubtranLayer = (lang) => {
  const pubTranAttribution = munimap_lang.getMsg(
    munimap_lang.Translations.PUBTRAN_ATTRIBUTION_HTML,
    lang
  );
  const pubTranLayer = createPubtranStopLayer();
  const pubTranSource = pubTranLayer.getSource();
  pubTranSource.setAttributions([pubTranAttribution]);
  return pubTranLayer;
};

/**
 * Add layers to map.
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 */
const addLayers = (map, options) => {
  const {lang} = options;
  const markerLayer = createMarkerLayer(map, options);
  options.markerSource = markerLayer.getSource();

  const markerClusterLayer = createClusterLayer(map, options);
  const layers = getDefaultLayers(map, options);
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
  refreshStyle(state, layers);
};

export {
  attachMapListeners,
  ensureBaseMap,
  addCustomControls,
  addLayers,
  createTileLayer,
  toggleLoadingMessage,
  createFeatureStores,
  refreshStyles,
};
