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
 * @type {Array.<string>}
 * @const
 */
munimap.style.fragment.ORDER = [
  'selectedFloorFeature',
  'activeFloorFeature',
  'defaultFloorFeature',
  'outdoorFeature'
];
