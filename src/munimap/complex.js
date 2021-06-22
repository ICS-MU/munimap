/**
 * @module complex
 */

import * as munimap_assert from './assert.js';
import * as munimap_load from './load.js';
import * as munimap_range from './range.js';
import VectorSource from 'ol/source/Vector';
import {MUNIMAP_URL} from './conf.js';
import {NAME as TYPE_NAME} from './type.js';

/**
 * @typedef {import('./range.js').RangeInterface} RangeInterface
 * @typedef {import('./type.js').Options} TypeOptions
 * @typedef {import("./load.js").Processor} Processor
 */

/**
 * @typedef {Object} LoadByIdsOptions
 * @property {Array<number>} ids
 * @property {Processor} [processor]
 */

/**
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = munimap_range.createResolution(1.19, 4.77);

/**
 * @type {string}
 */
const ID_FIELD_NAME = 'inetId';

/**
 * @type {string}
 */
const UNITS_FIELD_NAME = 'pracoviste';

/**
 *
 * @type {number}
 * @protected
 */
const FONT_SIZE = 13;

/**
 * @type {VectorSource}
 * @const
 */
const STORE = new VectorSource();

/**
 *
 * @type {TypeOptions}
 */
const TYPE = {
  primaryKey: ID_FIELD_NAME,
  serviceUrl: MUNIMAP_URL,
  store: STORE,
  layerId: 4,
  name: 'complex',
};

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'complex';

/**
 * @param {number} id id
 * @param {Array.<ol.Feature>=} opt_features optional features
 * @return {ol.Feature} building
 */
const getById = (id, opt_features) => {
  const features = opt_features || STORE.getFeatures();
  const result = features.find((feature) => {
    const idProperty = TYPE.primaryKey;
    return feature.get(idProperty) === id;
  });
  return result || null;
};

/**
 * @param {ol.Feature} feature feature
 * @return {boolean} whereas is feature complex
 */
const isComplex = (feature) => {
  const fType = feature.get(TYPE_NAME);
  return fType === TYPE;
};

/**
 * @param {ol.Feature} complex complex
 * @return {number} count
 */
const getBuildingCount = (complex) => {
  const result = complex.get('pocetBudov');
  munimap_assert.assertNumber(result);
  return result;
};

/**
 * @param {LoadByIdsOptions} options opts
 * @return {Promise<Array<ol.Feature>>} promise
 */
const loadByIds = async (options) => {
  return munimap_load.features({
    source: STORE,
    type: TYPE,
    method: 'POST',
    returnGeometry: true,
    where: 'inetId IN (' + options.ids.join() + ')',
    processor: options.processor,
  });
};

export {
  RESOLUTION,
  ID_FIELD_NAME,
  UNITS_FIELD_NAME,
  isComplex,
  getBuildingCount,
  getById,
  loadByIds,
};
