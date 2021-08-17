/**
 * @module feature/floor
 */

import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import {MUNIMAP_URL} from '../conf.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("../feature/floor.js").Options} FloorOptions
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
 *
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} Type
 */
export const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'polohKod',
      serviceUrl: MUNIMAP_URL,
      layerId: 5,
      name: 'floor',
    };
  }
  return TYPE;
};

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

/**
 * Create floor object from floor feature.
 * @param {ol.Feature} feature feature
 * @return {?FloorOptions} floor
 */
export const getFloorObject = (feature) => {
  if (feature) {
    const floorObj = {
      locationCode: /**@type {string}*/ (feature.get('polohKod')),
      floorLayerId: /**@type {number}*/ (feature.get('vrstvaId')),
    };
    return floorObj;
  }
  return null;
};
