/**
 * @module cluster
 */

import * as munimap_range from '../utils/range.js';

/**
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 */

/**
 * @type {RangeInterface}
 * @const
 */
const ROOM_RESOLUTION = munimap_range.createResolution(
  1.19,
  Number.POSITIVE_INFINITY
);

/**
 * @type {RangeInterface}
 * @const
 */
const BUILDING_RESOLUTION = munimap_range.createResolution(
  2.39,
  Number.POSITIVE_INFINITY
);

export {BUILDING_RESOLUTION, ROOM_RESOLUTION};
