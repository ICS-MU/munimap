/**
 * @module style/stylefragment
 */

/**
 * @typedef {import("ol/style/Style").default} ol.style.Style
 * @typedef {import("./style.js").FilterFunction} StyleFilterFunction
 * @typedef {import("./style.js").StyleFunction} StyleFunction
 */

/**
 * @typedef {Object} FragmentLayerOptions{{
 * @property {FragmentOptions} [selectedFloorFeature]
 * @property {FragmentOptions} [activeFloorFeature]
 * @property {FragmentOptions} [outdoorFeature]
 * @property {FragmentOptions} [defaultFloorFeature]
 * }}
 */

/**
 *
 * @typedef {Object} FragmentOptions {{
 * @property {StyleFilterFunction} filter
 * @property {ol.style.Style | Array.<ol.style.Style> | StyleFunction} style
 * }}
 */

/**
 * @type {Array.<string>}
 * @const
 */
export const ORDER = [
  'selectedFloorFeature',
  'activeFloorFeature',
  'defaultFloorFeature',
  'outdoorFeature',
];
