/**
 * @module layer/basemap
 */

import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import {BASEMAPS} from './_constants.js';
import {assert} from '../assert/assert.js';
import {isDefAndNotNull} from '../utils/utils.js';
import {setStyle as setBaseMapStyle} from '../style/basemap.js';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 */

/**
 * @param {string} id id
 * @return {boolean} isArcGISBasemap
 */
const isArcGISBasemap = (id) => {
  return id === BASEMAPS.ARCGIS || id === BASEMAPS.ARCGIS_BW;
};

/**
 * @param {string} id id
 * @return {boolean} isOSMBasemap
 */
const isOSMBasemap = (id) => {
  return id === BASEMAPS.OSM || id === BASEMAPS.OSM_BW;
};

/**
 * @param {string} id id
 * @return {boolean} isBlackAndWhiteBasemap
 */
const isBWBasemap = (id) => {
  return id === BASEMAPS.ARCGIS_BW || id === BASEMAPS.OSM_BW;
};

/**
 * @param {string} id id
 * @return {string} basemap in pair
 */
const getPairedBasemap = (id) => {
  switch (id) {
    case BASEMAPS.ARCGIS:
      return BASEMAPS.OSM;
    case BASEMAPS.ARCGIS_BW:
      return BASEMAPS.OSM_BW;
    case BASEMAPS.OSM:
      return BASEMAPS.ARCGIS;
    case BASEMAPS.OSM_BW:
      return BASEMAPS.ARCGIS_BW;
    default:
      return undefined;
  }
};

/**
 * @param {string} basemapId basemap id
 * @param {string} [lang] lang
 * @return {TileLayer} layer
 */
const createLayer = (basemapId, lang) => {
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
    assert(isDefAndNotNull(lang), 'Language must be set.');
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
 * @param {ol.coordinate.Coordinate} center center
 * @param {number} resolution resolution
 * @param {string} requiredBasemap required basemap id
 * @return {string} id
 */
const getId = (center, resolution, requiredBasemap) => {
  const isSafeLatLon = munimap_utils.inRange(
    center[1],
    -8399737.89, //60° N
    8399737.89 //60° S
  );
  const isSafeResolution = munimap_utils.inRange(
    resolution,
    38.21851414258813,
    Infinity
  );
  const basemapLayerId =
    !isSafeLatLon && !isSafeResolution && isArcGISBasemap(requiredBasemap)
      ? getPairedBasemap(requiredBasemap)
      : requiredBasemap;

  return basemapLayerId;
};

export {
  BASEMAPS,
  createLayer,
  getPairedBasemap,
  getId,
  isArcGISBasemap,
  isOSMBasemap,
  isBWBasemap,
};
