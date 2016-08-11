/**
 * @fileoverview Externs for turf.
 * @externs
 */
var turf = {};


/**
 *
 * @param {ol.Extent} extent
 * @return {GeoJSONFeature}
 */
turf.bboxPolygon = function(extent) {};


/**
 * @param {GeoJSONFeature|GeoJSONFeatureCollection} feature
 * @param {number} radius
 * @param {string} units
 * @return {GeoJSONFeature|GeoJSONFeatureCollection}
 */
turf.buffer = function(feature, radius, units) {};


/**
 * @param {GeoJSONFeature} point
 * @param {GeoJSONFeature} polygon
 * @return {boolean}
 */
turf.inside = function(point, polygon) {};


/**
 * @param {GeoJSONFeature} polygon1
 * @param {GeoJSONFeature} polygon2
 * @return {GeoJSONFeature}
 */
turf.intersect = function(polygon1, polygon2) {};
