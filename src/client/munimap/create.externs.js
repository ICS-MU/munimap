/**
 * @type {Object}
 */
munimapx.create;


/**
 * @typedef {{
 *   target: (string|Element),
 *   zoom: (number|undefined),
 *   center: (ol.Coordinate|undefined),
 *   zoomTo: (Array.<string>|string|undefined),
 *   markers: (Array.<string>|Array.<ol.Feature>|undefined),
 *   markerLabel: (munimap.create.MarkerLabel|undefined),
 *   layers: (Array.<ol.layer.Vector>|undefined),
 *   lang: (string|undefined),
 *   baseMap: (string|undefined)
 * }}
 */
munimapx.create.Options;
