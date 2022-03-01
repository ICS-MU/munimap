/**
 * @module feature/floor
 */

import * as munimap_range from '../utils/range.js';
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
 * @property {string} locationCode location code
 * @property {number} floorLayerId floor layer id
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
 * Floor types.
 * @enum {string}
 */
export const FloorTypes = {
  UNDERGROUND: 'P',
  UNDERGROUND_MEZZANINE: 'Z',
  ABOVEGROUND: 'N',
  MEZZANINE: 'M',
};

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
 * Get floor from its store by floor code.
 * @param {string} targetId targetId
 * @param {string} code location code
 * @return {ol.Feature} floor feature
 */
export const getFloorByCode = (targetId, code) => {
  const store = getFloorStore(targetId);
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
 * @param {string} targetId targetId
 * @param {string} code location code
 * @return {number} floor lazer id
 */
export const getFloorLayerIdByCode = (targetId, code) => {
  const floor = getFloorByCode(targetId, code);
  if (!floor) {
    return;
  }
  return floor.get('vrstvaId');
};

/**
 * Return ID for ordering.
 * @param {string} floorCode floor code (full or 3-character).
 * @return {number} ID for ordering.
 */
const getOrderId = (floorCode) => {
  const prefix = floorCode.length > 3 ? 5 : 0;
  const letter = floorCode[prefix + 0];
  let num = parseInt(floorCode.substr(prefix + 1), 10);

  switch (letter) {
    case FloorTypes.UNDERGROUND:
      num = num * -2;
      break;
    case FloorTypes.UNDERGROUND_MEZZANINE:
      num = num * -2 + 1;
      break;
    case FloorTypes.ABOVEGROUND:
      num = (num - 1) * 2;
      break;
    case FloorTypes.MEZZANINE:
      num = (num - 1) * 2 + 1;
      break;
    default:
      break;
  }
  return num;
};

/**
 * Compare two floor codes by altitute, from lowest to highest.
 * @param {string} a floor code.
 * @param {string} b floor code.
 * @return {number} num
 */
const compareCodesByAltitude = (a, b) => {
  return getOrderId(a) - getOrderId(b);
};

/**
 * @param {ol.Feature} a code
 * @param {ol.Feature} b code
 * @return {number} num
 */
export const sort = (a, b) => {
  const aCode = /**@type {string}*/ (a.get('polohKod'));
  const bCode = /**@type {string}*/ (b.get('polohKod'));
  return compareCodesByAltitude(aCode, bCode);
};
