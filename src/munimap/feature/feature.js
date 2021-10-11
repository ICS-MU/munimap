/**
 * @module feature/feature
 */

/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/pixel").Pixel} ol.pixel.Pixel
 */

/**
 * @typedef {Object} FeatureClickHandlerOptions
 * @property {ol.Feature} feature feature
 * @property {ol.layer.Vector} layer layer
 * @property {ol.Map} map map
 * @property {ol.pixel.Pixel} pixel pixel
 * @property {number} resolution resolution
 */

/**
 * @typedef {Object} TypeOptions
 * @property {string} primaryKey pk
 * @property {string} serviceUrl url
 * @property {ol.source.Vector} [store] store
 * @property {number} layerId layer id
 * @property {string} name name
 */

/**
 * @type {string}
 * @const
 */
const FEATURE_TYPE_PROPERTY_NAME = 'featureType';

export {FEATURE_TYPE_PROPERTY_NAME};
