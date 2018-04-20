goog.provide('munimap.geom');


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @return {ol.geom.Point}
 * @const
 */
munimap.geom.CENTER_GEOMETRY_FUNCTION = function(feature) {
  var center;
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var geom = feature.getGeometry();
  goog.asserts.assertInstanceof(geom, ol.geom.Geometry);
  if (geom instanceof ol.geom.MultiPolygon) {
    geom = munimap.geom.getLargestPolygon(geom);
  }
  center = munimap.geom.getGeometryCenter(
    geom, munimap.building.isBuilding(feature));
  return center;
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} feature
 * @return {ol.geom.Point}
 * @const
 */
munimap.geom.INTERSECT_CENTER_GEOMETRY_FUNCTION = function(map, feature) {
  var center;
  var viewExt = map.getView().calculateExtent(map.getSize() || null);
  var refExt =
      ol.extent.buffer(viewExt, munimap.getBufferValue(viewExt));
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var geom = feature.getGeometry() || null;
  var featCenter = munimap.geom.CENTER_GEOMETRY_FUNCTION(feature);
  if (geom.intersectsExtent(refExt) && !featCenter.intersectsExtent(refExt)) {
    var format = new ol.format.GeoJSON();
    var intersect =
        munimap.geom.featureExtentIntersect(feature, viewExt, format);
    geom = intersect.getGeometry() || null;
  }
  if (geom instanceof ol.geom.MultiPolygon) {
    geom = munimap.geom.getLargestPolygon(geom);
  }
  center = munimap.geom.getGeometryCenter(
    geom, munimap.building.isBuilding(feature));
  return center;
};


/**
 * @param {ol.geom.Geometry} geometry
 * @param {boolean=} opt_useOlInteriorPoint
 * @return {ol.geom.Point}
 */
munimap.geom.getGeometryCenter = function(geometry, opt_useOlInteriorPoint) {
  var center;
  if (geometry instanceof ol.geom.Polygon) {
    if (opt_useOlInteriorPoint) {
      center = geometry.getInteriorPoint();
    } else {
      center = munimap.geom.getBetterInteriorPoint(geometry);
    }
  } else {
    var extent = geometry.getExtent();
    var coord = ol.extent.getCenter(extent);
    center = new ol.geom.Point(coord);
  }
  return center;
};


/**
 *
 * @param {Array.<ol.Feature>} features
 * @return {ol.geom.Point}
 */
munimap.geom.getGeometryCenterOfFeatures = function(features) {
  var geomArray = features.map(function(feature) {
    return feature.getGeometry();
  });
  var geomCollection = new ol.geom.GeometryCollection(geomArray);
  return munimap.geom.getGeometryCenter(geomCollection);
};


/**
 * @param {ol.Feature} feature
 * @param {ol.Extent} extent
 * @param {!ol.format.GeoJSON} format
 * @return {ol.Feature}
 */
munimap.geom.featureExtentIntersect = function(feature, extent, format) {
  var turfFeature =
  /**@type {GeoJSONFeature}*/(format.writeFeatureObject(feature));
  var turfBBox = turf.bboxPolygon(extent);
  var turfIntersect = turf.intersect(turfFeature, turfBBox);
  return goog.isDef(turfIntersect) ? format.readFeature(turfIntersect) : null;
};


/**
 * @param {ol.geom.LinearRing} ring
 * @param {number} y y-coordinate (vertical coordinate)
 * @return {Array.<number>} x-coordinates of intersections
 * @protected
 */
munimap.geom.getLinearRingHorizontalIntersections = function(ring, y) {
  var coordinates = ring.getCoordinates();
  var intersections = [];
  var i;
  for (i = coordinates.length - 1; i >= 1; --i) {
    var vertex1 = coordinates[i];
    var vertex2 = coordinates[i - 1];
    if ((vertex1[1] >= y && vertex2[1] <= y) ||
        (vertex1[1] <= y && vertex2[1] >= y)) {
      var x = (y - vertex1[1]) / (vertex2[1] - vertex1[1]) *
          (vertex2[0] - vertex1[0]) + vertex1[0];
      intersections.push(x);
    }
  }
  return intersections;
};


/**
 * @param {ol.geom.Polygon|ol.geom.MultiPolygon} polygon
 * @param {number} y y coordinate (vertical coordinate)
 * @return {Array.<number>} x coordinates of intersections
 * @protected
 */
munimap.geom.getHorizontalIntersections = function(polygon, y) {
  var intersections = [];
  goog.array.forEach(polygon.getLinearRings(), function(ring) {
    var ringIntersections =
        munimap.geom.getLinearRingHorizontalIntersections(ring, y);
    goog.array.extend(intersections, ringIntersections);
  });
  return intersections;
};


/**
 * @param {ol.geom.Polygon|ol.geom.MultiPolygon} polygon
 * @return {ol.geom.Point}
 */
munimap.geom.getBetterInteriorPoint = function(polygon) {
  var centerCoordinate = ol.extent.getCenter(polygon.getExtent());
  var interiorPoint;
  if (polygon.intersectsCoordinate(centerCoordinate)) {
    interiorPoint = centerCoordinate;
  } else {
    var resultY = centerCoordinate[1];

    var intersections =
        munimap.geom.getHorizontalIntersections(polygon, resultY);
    intersections.sort();

    // Find the longest segment of the horizontal bounding box center line that
    // has its center point inside the polygon
    var i;
    var maxLength = 0;

    for (i = intersections.length - 1; i >= 1; --i) {
      var segmentLength = Math.abs(intersections[i] - intersections[i - 1]);
      if (segmentLength > maxLength) {
        var x = (intersections[i] + intersections[i - 1]) / 2;
        if (polygon.containsXY(x, resultY)) {
          maxLength = segmentLength;
          interiorPoint = [x, resultY];
        }
      }
    }
  }
  var point = new ol.geom.Point(interiorPoint || centerCoordinate);
  return point;
};


/**
 * @param {ol.geom.MultiPolygon} multipolygon
 * @return {ol.geom.Polygon}
 * @protected
 */
munimap.geom.getLargestPolygon = function(multipolygon) {
  var polygons = multipolygon.getPolygons();
  var result = null;
  var maxArea = 0;
  polygons.forEach(function(polygon) {
    var area = polygon.getArea();
    if (!result || area > maxArea) {
      result = polygon;
      maxArea = area;
    }
  });
  return result;
};
