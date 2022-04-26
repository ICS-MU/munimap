/**
 * @module layer/basemap
 */

import * as mm_lang from '../lang/lang.js';
import * as mm_utils from '../utils/utils.js';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import {BasemapIds} from './constants.js';
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
  return id === BasemapIds.ARCGIS || id === BasemapIds.ARCGIS_BW;
};

/**
 * @param {string} id id
 * @return {boolean} isOSMBasemap
 */
const isOSMBasemap = (id) => {
  return id === BasemapIds.OSM || id === BasemapIds.OSM_BW;
};

/**
 * @param {string} id id
 * @return {boolean} isBlackAndWhiteBasemap
 */
const isBWBasemap = (id) => {
  return id === BasemapIds.ARCGIS_BW || id === BasemapIds.OSM_BW;
};

/**
 * @param {string} id id
 * @return {string} basemap in pair
 */
const getPairedBasemap = (id) => {
  switch (id) {
    case BasemapIds.ARCGIS:
      return BasemapIds.OSM;
    case BasemapIds.ARCGIS_BW:
      return BasemapIds.OSM_BW;
    case BasemapIds.OSM:
      return BasemapIds.ARCGIS;
    case BasemapIds.OSM_BW:
      return BasemapIds.ARCGIS_BW;
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

  if (basemapId === BasemapIds.ARCGIS || basemapId === BasemapIds.ARCGIS_BW) {
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
  } else if (basemapId === BasemapIds.OSM || basemapId === BasemapIds.OSM_BW) {
    assert(isDefAndNotNull(lang), 'Language must be set.');
    const osmAttribution = mm_lang.getMsg(
      mm_lang.Translations.OSM_ATTRIBUTION_HTML,
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
  const isSafeLatLon = mm_utils.inRange(
    center[1],
    -8399737.89, //60° N
    8399737.89 //60° S
  );
  const isSafeResolution = mm_utils.inRange(
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
  createLayer,
  getPairedBasemap,
  getId,
  isArcGISBasemap,
  isOSMBasemap,
  isBWBasemap,
};
