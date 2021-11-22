/**
 * @module conf
 */

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.size.Size
 * @typedef {import("./feature/floor.js").Options} FloorOptions
 */

/**
 * Whether to log selectors to console.
 * @type {boolean}
 */
export const ENABLE_SELECTOR_LOGS = false;

/**
 * @type {string}
 */
export const MUNIMAP_URL = PRODUCTION
  ? '//maps.muni.cz/arcgis/rest/services/munimap/MapServer/'
  : '//gis-dev.dis.ics.muni.cz/arcgis/rest/services/munimap/MapServer/';

/**
 * @type {string}
 */
export const MUNIMAP_PUBTRAN_URL = PRODUCTION
  ? '//maps.muni.cz/arcgis/rest/services/munimap_mhd/MapServer/'
  : '//gis-dev.dis.ics.muni.cz/arcgis/rest/services/munimap_mhd/MapServer/';

/**
 * @type {string}
 * @const
 */
export const MUNIMAP_PROPS_ID = 'munimapProps';

/**
 * @typedef {Object} RequiredOptions
 * @property {string} targetId target id
 * @property {number} [zoom] zoom
 * @property {ol.coordinate.Coordinate} [center] center
 * @property {Array<string>|string} [zoomTo] zoom to
 * @property {Array<string>} [markerIds] marker ids
 * @property {string} [lang] language
 * @property {boolean} [loadingMessage] whether to show loading message
 * @property {string} [baseMap] basemap
 * @property {boolean} [mapLinks] whether to show maplinks
 * @property {boolean} [clusterFacultyAbbr] whether to cluster faculty abbreviations
 * @property {boolean} [labels] whether to show labels
 * @property {boolean} [locationCodes] whether to show location codes
 * @property {boolean} [simpleScroll] whether to simple scrool or not
 * @property {string} [markerLabelId] marker label function id
 * @property {boolean} [pubTran] whethet to show public transportation stops
 * @property {Array<string>} [poiFilter] poi filter
 * @property {Array<string>} [markerFilter] marker filter
 */

/**
 * @typedef {Object} ErrorMessageState
 * @property {boolean} render whether to rende error div
 * @property {boolean} withMessage whether to render with message
 */

/**
 * @typedef {Object} State
 * @property {boolean} mapInitialized whther is map initialized
 * @property {ol.size.Size} mapSize map size
 * @property {ol.coordinate.Coordinate} center center
 * @property {number} resolution resolution
 * @property {number} rotation rotation
 * @property {string} baseMap basemap id
 * @property {RequiredOptions} requiredOpts required options
 * @property {number} markersTimestamp marker timestamp
 * @property {number} zoomToTimestamp zoom tos timestamp
 * @property {number} buildingsTimestamp buildings timestamp
 * @property {string} selectedFeature selected feature (building or floor)
 * @property {number} floorsTimestamp floors timestamp
 * @property {number} defaultRoomsTimestamp default rooms timestamp
 * @property {number} activeRoomsTimestamp active rooms timestamp
 * @property {number} doorsTimestamp doors timestamp
 * @property {number} poisTimestamp pois timestamp
 * @property {number} optPoisTimestamp opt pois timestamp
 * @property {ErrorMessageState} errorMessage error message
 */

/**
 * @typedef {Object} MapProps
 * @property {number} currentRes current resolution
 */

/**
 * @type {State}
 */
export const INITIAL_STATE = {
  mapInitialized: false,
  mapSize: null,
  center: null,
  resolution: null,
  rotation: 0,
  requiredOpts: {
    targetId: null,
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
    poiFilter: null,
    markerFilter: null,
  },
  markersTimestamp: null,
  zoomToTimestamp: null,
  baseMap: null,
  buildingsTimestamp: null,
  selectedFeature: null,
  floorsTimestamp: null,
  defaultRoomsTimestamp: null,
  activeRoomsTimestamp: null,
  doorsTimestamp: null,
  poisTimestamp: null,
  optPoisTimestamp: null,
  errorMessage: {
    render: null,
    withMessage: null,
  },
};
