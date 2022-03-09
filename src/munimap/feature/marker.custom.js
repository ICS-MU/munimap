/**
 * @module feature/markercustom
 */
import * as munimap_assert from '../assert/assert.js';
import * as ol_proj from 'ol/proj';
import {FEATURE_TYPE_PROPERTY_NAME} from './feature.constants.js';
import {LABEL_FIELD_NAME, TYPE} from './marker.custom.constants.js';
import {isString} from '../utils/utils.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/geom").Point} ol.geom.Point
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 */

/**
 * @param {ol.FeatureLike} feature feature
 * @return {boolean} isCustom
 */
const isCustom = (feature) => {
  const fType = feature.get(FEATURE_TYPE_PROPERTY_NAME);
  return fType === TYPE;
};

/**
 * @param {ol.FeatureLike} feature feature
 * @return {string|undefined} label
 */
const getLabel = (feature) => {
  const label = feature.get(LABEL_FIELD_NAME);
  munimap_assert.assert(label === undefined || isString(label));
  return /** @type {string|undefined}*/ (label);
};

/**
 * Decorate feature to become custom marker. Should be called only if
 * isSuitable returned true.
 * @param {ol.Feature} feature feature
 */
const decorate = (feature) => {
  feature.set(FEATURE_TYPE_PROPERTY_NAME, TYPE);
  const geom = feature.getGeometry();
  const transformFn = ol_proj.getTransform('EPSG:4326', 'EPSG:3857');
  geom.applyTransform(transformFn);
};

export {isCustom, getLabel, decorate};
