/**
 * @module utils/parameter
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_utils from './utils.js';

/**
 * @param {Array<string>} [requiredMarkers] required markers
 * @return {Array<string>} result
 */
const createMarkerStringsArray = (requiredMarkers) => {
  let markerStrings;
  if (requiredMarkers.length) {
    munimap_assert.assertArray(requiredMarkers);
    munimap_utils.removeArrayDuplicates(requiredMarkers);
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
      munimap_utils.isString(requiredZoomTo) ? [requiredZoomTo] : requiredZoomTo
    );
  } else {
    zoomToStrings = [];
  }
  return zoomToStrings;
};

export {createMarkerStringsArray, createZoomToStringsArray};
