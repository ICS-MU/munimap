/**
 * @module
 */

import {featuresForMap} from '../load.js';

/**
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../load.js").FeaturesForMapOptions} FeaturesForMapOptions
 */

/**
 * @param {FeaturesForMapOptions} options opts
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
const pubtranFeaturesForMap = async (options, extent, resolution, projection) =>
  await featuresForMap(options, extent, resolution, projection);

export {pubtranFeaturesForMap};
