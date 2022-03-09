import {createResolution} from '../utils/range.js';

/**
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 */

/**
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = createResolution(0, 2.39);

export {RESOLUTION};
