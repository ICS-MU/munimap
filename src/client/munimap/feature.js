goog.provide('munimap.feature');


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


/**
 *
 * @param {ol.Map} map
 * @param {ol.Coordinate} center
 */
munimap.feature.zoomToCenter = function(map, center) {
  var view = map.getView();
  var size = map.getSize() || null;
  var viewExtent = view.calculateExtent(size);
  var floorResolution = view.constrainResolution(
      munimap.floor.RESOLUTION.max);
  goog.asserts.assertNumber(floorResolution);
  var futureExtent = ol.extent.getForViewAndSize(center,
      floorResolution, view.getRotation(), size);
  munimap.move.setAnimation(map, viewExtent, futureExtent);
  view.setCenter(center);
  view.setResolution(floorResolution);
};
