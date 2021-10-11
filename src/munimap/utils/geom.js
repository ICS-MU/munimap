/**
 * @module utils/geom
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_utils from './utils.js';
import * as ol_extent from 'ol/extent';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import turf_bboxPolygon from '@turf/bbox-polygon';
import turf_intersect from '@turf/intersect';
import {
  Geometry,
  GeometryCollection,
  MultiPolygon,
  Point,
  Polygon,
} from 'ol/geom';
import {getBufferValue} from './extent.js';

/**
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("ol/format/GeoJSON").GeoJSONFeature} GeoJSONFeature
 * @typedef {import("ol/geom/LinearRing").default} ol.geom.LinearRing
 * @typedef {import("@turf/helpers").Polygon} TurfPolygon
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 */

/**
 * @typedef {function(ol.FeatureLike): (Geometry|ol.render.Feature|undefined)} GeometryFunction
 */

/**
 * @param {Feature} feature feature
 * @param {ol.Extent} extent extent
 * @param {!GeoJSON} format GeoJSON
 * @return {Feature} feature
 */
const featureExtentIntersect = (feature, extent, format) => {
  const turfFeature = /**@type {TurfPolygon}*/ (
    format.writeFeatureObject(feature)
  );
  const turfBBox = turf_bboxPolygon(extent);
  const turfIntersect = turf_intersect(turfFeature, turfBBox);
  return munimap_utils.isDef(turfIntersect)
    ? format.readFeature(turfIntersect)
    : null;
};

/**
 * @param {ol.geom.LinearRing} ring ring
 * @param {number} y y-coordinate (vertical coordinate)
 * @return {Array<number>} x-coordinates of intersections
 * @protected
 */
const getLinearRingHorizontalIntersections = (ring, y) => {
  const coordinates = ring.getCoordinates();
  const intersections = [];
  let i;
  for (i = coordinates.length - 1; i >= 1; --i) {
    const vertex1 = coordinates[i];
    const vertex2 = coordinates[i - 1];
    if (
      (vertex1[1] >= y && vertex2[1] <= y) ||
      (vertex1[1] <= y && vertex2[1] >= y)
    ) {
      const x =
        ((y - vertex1[1]) / (vertex2[1] - vertex1[1])) *
          (vertex2[0] - vertex1[0]) +
        vertex1[0];
      intersections.push(x);
    }
  }
  return intersections;
};

/**
 * @param {MultiPolygon} multipolygon polygon
 * @return {Polygon} largest polygon
 * @protected
 */
const getLargestPolygon = (multipolygon) => {
  const polygons = multipolygon.getPolygons();
  let result = null;
  let maxArea = 0;
  polygons.forEach((polygon) => {
    const area = polygon.getArea();
    if (!result || area > maxArea) {
      result = polygon;
      maxArea = area;
    }
  });
  return result;
};

/**
 * @param {Polygon|MultiPolygon} polygon polygon
 * @param {number} y y coordinate (vertical coordinate)
 * @return {Array<number>} x coordinates of intersections
 * @protected
 */
const getHorizontalIntersections = (polygon, y) => {
  const intersections = [];
  const geom =
    polygon instanceof MultiPolygon ? getLargestPolygon(polygon) : polygon;
  geom.getLinearRings().forEach((ring) => {
    const ringIntersections = getLinearRingHorizontalIntersections(ring, y);
    intersections.push(...ringIntersections);
  });
  return intersections;
};

/**
 * @param {Polygon|MultiPolygon} polygon polygon
 * @return {Point} better interior point
 */
const getBetterInteriorPoint = (polygon) => {
  const centerCoordinate = ol_extent.getCenter(polygon.getExtent());
  let interiorPoint;
  if (polygon.intersectsCoordinate(centerCoordinate)) {
    interiorPoint = centerCoordinate;
  } else {
    const resultY = centerCoordinate[1];

    const intersections = getHorizontalIntersections(polygon, resultY);
    intersections.sort();

    // Find the longest segment of the horizontal bounding box center line that
    // has its center point inside the polygon
    let i;
    let maxLength = 0;

    for (i = intersections.length - 1; i >= 1; --i) {
      const segmentLength = Math.abs(intersections[i] - intersections[i - 1]);
      if (segmentLength > maxLength) {
        const x = (intersections[i] + intersections[i - 1]) / 2;
        if (polygon.containsXY(x, resultY)) {
          maxLength = segmentLength;
          interiorPoint = [x, resultY];
        }
      }
    }
  }
  const point = new Point(interiorPoint || centerCoordinate);
  return point;
};

/**
 * @param {Geometry} geometry geom
 * @param {boolean} [opt_useOlInteriorPoint] use interior point
 * @return {Point} geom center
 */
const getGeometryCenter = (geometry, opt_useOlInteriorPoint) => {
  let center;
  if (geometry instanceof Polygon) {
    if (opt_useOlInteriorPoint) {
      center = geometry.getInteriorPoint();
    } else {
      center = getBetterInteriorPoint(geometry);
    }
  } else {
    const extent = geometry.getExtent();
    const coord = ol_extent.getCenter(extent);
    center = new Point(coord);
  }
  return center;
};

/**
 *
 * @param {Array<Feature>} features features
 * @return {Point} center point
 */
const getGeometryCenterOfFeatures = (features) => {
  const geomArray = features.map((feature) => feature.getGeometry());
  const geomCollection = new GeometryCollection(geomArray);
  return getGeometryCenter(geomCollection);
};

/**
 * @param {Feature|ol.render.Feature} feature feature
 * @return {Point} center geometry point
 * @const
 */
const CENTER_GEOMETRY_FUNCTION = (feature) => {
  munimap_assert.assertInstanceof(feature, Feature);
  let geom = feature.getGeometry();
  munimap_assert.assertInstanceof(geom, Geometry);
  if (geom instanceof MultiPolygon) {
    geom = getLargestPolygon(geom);
  }
  const center = getGeometryCenter(
    /** @type {Polygon}*/ (geom),
    munimap_building.isBuilding(feature)
  );
  return center;
};

/**
 * @param {ol.Extent} viewExt map
 * @param {Feature} feature feature
 * @return {Point} center point
 * @const
 */
const INTERSECT_CENTER_GEOMETRY_FUNCTION = (viewExt, feature) => {
  const refExt = ol_extent.buffer(viewExt, getBufferValue(viewExt));
  munimap_assert.assertInstanceof(feature, Feature);
  let geom = feature.getGeometry() || null;
  const featCenter = CENTER_GEOMETRY_FUNCTION(feature);
  if (geom.intersectsExtent(refExt) && !featCenter.intersectsExtent(refExt)) {
    const format = new GeoJSON();
    const intersect = featureExtentIntersect(feature, viewExt, format);
    geom = intersect.getGeometry() || null;
  }
  if (geom instanceof MultiPolygon) {
    geom = getLargestPolygon(geom);
  }
  const center = getGeometryCenter(geom, munimap_building.isBuilding(feature));
  return center;
};

export {
  CENTER_GEOMETRY_FUNCTION,
  INTERSECT_CENTER_GEOMETRY_FUNCTION,
  getGeometryCenter,
  getGeometryCenterOfFeatures,
  featureExtentIntersect,
};
