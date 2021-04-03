import * as ol_extent from 'ol/extent';

/**
 * @typedef {import("ol").Feature} ol.Feature
 */

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
