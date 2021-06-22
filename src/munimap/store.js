/**
 * @module store
 */

import * as munimap_assert from './assert.js';
import {NAME as TYPE_NAME} from './type.js';

/**
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("./type.js").Options} TypeOptions
 */

/**
 * @param {ol.FeatureLike} feature feature
 * @return {?string} uid
 */
export const getUid = (feature) => {
  let uid = null;
  const code = feature.get('polohKod');
  if (code) {
    uid = munimap_assert.assertString(code);
  } else {
    const type = /**@type {TypeOptions}*/ (feature.get(TYPE_NAME));
    if (type) {
      const pk = feature.get(type.primaryKey);
      uid = type.name + ':' + pk;
    }
  }
  return uid;
};

/**
 *
 * @param {ol.source.Vector} store store
 * @param {Array.<ol.Feature>} features features
 * @return {Array.<ol.Feature>} not yet added features
 */
export const getNotYetAddedFeatures = (store, features) => {
  const storedFeatures = store.getFeatures();
  return features.filter((feature) => storedFeatures.indexOf(feature) === -1);
};
