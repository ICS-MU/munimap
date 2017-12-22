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
 *   getMainFeatureAtPixel: (munimap.getMainFeatureAtPixelFunction|undefined),
 *   markers: (Array.<string>|Array.<ol.Feature>|undefined),
 *   markerLabel: (munimap.marker.LabelFunction|undefined),
 *   layers: (Array.<ol.layer.Vector>|undefined),
 *   lang: (string|undefined),
 *   baseMap: (string|undefined),
 *   pubTran: (boolean|undefined),
 *   locationCodes: (boolean|undefined),
 *   mapLinks: (boolean|undefined)
 * }}
 */
munimapx.create.Options;
