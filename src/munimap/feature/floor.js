/**
 * @module feature/floor
 */

import {FloorTypes} from './floor.constants.js';
import {getFloorStore} from '../source/_constants.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("../feature/floor.js").Options} FloorOptions
 */

/**
 * @typedef {Object} Options
 * @property {string} locationCode location code
 * @property {number} floorLayerId floor layer id
 */

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
  let num = parseInt(floorCode.substring(prefix + 1), 10);

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

/**
 * @param {string} targetId targetId
 * @param {string} selectedFeature selected feature
 * @return {Array<string>} floor codes
 */
export const getActiveCodes = (targetId, selectedFeature) => {
  const floors = getFloorStore(targetId).getFeatures();
  const activeFloorLayerId = getFloorLayerIdByCode(targetId, selectedFeature);
  const active = floors.filter(
    (floor) => floor.get('vrstvaId') === activeFloorLayerId
  );
  const codes = active.map((floor) => {
    return /**@type {string}*/ (floor.get('polohKod'));
  });
  return codes;
};

/**
 * @param {string} targetId targetId
 * @param {string} selectedFeature selected feature
 * @return {Array<ol.Feature>} floor codes
 */
export const getFloorsByBuildingCode = (targetId, selectedFeature) => {
  const store = getFloorStore(targetId);
  if (store) {
    const features = store.getFeatures();
    const floors = features.filter((floor) => {
      const locationCode = floor.get('polohKod');
      return locationCode.startsWith(selectedFeature.substring(0, 5));
    });
    return floors || [];
  }
  return [];
};
