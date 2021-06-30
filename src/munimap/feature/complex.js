/**
 * @module feature/complex
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from './building.js';
import * as munimap_load from '../load.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_unit from '../feature/unit.js';
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {FEATURE_TYPE_PROPERTY_NAME} from './feature.js';
import {MUNIMAP_URL} from '../conf.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import('./feature.js').TypeOptions} TypeOptions
 * @typedef {import("../load.js").Processor} Processor
 * @typedef {import("../load.js").ProcessorOptions} ProcessorOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
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
  const fType = feature.get(FEATURE_TYPE_PROPERTY_NAME);
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

/**
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} promise
 * @protected
 */
const loadProcessorWithUnits = async (options) => {
  const newComplexes = options.new;
  const complexIdsToLoad = newComplexes.map((complex) => {
    return complex.get(ID_FIELD_NAME);
  });

  if (complexIdsToLoad.length) {
    const units = await munimap_unit.loadByHeadquartersComplexIds(
      complexIdsToLoad
    );
    newComplexes.forEach((complex) => {
      const complexUnits = units.filter((unit) => {
        return unit.get('areal_sidelni_id') === complex.get(ID_FIELD_NAME);
      });
      complex.set(UNITS_FIELD_NAME, complexUnits);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} processor
 * @protected
 */
const loadProcessor = async (options) => {
  const newBuildings = options.new;
  let complexIdsToLoad = [];
  const buildingsToLoadComplex = [];
  newBuildings.forEach((building) => {
    const complexId = building.get(munimap_building.COMPLEX_ID_FIELD_NAME);
    if (munimap_utils.isNumber(complexId)) {
      munimap_assert.assertNumber(complexId);
      const complex = getById(complexId);
      if (complex) {
        building.set(munimap_building.COMPLEX_FIELD_NAME, complex);
      } else {
        complexIdsToLoad.push(complexId);
        buildingsToLoadComplex.push(building);
      }
    } else {
      building.set(munimap_building.COMPLEX_FIELD_NAME, null);
    }
  });

  complexIdsToLoad = [...new Set(complexIdsToLoad)];
  if (complexIdsToLoad.length) {
    const complexes = await loadByIds({
      ids: complexIdsToLoad,
      processor: loadProcessorWithUnits,
    });
    buildingsToLoadComplex.forEach((building) => {
      const complexId = building.get(munimap_building.COMPLEX_ID_FIELD_NAME);
      const complex = getById(complexId, complexes);
      if (!complex) {
        throw new Error('Complex ' + complexId + ' not found.');
      }
      building.set(munimap_building.COMPLEX_FIELD_NAME, complex || null);
    });
    return options;
  } else {
    return options;
  }
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
  STORE,
  isClickable,
  featureClickHandler,
  isComplex,
  getBuildingCount,
  getById,
  loadByIds,
  loadProcessorWithUnits,
  loadProcessor,
  getUnits,
};
