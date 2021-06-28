/**
 * @module view
 */

import * as munimap_assert from './assert/assert.js';
import * as munimap_cluster from './cluster/cluster.js';
import * as munimap_lang from './lang/lang.js';
import * as munimap_layer from './layer/layer.js';
import * as munimap_marker from './feature/marker.js';
import * as munimap_markerStyle from './style/marker.js';
import * as munimap_utils from './utils/utils.js';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import createControls from './control/controls.js';
import {BASEMAPS} from './layer/basemap.js';
import {RESOLUTION_COLOR} from './style/style.js';
import {create as createClusterLayer} from './layer/cluster.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import('./control/controls.js').CreateOptions} CreateOptions
 * @typedef {import("./layer/layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 */

/**
 * @typedef {Object} AddLayersOptions
 * @property {Array<ol.Feature>} markers
 * @property {string} lang
 * @property {ol.AttributionLike} muAttrs
 * @property {boolean} [clusterFacultyAbbr]
 * @property {boolean} [showLabels]
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
 * Change basemap if necessary.
 * @param {TileLayer} basemapLayer basemap
 * @param {ol.Map} map map
 */
const changeBaseMap = (basemapLayer, map) => {
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
 *
 * @param {ol.Map} map map
 * @param {CreateOptions} requiredOpts opts
 */
const addControls = (map, requiredOpts) => {
  createControls(map, requiredOpts);
};

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} layer
 */
const createMarkerLayer = (map, options) => {
  const {markers, lang, muAttrs} = options;
  const markerSource = munimap_marker.STORE;
  markerSource.setAttributions(muAttrs);
  markerSource.addFeatures(markers);

  const markerOptions = {
    map: map,
    markerSource: markerSource,
    //markerLabel: options.markerLabel,
    lang: lang,
  };
  const clusterResolution = munimap_cluster.BUILDING_RESOLUTION;
  // if (
  //   markers.length &&
  //   (markers.some((el) => {
  //     return munimap.room.isRoom(el);
  //   }) ||
  //     markers.some((el) => {
  //       return munimap.door.isDoor(el);
  //     })
  // ) {
  //   clusterResolution = munimap_cluster.ROOM_RESOLUTION;
  // }
  const markerLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */ ({
      id: munimap_marker.LAYER_ID,
      isFeatureClickable: munimap_marker.isClickable,
      featureClickHandler: munimap_marker.featureClickHandler,
      redrawOnFloorChange: true,
      source: markerSource,
      style: munimap_utils.partial(
        munimap_markerStyle.styleFunction,
        markerOptions
      ),
      maxResolution: clusterResolution.min,
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      renderOrder: null,
    })
  );
  markerLayer.once('precompose', munimap_markerStyle.getPattern);

  return markerLayer;
};

/**
 * @param {ol.Map} map map
 * @param {ol.source.Vector} markerSource source
 * @param {string} lang language
 * @param {boolean} showLabels whether to show labels for MU objects
 * @return {Array<VectorLayer>} default layers
 */
const getDefaultLayers = (map, markerSource, lang, showLabels) => {
  const layers = munimap_layer.getDefaultLayers(map, lang, showLabels);

  munimap_layer.setDefaultLayersProps({
    layers: layers,
    markersAwareOptions: {
      map: map,
      markerSource: markerSource,
      // markerLabel: markerLabel,
    },
  });

  return layers;
};

/**
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 * @return {VectorLayer} marker cluster layer
 */
const createMarkerClusterLayer = (map, options) => {
  return createClusterLayer(map, options);
};

/**
 * @param {ol.Map} map map
 * @param {number} resolution  resolution
 * @param {boolean} showLabels wheteher to show labels for MU objects
 */
const updateClusteredFeatures = (map, resolution, showLabels) => {
  munimap_cluster.updateClusteredFeatures(map, resolution, showLabels);
};

/**
 * Add layers to map.
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 */
const addLayers = (map, options) => {
  const {lang, showLabels} = options;
  const view = map.getView();
  const markerLayer = createMarkerLayer(map, options);
  const markerClusterLayer = createMarkerClusterLayer(map, options);
  const layers = getDefaultLayers(
    map,
    markerLayer.getSource(),
    lang,
    showLabels
  );
  layers.forEach((layer) => map.addLayer(layer));
  map.addLayer(markerClusterLayer);
  map.addLayer(markerLayer);
  updateClusteredFeatures(map, view.getResolution(), showLabels);
};

export {
  changeBaseMap,
  addControls,
  addLayers,
  createTileLayer,
  toggleLoadingMessage,
  createMarkerLayer,
  getDefaultLayers,
  createMarkerClusterLayer,
  updateClusteredFeatures,
};
