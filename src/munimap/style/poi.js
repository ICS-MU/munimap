/**
 * @module style/poi
 */

import * as mm_assert from '../assert/assert.js';
import * as mm_range from '../utils/range.js';
import * as mm_style_constants from './constants.js';
import {FLOOR_RESOLUTION, PoiPurpose} from '../feature/constants.js';
import {getByCode as getBuildingByCode} from '../feature/building.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 * @typedef {import("ol/style/Style").default} ol.style.Style
 */

/**
 * @typedef {object} StyleFunctionOptions
 * @property {string} targetId targetId
 * @property {string} selectedFeature selected feature
 * @property {Array<string>} activeFloorCodes activeFloorCodes
 * @property {boolean} inFloorResolutionRange inFloorResolutionRange
 */

/**
 * Style function.
 *
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {ol.style.Style|Array<ol.style.Style>} style
 */
const activeStyleFunction = (feature, resolution) => {
  const resolutions = mm_style_constants.PoiResolutions;
  let result = /** @type {ol.style.Style|Array<ol.style.Style>} */ (
    mm_style_constants.POI_STYLE
  );
  const poiType = feature.get('typ');
  const showInfo = mm_range.contains(resolutions.INFORMATION, resolution);
  const showToilets = mm_range.contains(resolutions.TOILET, resolution);
  const showStairs = mm_range.contains(resolutions.STAIRS, resolution);
  switch (poiType) {
    case PoiPurpose.INFORMATION_POINT:
      result = showInfo ? mm_style_constants.INFORMATION : null;
      break;
    case PoiPurpose.ELEVATOR:
      result = showStairs ? mm_style_constants.ELEVATOR : null;
      break;
    case PoiPurpose.BUILDING_ENTRANCE:
      result = mm_style_constants.ENTRANCE;
      break;
    case PoiPurpose.BUILDING_COMPLEX_ENTRANCE:
      result = mm_style_constants.BUILDING_COMPLEX_ENTRANCE;
      break;
    case PoiPurpose.TOILET_IMMOBILE:
      result = showToilets ? mm_style_constants.TOILET_IM : null;
      break;
    case PoiPurpose.TOILET_MEN:
      result = showToilets ? mm_style_constants.TOILET_M : null;
      break;
    case PoiPurpose.TOILET_WOMEN:
      result = showToilets ? mm_style_constants.TOILET_W : null;
      break;
    case PoiPurpose.TOILET:
      result = showToilets ? mm_style_constants.TOILET : null;
      break;
    case PoiPurpose.CLASSROOM:
      result = null;
      break;
    default:
      result = null;
  }
  return result;
};

/**
 * Style function.
 *
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {ol.style.Style|Array<ol.style.Style>} style
 */
const defaultStyleFunction = (feature, resolution) => {
  const poiType = feature.get('typ');
  let result = null;
  switch (poiType) {
    case PoiPurpose.COMPLEX_ENTRANCE:
    case PoiPurpose.BUILDING_COMPLEX_ENTRANCE:
      result = mm_style_constants.COMPLEX_ENTRANCE;
      break;
    case PoiPurpose.BUILDING_ENTRANCE:
      result = mm_style_constants.ENTRANCE;
      break;
    default:
      result = null;
  }
  return result;
};

/**
 * Style function.
 *
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} selectedFeature selected feature
 * @param {string} targetId targetId
 * @return {ol.style.Style|Array<ol.style.Style>} style
 */
const outdoorStyleFunction = (
  feature,
  resolution,
  selectedFeature,
  targetId
) => {
  const resolutions = mm_style_constants.PoiResolutions;
  const poiType = feature.get('typ');
  let result = null;
  let showEntrance = false;
  switch (poiType) {
    case PoiPurpose.COMPLEX_ENTRANCE:
      result = mm_style_constants.COMPLEX_ENTRANCE;
      break;
    case PoiPurpose.BUILDING_COMPLEX_ENTRANCE:
      const floorCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
      const selectedFloor =
        selectedFeature && selectedFeature.length === 8
          ? selectedFeature
          : null;
      const selectedBuildingCode =
        selectedFeature && selectedFeature.length >= 5
          ? selectedFeature.substring(0, 5)
          : '';
      const building = getBuildingByCode(targetId, floorCode.substring(0, 5));
      if (building) {
        //some buildings not loaded when outdoorFunction is called;
        //building with active floor (where entrances should be added)
        //is already loaded

        const defaultFloorCode = /**@type {string}*/ (
          building.get('vychoziPodlazi')
        );
        showEntrance =
          !floorCode.startsWith(selectedBuildingCode) ||
          !mm_range.contains(FLOOR_RESOLUTION, resolution) ||
          (selectedFloor && selectedFloor === defaultFloorCode);
        result = showEntrance
          ? mm_style_constants.BUILDING_COMPLEX_ENTRANCE
          : null;
      }
      break;
    case PoiPurpose.BUILDING_ENTRANCE:
      showEntrance =
        !mm_range.contains(FLOOR_RESOLUTION, resolution) &&
        mm_range.contains(resolutions.BUILDING_ENTRANCE, resolution);
      result = showEntrance ? mm_style_constants.ENTRANCE : null;
      break;
    default:
      break;
  }
  return result;
};

/**
 * @param {StyleFunctionOptions} options options
 * @return {ol.style.StyleFunction} style function
 */
const getActiveStyleFunction = (options) => {
  const {selectedFeature, activeFloorCodes, targetId, inFloorResolutionRange} =
    options;

  const styleFce = (feature, res) => {
    const poiType = feature.get('typ');
    const entranceTypes = [
      PoiPurpose.BUILDING_ENTRANCE,
      PoiPurpose.BUILDING_COMPLEX_ENTRANCE,
    ];

    if (inFloorResolutionRange) {
      const locCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
      if (locCode && activeFloorCodes.includes(locCode)) {
        return activeStyleFunction(feature, res);
      }

      if (entranceTypes.includes(poiType)) {
        const defaultFloor = feature.get('vychoziPodlazi');
        mm_assert.assertNumber(defaultFloor);
        const locCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
        if (
          defaultFloor === 1 &&
          activeFloorCodes.every(
            (floor) => !locCode.startsWith(floor.substring(0, 5))
          )
        ) {
          return defaultStyleFunction(feature, res);
        }
      }
    }

    entranceTypes.push(PoiPurpose.COMPLEX_ENTRANCE);
    if (entranceTypes.includes(poiType)) {
      return outdoorStyleFunction(feature, res, selectedFeature, targetId);
    }
    return null;
  };
  return styleFce;
};

export {getActiveStyleFunction};
