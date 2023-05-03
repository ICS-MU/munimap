/**
 * @module
 */

import * as actions from '../../redux/action.js';
import * as mm_assert from '../../assert/assert.js';
import * as mm_utils from '../../utils/utils.js';
import {BUILDING_TYPE} from '../../feature/constants.js';
import {complexLoadProcessor} from './complex.js';
import {featuresByCode, featuresForMap} from '../load.js';
import {getBuildingStore} from '../../source/constants.js';
import {unitLoadProcessor} from './unit.js';

/**
 * @typedef {import("../load.js").Processor} Processor
 * @typedef {import("../load.js").ProcessorOptions} ProcessorOptions
 * @typedef {import("../load.js").FeaturesForMapOptions} FeaturesForMapOptions
 * @typedef {import("../load.js").FeatureLoaderParams} FeatureLoaderParams
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("ol/featureloader").FeatureLoader} ol.featureloader
 */

/**
 * @typedef {object} BuildingsByCodeOptions
 * @property {Array<string>} codes codes
 * @property {Array<string>} likeExprs like expressions
 */

/**
 * @param {FeaturesForMapOptions} options options
 * @param {FeatureLoaderParams} featureLoaderParams feature loader params
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
const buildingFeaturesForMap = async (options, ...featureLoaderParams) => {
  const buildings = await featuresForMap(options, featureLoaderParams);

  if (options.callback) {
    options.callback(actions.buildings_loaded);
  }
  return buildings;
};

/**
 * @param {string} targetId targetId
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} opts
 */
const buildingLoadProcessor = async (targetId, options) => {
  const result = await Promise.all([
    complexLoadProcessor(targetId, options),
    unitLoadProcessor(targetId, options),
  ]);
  mm_assert.assertArray(result);
  result.forEach((opts) => {
    mm_assert.assert(opts === options);
    mm_assert.assert(mm_utils.arrayEquals(opts.all, options.all));
    mm_assert.assert(mm_utils.arrayEquals(opts.new, options.new));
    mm_assert.assert(mm_utils.arrayEquals(opts.existing, options.existing));
  });
  return result[0];
};

/**
 * @param {string} targetId targetId
 * @param {BuildingsByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const buildingsByCode = async (targetId, options) => {
  return await featuresByCode({
    codes: options.codes,
    type: BUILDING_TYPE,
    source: getBuildingStore(targetId),
    likeExprs: options.likeExprs,
    processor: mm_utils.partial(buildingLoadProcessor, targetId),
  });
};

export {buildingFeaturesForMap, buildingLoadProcessor, buildingsByCode};
