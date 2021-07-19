/**
 * @module conf
 */

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.size.Size
 * @typedef {import("./create.js").Options} CreateOptions
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
 * @typedef {Object} State
 * @property {ol.size.Size} map_size
 * @property {boolean} initMap
 * @property {ol.coordinate.Coordinate} center
 * @property {number} resolution
 * @property {string} baseMap,
 * @property {CreateOptions} requiredOpts
 * @property {number} markersTimestamp
 * @property {number} zoomToTimestamp
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
    markers: [],
    lang: 'cs',
    baseMap: 'arcgis-bw',
    zoomTo: [],
    loadingMessage: true,
    mapLinks: false,
    clusterFacultyAbbr: false,
    labels: true,
    locationCodes: false,
    simpleScroll: true,
    markerLabel: null,
    pubTran: false,
    zoom: null,
    center: null,
  },
  markersTimestamp: null,
  zoomToTimestamp: null,
  baseMap: null,
};
