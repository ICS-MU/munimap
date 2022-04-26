/**
 * @module style/pubtranstop
 */

import * as mm_range from '../utils/range.js';
import {PUBTRAN_CLUSTER_RESOLUTION} from '../feature/constants.js';
import {PUBTRAN_STYLE} from './constants.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/style").Style} ol.style.Style
 */

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 *
 * @return {ol.style.Style|Array<ol.style.Style>} style
 */
export const styleFunction = (feature, resolution) => {
  const inClusterRes = mm_range.contains(
    PUBTRAN_CLUSTER_RESOLUTION,
    resolution
  );
  if (inClusterRes) {
    const oznacnik = feature.get('oznacnik');
    if (oznacnik === '01') {
      return PUBTRAN_STYLE;
    } else {
      return null;
    }
  } else {
    return PUBTRAN_STYLE;
  }
};
