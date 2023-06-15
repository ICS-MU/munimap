/**
 * @module utils/parameter
 */

import * as mm_assert from '../assert/assert.js';
import * as mm_utils from './utils.js';

/**
 * @param {Array<string>} [requiredMarkers] required markers
 * @return {Array<string>} result
 */
const createMarkerStringsArray = (requiredMarkers) => {
  let markerStrings;
  if (requiredMarkers.length) {
    mm_assert.assertArray(requiredMarkers);
    mm_utils.removeArrayDuplicates(requiredMarkers);
    markerStrings = /** @type {Array<string>} */ (requiredMarkers);
  } else {
    markerStrings = /** @type {Array<string>} */ ([]);
  }
  return markerStrings;
};

/**
 * @param {Array<string>|string} [requiredZoomTo] required options
 * @return {Array<string>} result
 */
const createZoomToStringsArray = (requiredZoomTo) => {
  let zoomToStrings;
  if (requiredZoomTo.length) {
    zoomToStrings = /**@type {Array<string>}*/ (
      mm_utils.isString(requiredZoomTo) ? [requiredZoomTo] : requiredZoomTo
    );
  } else {
    zoomToStrings = [];
  }
  return zoomToStrings;
};

export {createMarkerStringsArray, createZoomToStringsArray};
