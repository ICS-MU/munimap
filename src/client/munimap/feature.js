goog.provide('munimap.feature');


/**
 *
 * @typedef {
 *  function(munimap.feature.clickHandlerOptions)
 * }
 */
munimap.feature.clickHandlerFunction;


/**
 * @typedef {{
 *   feature: ol.Feature,
 *   layer: ol.layer.Vector,
 *   map: ol.Map,
 *   pixel: ol.Pixel,
 *   resolution: number
 * }}
 */
munimap.feature.clickHandlerOptions;


/**
 * @typedef {
 *    function(munimap.feature.clickHandlerOptions): boolean
 * }
 */
munimap.feature.isClickableFunction;


/**
 * @param {ol.Map} map
 * @param {ol.Feature} feature
 * @param {ol.Pixel} pixel
 * @return {ol.Coordinate}
 */
munimap.feature.getClosestPointToPixel = function(map, feature, pixel) {
  var coordinate = map.getCoordinateFromPixel(pixel);
  var point = new ol.Feature(new ol.geom.Point(coordinate));
  var format = new ol.format.GeoJSON();
  var turfPoint =
      /**@type {GeoJSONFeature}*/(format.writeFeatureObject(point));
  var turfFeature =
      /**@type {GeoJSONFeature}*/(format.writeFeatureObject(feature));
  if (turf.inside(turfPoint, turfFeature)) {
    return coordinate;
  } else {
    var viewExtent = map.getView().calculateExtent(map.getSize() || null);
    var intersect =
        munimap.geom.featureExtentIntersect(feature, viewExtent, format);
    var closestPoint;
    if (goog.isDefAndNotNull(intersect)) {
      closestPoint = intersect.getGeometry().getClosestPoint(coordinate);
    }
    return closestPoint || null;
  }
};
