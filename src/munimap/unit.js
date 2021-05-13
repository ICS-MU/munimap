/**
 * @module unit
 */
import * as munimap_load from './load.js';
import * as munimap_utils from './utils.js';
import munimap_assert from './assert.js';
import {MUNIMAP_URL} from './conf.js';
import {Vector as ol_source_Vector} from 'ol/source';

/**
 * @typedef {import("./type.js").Options} TypeOptions
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @type {string}
 * @protected
 */
const PRIORITY_FIELD_NAME = 'priorita';

/**
 * @type {ol.source.Vector}
 * @const
 */
const STORE = new ol_source_Vector();

/**
 * @type {TypeOptions}
 * @const
 */
const TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: MUNIMAP_URL,
  layerId: 6,
  name: 'unit',
};

/**
 * @param {ol.Feature} unit unit
 * @return {number} priority
 */
const getPriority = (unit) => {
  const result = unit.get(PRIORITY_FIELD_NAME);
  munimap_assert(munimap_utils.isNumber(result));
  return result;
};

/**
 * @param {string} where where
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const load = async (where) => {
  return await munimap_load.features({
    source: STORE,
    type: TYPE,
    method: 'POST',
    returnGeometry: false,
    where: where,
  });
};

/**
 * @param {Array<number>} buildingIds ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadByHeadquartersIds = async (buildingIds) => {
  const where = 'budova_sidelni_id IN (' + buildingIds.join() + ')';
  return await load(where);
};

export {getPriority, loadByHeadquartersIds};
