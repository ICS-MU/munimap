/**
 * @module utils/extent
 */

import * as ol_extent from 'ol/extent';
import {Feature} from 'ol';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/extent").Extent} ol.Extent
 */

/**
 * @type {number}
 * @const
 * @protected
 */
const EXTENT_RATIO = 0.8;

/**
 * @param {ol.Extent} extent extent
 * @return {number} value
 */
export const getBufferValue = (extent) => {
  const width = ol_extent.getWidth(extent);
  const height = ol_extent.getHeight(extent);
  const shorterSide = width <= height ? width : height;
  return -((1 - EXTENT_RATIO) * shorterSide);
};

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {ol.Extent} extent
 */
export const ofFeature = (feature) => {
  if (feature instanceof Feature) {
    const geom = feature.getGeometry();
    if (geom) {
      return geom.getExtent();
    } else {
      return ol_extent.createEmpty();
    }
  } else {
    return feature.getExtent();
  }
};

/**
 * @param {Array<ol.Feature>} features features
 * @param {string} [opt_targetId] targetId
 * @param {function(ol.Feature, string): ol.Feature} [opt_checkFictiveFn] targetId
 * @return {ol_extent.Extent} extent
 */
export const ofFeatures = (features, opt_targetId, opt_checkFictiveFn) => {
  const extent = ol_extent.createEmpty();
  features.forEach((feature) => {
    const geom = feature.getGeometry();
    let ext;
    if (geom) {
      const bldg =
        opt_checkFictiveFn && opt_checkFictiveFn(feature, opt_targetId);
      ext = bldg ? bldg.getGeometry().getExtent() : geom.getExtent();
    }

    if (ext) {
      ol_extent.extend(extent, ext);
    }
  });
  return extent;
};
