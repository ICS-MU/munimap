/**
 * @module utils/animation
 */

import {getArea, getEnlargedArea, getForViewAndSize} from 'ol/extent';

/**
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("ol/geom").Point} ol.geom.Point
 */

/**
 * @typedef {Object} AnimationRequestOptions
 * @property {string} [selectedFeature] selected feature
 * @property {ol.geom.Point|ol.Coordinate} [center] center
 * @property {number} [resolution] resolution
 * @property {number} [duration] duration
 * @property {ol.Extent} [extent] extent
 */

/**
 * @param {ol.Extent} ext1 extent
 * @param {ol.Extent} ext2 extent
 * @return {number} duration
 */
const getAnimationDuration = (ext1, ext2) => {
  const area1 = getArea(ext1);
  const area2 = getArea(ext2);
  const enlArea = getEnlargedArea(ext1, ext2);
  const diagonal = Math.sqrt(enlArea);
  let ratio = diagonal / Math.sqrt(area1 + area2);

  if (ratio > 5) {
    ratio = diagonal < 10000 ? 2.5 : 5;
  }
  return ratio * 1000;
};

/**
 * @param {ol.Map} map map
 * @param {ol.Coordinate} point point
 * @param {number} resolution resolution
 * @return {AnimationRequestOptions} result
 */
const getAnimationRequestParams = (map, point, resolution) => {
  const view = map.getView();
  const size = map.getSize() || null;
  const viewExtent = view.calculateExtent(size);
  const futureExtent = getForViewAndSize(
    point,
    view.getConstrainedResolution(resolution),
    view.getRotation(),
    size
  );
  const duration = getAnimationDuration(viewExtent, futureExtent);
  return {
    center: point,
    duration: duration,
    resolution: view.getConstrainedResolution(resolution),
  };
};

export {getAnimationDuration, getAnimationRequestParams};
