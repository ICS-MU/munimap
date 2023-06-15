/**
 * @module feature/markercustom
 */
import * as mm_assert from '../assert/assert.js';
import * as ol_proj from 'ol/proj.js';
import {
  CUSTOM_MARKER_LABEL_FIELD_NAME,
  CUSTOM_MARKER_TYPE,
  FEATURE_TYPE_PROPERTY_NAME,
} from './constants.js';
import {isString} from '../utils/utils.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/geom").Point} ol.geom.Point
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 */

/**
 * @param {ol.FeatureLike} feature feature
 * @return {string|undefined} label
 */
const getLabel = (feature) => {
  const label = feature.get(CUSTOM_MARKER_LABEL_FIELD_NAME);
  mm_assert.assert(label === undefined || isString(label));
  return /** @type {string|undefined}*/ (label);
};

/**
 * Decorate feature to become custom marker. Should be called only if
 * isSuitable returned true.
 * @param {ol.Feature} feature feature
 */
const decorate = (feature) => {
  feature.set(FEATURE_TYPE_PROPERTY_NAME, CUSTOM_MARKER_TYPE);
  const geom = feature.getGeometry();
  const transformFn = ol_proj.getTransform('EPSG:4326', 'EPSG:3857');
  geom.applyTransform(transformFn);
};

export {decorate, getLabel};
