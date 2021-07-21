/**
 * @module conf
 */

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.size.Size
 */

/**
 * @type {string}
 */
export const MUNIMAP_URL =
  '//maps.muni.cz/arcgis/rest/services/munimap/MapServer/';

/**
 * @type {string}
 */
export const MUNIMAP_PUBTRAN_URL =
  '//maps.muni.cz/arcgis/rest/services/munimap_mhd/MapServer/';

/**
 * @type {string}
 * @const
 */
export const MUNIMAP_PROPS_ID = 'munimapProps';

/**
 * @typedef {Object} RequiredOptions
 * @property {string} target
 * @property {number} [zoom]
 * @property {ol.coordinate.Coordinate} [center]
 * @property {Array.<string>|string} [zoomTo]
 * @property {Array.<string>} [markerIds]
 * @property {string} [lang]
 * @property {boolean} [loadingMessage]
 * @property {string} [baseMap]
 * @property {boolean} [mapLinks]
 * @property {boolean} [clusterFacultyAbbr]
 * @property {boolean} [labels]
 * @property {boolean} [locationCodes]
 * @property {boolean} [simpleScroll]
 * @property {string} [markerLabelId]
 * @property {boolean} [pubTran]
 */

/**
 * @typedef {Object} State
 * @property {ol.size.Size} map_size
 * @property {boolean} initMap
 * @property {ol.coordinate.Coordinate} center
 * @property {number} resolution
 * @property {string} baseMap,
 * @property {RequiredOptions} requiredOpts
 * @property {number} markersTimestamp
 * @property {number} zoomToTimestamp
 * @property {number} buildingsTimestamp
 */

/**
 * @typedef {Object} MapProps
 * @property {number} currentRes
 */

/**
 * @type {State}
 */
export const INITIAL_STATE = {
  map_size: null,
  initMap: null,
  center: null,
  resolution: null,
  requiredOpts: {
    target: null,
    markerIds: [],
    lang: 'cs',
    baseMap: 'arcgis-bw',
    zoomTo: [],
    loadingMessage: true,
    mapLinks: false,
    clusterFacultyAbbr: false,
    labels: true,
    locationCodes: false,
    simpleScroll: true,
    markerLabelId: null,
    pubTran: false,
    zoom: null,
    center: null,
  },
  markersTimestamp: null,
  zoomToTimestamp: null,
  baseMap: null,
  buildingsTimestamp: null,
};
