/**
 * @module feature/markercustom
 */
import * as munimap_assert from '../assert/assert.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import Point from 'ol/geom/Point';
import {FEATURE_TYPE_PROPERTY_NAME} from './feature.js';
import {isString} from '../utils/utils.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/geom").Point} ol.geom.Point
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 */

const TYPE = {
  name: 'custom-marker',
};

const LABEL_FIELD_NAME = 'label';

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
 * True if the feature is suitable to become custom marker.
 * @param {ol.FeatureLike} feature feature
 * @return {boolean} suitability
 */
const isSuitable = (feature) => {
  const geom = feature.getGeometry();
  let result = geom instanceof Point;
  if (result) {
    const proj = ol_proj.get('EPSG:4326');
    const projExtent = proj.getExtent();
    result = ol_extent.containsCoordinate(
      projExtent,
      /**@type {ol.geom.Point}*/ (geom).getCoordinates()
    );
  }
  return result;
};

/**
 * True if the feature is suitable to become custom marker.
 * @param {ol.Feature} feature feature
 * @return {boolean} assertion
 */
const assertSuitable = (feature) => {
  return munimap_assert.assert(
    isSuitable(feature),
    'Custom marker represented by ol.Feature must have ol.Point geometry ' +
      'with appropriate longitude (-180;180) and latitude (-90, 90).'
  );
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

export {isCustom, getLabel, isSuitable, assertSuitable, decorate};
