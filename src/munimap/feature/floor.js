/**
 * @module feature/floor
 */

import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import {MUNIMAP_URL} from '../conf.js';
import {getStore as getFloorStore} from '../source/floor.js';

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
 * @type {RegExp}
 * @protected
 */
const CODE_REGEX = /^[A-Z]{3}[0-9]{2}[NPMZS][0-9]{2}$/gi;

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
 * @param {string} maybeCode location code
 * @return {boolean} if it it location code or not
 */
export const isCode = (maybeCode) => {
  return !!maybeCode.match(CODE_REGEX);
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

/**
 * Get floor from its store by floor code.
 * @param {string} code location code
 * @return {ol.Feature} floor feature
 */
export const getFloorByCode = (code) => {
  const store = getFloorStore();
  if (store) {
    return (
      store.getFeatures().find((floor) => floor.get('polohKod') === code) ||
      null
    );
  }
  return null;
};

/**
 * Get floor layer id by floor code.
 * @param {string} code location code
 * @return {number} floor lazer id
 */
export const getFloorLayerIdByCode = (code) => {
  const floor = getFloorByCode(code);
  if (!floor) {
    return;
  }
  return floor.get('vrstvaId');
};
