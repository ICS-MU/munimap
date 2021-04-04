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
 * @typedef {Object} State
 * @property {ol.size.Size} map_size
 * @property {ol.coordinate.Coordinate} center
 * @property {string} center_proj
 * @property {number} zoom
 * @property {Array.<string>} zoomTos
 */

/**
 * @type State
 */
export const INITIAL_STATE = {
  map_size: [800, 400],
  center: [16.605390495656977, 49.1986567194723],
  center_proj: 'EPSG:4326',
  zoom: 13,
  zoomTos: [],
};
