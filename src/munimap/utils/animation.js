/**
 * @module utils/animation
 */

import {getArea, getEnlargedArea, getForViewAndSize} from 'ol/extent';

/**
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("ol/geom").Point} ol.geom.Point
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("../conf.js").AnimationRequestOptions} AnimationRequestOptions
 */

/**
 * @typedef {object} ViewOptions
 * @property {number} resolution resolution
 * @property {number} rotation rotation
 * @property {ol.Size} size size
 * @property {ol.Extent} extent extent
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
 * @param {ol.Coordinate} point point
 * @param {ViewOptions} options options
 * @return {AnimationRequestOptions} result
 */
const getAnimationRequestParams = (point, options) => {
  const {resolution, rotation, size, extent} = options;
  const futureExtent = getForViewAndSize(point, resolution, rotation, size);
  return {
    center: point,
    duration: getAnimationDuration(extent, futureExtent),
    resolution,
    extent: null,
  };
};

export {getAnimationDuration, getAnimationRequestParams};
