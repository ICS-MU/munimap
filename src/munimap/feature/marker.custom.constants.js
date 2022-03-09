import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import Point from 'ol/geom/Point';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/geom").Point} ol.geom.Point
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 */

export const LABEL_FIELD_NAME = 'label';

export const TYPE = {
  name: 'custom-marker',
};

/**
 * True if the feature is suitable to become custom marker.
 * @param {ol.FeatureLike} feature feature
 * @return {boolean} suitability
 */
export const isSuitable = (feature) => {
  const geom = feature.getGeometry();
  let result = geom instanceof Point;
  if (result) {
    const proj = ol_proj.get('EPSG:4326');
    const projExtent = proj.getExtent();
    result = ol_extent.containsCoordinate(
      projExtent,
      /**@type {ol.geom.Point}*/ (geom).getCoordinates()
    );
  }
  return result;
};
