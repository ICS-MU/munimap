/**
 * @module
 */

import {featuresForMap} from '../load.js';

/**
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../load.js").FeaturesForMapOptions} FeaturesForMapOptions
 * @typedef {import("../load.js").FeatureLoaderParams} FeatureLoaderParams
 */

/**
 * @param {FeaturesForMapOptions} options opts
 * @param {FeatureLoaderParams} featureLoaderParams feature loader params
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
const pubtranFeaturesForMap = async (options, ...featureLoaderParams) =>
  await featuresForMap(options, featureLoaderParams);

export {pubtranFeaturesForMap};
