import * as ol_extent from 'ol/extent';

/**
 * @typedef {import("ol").Feature} ol.Feature
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
 * @param {Array<ol.Feature>} features features
 * @return {ol_extent.Extent} extent
 */
export const ofFeatures = (features) => {
  const extent = ol_extent.createEmpty();
  features.forEach((feature) => {
    const geom = feature.getGeometry();
    if (geom) {
      const ext = geom.getExtent();
      ol_extent.extend(extent, ext);
    }
  });
  return extent;
};
