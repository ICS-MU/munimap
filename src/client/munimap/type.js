goog.provide('munimap.type');


/**
 * @type {string}
 * @const
 */
munimap.type.NAME = 'featureType';


/**
 * @typedef {{
 *   primaryKey: (string),
 *   serviceUrl: (string),
 *   store: (ol.source.Vector),
 *   layerId: (number),
 *   name: (string)
 * }}
 */
munimap.type.Options;


/**
 * @typedef {{
 *   name: (string)
 * }}
 */
munimap.type.SimpleOptions;


