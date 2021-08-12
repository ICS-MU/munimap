/**
 * @module feature/floor
 */

import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 */

/**
 * @typedef {Object} Options
 * @property {string} locationCode
 * @property {number} floorLayerId
 */

/**
 * @type {RangeInterface}
 * @const
 */
export const RESOLUTION = munimap_range.createResolution(0, 0.3);

/**
 * Filter function.
 *
 * @param {ol.Feature} feature feature
 * @param {?string} selectedFloorCode location code
 * @return {boolean} filter boolean
 */
export const selectedFloorFilter = (feature, selectedFloorCode) => {
  if (munimap_utils.isDefAndNotNull(selectedFloorCode)) {
    const locCode = /**@type {string}*/ (feature.get('polohKod'));
    return selectedFloorCode.startsWith(locCode);
  }
  return false;
};
