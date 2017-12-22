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
<<<<<<< HEAD
 *   baseMap: (string|undefined)
=======
 *   baseMap: (string|undefined),
 *   pubTran: (boolean|undefined),
<<<<<<< HEAD
 *   locationCodes: (boolean|undefined)
>>>>>>> bd66799... add switch to munimap.create for showing location codes instead of room numbers
=======
 *   locationCodes: (boolean|undefined),
 *   mapLinks: (boolean|undefined)
>>>>>>> 0f3ae86... fixed bubble position, fixed code style, link renamed to mapLinks
 * }}
 */
munimapx.create.Options;
