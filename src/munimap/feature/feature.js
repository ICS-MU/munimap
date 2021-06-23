/**
 * @module feature
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
 * @property {ol.Feature} feature
 * @property {ol.layer.Vector} layer
 * @property {ol.Map} map
 * @property {ol.pixel.Pixel} pixel
 * @property {number} resolution
 */

/**
 * @typedef {Object} TypeOptions
 * @property {string} primaryKey
 * @property {string} serviceUrl
 * @property {ol.source.Vector} [store]
 * @property {number} layerId
 * @property {string} name
 */

/**
 * @type {string}
 * @const
 */
const FEATURE_TYPE_PROPERTY_NAME = 'featureType';

export {FEATURE_TYPE_PROPERTY_NAME};
