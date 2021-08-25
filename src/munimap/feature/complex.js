/**
 * @module feature/complex
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_range from '../utils/range.js';
import {FEATURE_TYPE_PROPERTY_NAME} from './feature.js';
import {MUNIMAP_URL} from '../conf.js';
import {getStore as getComplexStore} from '../source/complex.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import('./feature.js').TypeOptions} TypeOptions
 * @typedef {import("../load.js").Processor} Processor
 * @typedef {import("../load.js").ProcessorOptions} ProcessorOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
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
 *
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} Type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: ID_FIELD_NAME,
      serviceUrl: MUNIMAP_URL,
      layerId: 4,
      name: 'complex',
    };
  }
  return TYPE;
};

/**
 * @param {number} id id
 * @param {Array.<ol.Feature>=} opt_features optional features
 * @return {ol.Feature} building
 */
const getById = (id, opt_features) => {
  const features = opt_features || getComplexStore().getFeatures();
  const result = features.find((feature) => {
    const idProperty = getType().primaryKey;
    return feature.get(idProperty) === id;
  });
  return result || null;
};

/**
 * @param {ol.Feature} feature feature
 * @return {boolean} whereas is feature complex
 */
const isComplex = (feature) => {
  const fType = feature.get(FEATURE_TYPE_PROPERTY_NAME);
  return fType === getType();
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
 * @param {FeatureClickHandlerOptions} options opts
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const resolution = options.resolution;
  return munimap_range.contains(RESOLUTION, resolution);
};

/**
 * @param {FeatureClickHandlerOptions} options opts
 */
const featureClickHandler = (options) => {
  console.error('Not implemented yet!');
  // var feature = options.feature;
  // var map = options.map;

  // var complexId = /**@type {number}*/ (
  //   feature.get(munimap.complex.ID_FIELD_NAME)
  // );
  // var complexBldgs = munimap.building.STORE.getFeatures().filter(
  //   function(bldg) {
  //     var cId = bldg.get('arealId');
  //     if (jpad.func.isDefAndNotNull(cId)) {
  //       goog.asserts.assertNumber(cId);
  //       if (complexId === cId) {
  //         return true;
  //       }
  //     }
  //     return false;
  //   });
  // var extent = munimap.extent.ofFeatures(complexBldgs);
  // var view = map.getView();
  // var size = map.getSize() || null;
  // var futureRes;
  // if (complexBldgs.length === 1) {
  //   futureRes = munimap.floor.RESOLUTION.max / 2;
  // } else {
  //   futureRes = munimap.complex.RESOLUTION.min / 2;
  // }
  // var futureExtent = ol.extent.getForViewAndSize(
  //   ol.extent.getCenter(extent), futureRes, view.getRotation(), size);
  // var duration = munimap.move.getAnimationDuration(
  //   view.calculateExtent(size), extent);
  // view.fit(futureExtent, {
  //   duration: duration
  // });
};

/**
 * @param {ol.Feature} complex complex
 * @return {Array<ol.Feature>} units
 */
const getUnits = (complex) => {
  const result = complex.get(UNITS_FIELD_NAME);
  munimap_assert.assert(result === null || result instanceof Array);
  return result;
};

export {
  RESOLUTION,
  ID_FIELD_NAME,
  UNITS_FIELD_NAME,
  FONT_SIZE,
  TYPE,
  isClickable,
  featureClickHandler,
  isComplex,
  getBuildingCount,
  getById,
  getType,
  getUnits,
};
