goog.provide('munimap.style.fragment');


/**
 *
 * @typedef {{
 *    filter: munimap.style.FilterFunction,
 *    style: (ol.style.Style | Array.<ol.style.Style>)
 * }}
 */
munimap.style.fragment.Options;


/**
 * @typedef {{
 *   selectedFloorFeature:? munimap.style.fragment.Options,
 *   activeFloorFeature:? munimap.style.fragment.Options,
 *   outdoorFeature:? munimap.style.fragment.Options,
 *   defaultFloorFeature:? munimap.style.fragment.Options
 * }}
 */
munimap.style.fragment.LayerOptions;


/**
 * @type {Array.<string>}
 * @const
 */
munimap.style.fragment.ORDER = [
  'selectedFloorFeature',
  'activeFloorFeature',
  'outdoorFeature',
  'defaultFloorFeature'
];
