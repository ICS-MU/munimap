/**
 * @module conf
 */

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.size.Size
 * @typedef {import("./feature/floor.js").Options} FloorOptions
 * @typedef {import("./feature/cluster.js").ClusterOptions} ClusterOptions
 * @typedef {import("./utils/range.js").RangeInterface} RangeInterface
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/geom").Point} ol.geom.Point
 */

/**
 * @typedef {object} RequiredOptions
 * @property {string} targetId target id
 * @property {number} [zoom] zoom
 * @property {ol.coordinate.Coordinate} [center] center
 * @property {Array<string>|string} [zoomTo] zoom to
 * @property {Array<string>} [markerIds] marker ids
 * @property {string} [lang] language
 * @property {boolean} [loadingMessage] whether to show loading message
 * @property {string} [baseMap] basemap
 * @property {boolean} [mapLinks] whether to show maplinks
 * @property {boolean} [labels] whether to show labels
 * @property {boolean} [locationCodes] whether to show location codes
 * @property {boolean} [simpleScroll] whether to simple scrool or not
 * @property {string} [markerLabelId] marker label function id
 * @property {boolean} [pubTran] whethet to show public transportation stops
 * @property {Array<string>} [poiFilter] poi filter
 * @property {Array<string>} [markerFilter] marker filter
 * @property {string} [getMainFeatureAtPixelId] getMainFeatureAtPixel id
 * @property {Array<string>} [identifyTypes] identifyTypes
 * @property {string} [identifyCallbackId] identifyCallbackId id
 * @property {boolean} [tooltips] whether to show poi tooltips
 * @property {ClusterOptions} [cluster] cluster options
 */

/**
 * @typedef {object} ErrorMessageState
 * @property {boolean} render whether to rende error div
 * @property {boolean} withMessage whether to render with message
 */

/**
 * @typedef {object} PopupContentOptions
 * @property {string} [name] title
 * @property {string} [open] text
 */

/**
 * @typedef {object} PopupState
 * @property {string} uid unique identifier from vector source
 */

/**
 * @typedef {object} TooltipState
 * @property {string} title title
 * @property {ol.coordinate.Coordinate} positionInCoords positionInCoords
 */

/**
 * @typedef {object} AnimationRequestOptions
 * @property {ol.geom.Point|ol.coordinate.Coordinate} center center
 * @property {number} resolution resolution
 * @property {number} duration duration
 * @property {ol.extent.Extent} extent extent
 *
 * @typedef {Array<AnimationRequestOptions|Array<AnimationRequestOptions>>} AnimationRequestState
 */

/**
 * @typedef {object} State
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
 * @property {number} optPoisTimestamp opt pois timestamp
 * @property {number} identifyTimestamp identify timestamp
 * @property {ErrorMessageState} errorMessage error message
 * @property {AnimationRequestState} animationRequest requested view
 * @property {PopupState} popup popup
 * @property {number} resetTimestamp reset timestamp
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
 */
export const IDOS_URL = 'https://idos.idnes.cz/idsjmk/spojeni/';

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
    labels: true,
    locationCodes: false,
    simpleScroll: true,
    markerLabelId: null,
    pubTran: false,
    zoom: null,
    center: null,
    poiFilter: null,
    markerFilter: null,
    getMainFeatureAtPixelId: null,
    identifyTypes: ['building', 'room', 'door'],
    identifyCallbackId: null,
    tooltips: true,
    cluster: null,
  },
  markersTimestamp: null,
  zoomToTimestamp: null,
  baseMap: null,
  buildingsTimestamp: null,
  selectedFeature: null,
  floorsTimestamp: null,
  optPoisTimestamp: null,
  identifyTimestamp: null,
  errorMessage: {
    render: null,
    withMessage: null,
  },
  animationRequest: [
    {
      center: null,
      resolution: null,
      duration: null,
      extent: null,
    },
  ],
  popup: {
    uid: null,
  },
  resetTimestamp: null,
};
