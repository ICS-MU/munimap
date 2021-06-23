/**
 * @module utils/animation
 */

import * as ol_extent from 'ol/extent';

/**
 * @typedef {import("ol/extent").Extent} ol.Extent
 */

/**
 * @param {ol.Extent} ext1 extent
 * @param {ol.Extent} ext2 extent
 * @return {number} duration
 */
export const getAnimationDuration = (ext1, ext2) => {
  const area1 = ol_extent.getArea(ext1);
  const area2 = ol_extent.getArea(ext2);
  const enlArea = ol_extent.getEnlargedArea(ext1, ext2);
  const diagonal = Math.sqrt(enlArea);
  let ratio = diagonal / Math.sqrt(area1 + area2);

  if (ratio > 5) {
    ratio = diagonal < 10000 ? 2.5 : 5;
  }
  return ratio * 1000;
};
