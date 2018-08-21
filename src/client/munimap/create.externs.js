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
<<<<<<< HEAD
 *   mapLinks: (boolean|undefined)
>>>>>>> 0f3ae86... fixed bubble position, fixed code style, link renamed to mapLinks
=======
 *   mapLinks: (boolean|undefined),
 *   markerFilter: (Array.<string>|undefined),
<<<<<<< HEAD
>>>>>>> 2c1dbb3... marker filter init
=======
 *   labels: (boolean|undefined),
>>>>>>> b2619a8... basemap arcgis, labels param
 * }}
 */
munimapx.create.Options;
