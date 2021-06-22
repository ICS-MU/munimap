/**
 * @module floor
 */

import * as munimap_range from './range.js';

/**
 * @typedef {import("./range").RangeInterface} RangeInterface
 */

/**
 * @type {RangeInterface}
 * @const
 */
export const RESOLUTION = munimap_range.createResolution(0, 0.3);
