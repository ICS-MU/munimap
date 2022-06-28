/**
 * @module utils/map
 */

import {
  apply as applyTransform,
  compose as composeTransform,
  create as createTransform,
} from 'ol/transform.js';
import {isDefAndNotNull} from './utils.js';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/pixel").Pixel} ol.pixel.Pixel
 * @typedef {import("ol/size").Size} ol.Size
 */

/**
 * @typedef {object} Options
 * @property {ol.Size} size size
 * @property {number} rotation rotation
 * @property {number} resolution resolution
 * @property {ol.coordinate.Coordinate} center center
 */

/**
 * @param {ol.coordinate.Coordinate} coordinate coordinate
 * @param {Options} options options
 * @return {ol.pixel.Pixel} pixel
 */
const getPixelFromCoordinate = (coordinate, options) => {
  if (Object.values(options).some((opt) => !isDefAndNotNull(opt))) {
    return null;
  }

  const {size, resolution, rotation, center} = options;
  const transform = createTransform();
  composeTransform(
    transform,
    size[0] / 2,
    size[1] / 2,
    1 / resolution,
    -1 / resolution,
    -rotation,
    -center[0],
    -center[1]
  );

  return applyTransform(transform, coordinate.slice(0, 2));
};

export {getPixelFromCoordinate};
