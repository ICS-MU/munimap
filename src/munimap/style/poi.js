/**
 * @module style/poi
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_poi_style_constants from './_constants.poi.js';
import * as munimap_range from '../utils/range.js';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.constants.js';
import {PURPOSE} from '../feature/poi.constants.js';
import {getByCode as getBuildingByCode} from '../feature/building.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 * @typedef {import("ol/style/Style").default} ol.style.Style
 */

/**
 * @typedef {Object} StyleFunctionOptions
 * @property {string} targetId targetId
 * @property {string} selectedFeature selected feature
 * @property {Array<string>} activeFloorCodes activeFloorCodes
 */

/**
 * Style function.
 *
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {ol.style.Style|Array<ol.style.Style>} style
 */
const activeStyleFunction = (feature, resolution) => {
  const resolutions = munimap_poi_style_constants.Resolutions;
  let result = /** @type {ol.style.Style|Array<ol.style.Style>} */ (
    munimap_poi_style_constants.STYLE
  );
  const poiType = feature.get('typ');
  const showInfo = munimap_range.contains(resolutions.INFORMATION, resolution);
  const showToilets = munimap_range.contains(resolutions.TOILET, resolution);
  const showStairs = munimap_range.contains(resolutions.STAIRS, resolution);
  switch (poiType) {
    case PURPOSE.INFORMATION_POINT:
      result = showInfo ? munimap_poi_style_constants.INFORMATION : null;
      break;
    case PURPOSE.ELEVATOR:
      result = showStairs ? munimap_poi_style_constants.ELEVATOR : null;
      break;
    case PURPOSE.BUILDING_ENTRANCE:
      result = munimap_poi_style_constants.ENTRANCE;
      break;
    case PURPOSE.BUILDING_COMPLEX_ENTRANCE:
      result = munimap_poi_style_constants.BUILDING_COMPLEX_ENTRANCE;
      break;
    case PURPOSE.TOILET_IMMOBILE:
      result = showToilets ? munimap_poi_style_constants.TOILET_IM : null;
      break;
    case PURPOSE.TOILET_MEN:
      result = showToilets ? munimap_poi_style_constants.TOILET_M : null;
      break;
    case PURPOSE.TOILET_WOMEN:
      result = showToilets ? munimap_poi_style_constants.TOILET_W : null;
      break;
    case PURPOSE.TOILET:
      result = showToilets ? munimap_poi_style_constants.TOILET : null;
      break;
    case PURPOSE.CLASSROOM:
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
    case PURPOSE.COMPLEX_ENTRANCE:
    case PURPOSE.BUILDING_COMPLEX_ENTRANCE:
      result = munimap_poi_style_constants.COMPLEX_ENTRANCE;
      break;
    case PURPOSE.BUILDING_ENTRANCE:
      result = munimap_poi_style_constants.ENTRANCE;
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
  const resolutions = munimap_poi_style_constants.Resolutions;
  const poiType = feature.get('typ');
  let result = null;
  let showEntrance = false;
  switch (poiType) {
    case PURPOSE.COMPLEX_ENTRANCE:
      result = munimap_poi_style_constants.COMPLEX_ENTRANCE;
      break;
    case PURPOSE.BUILDING_COMPLEX_ENTRANCE:
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
          !munimap_range.contains(FLOOR_RESOLUTION, resolution) ||
          (selectedFloor && selectedFloor === defaultFloorCode);
        result = showEntrance
          ? munimap_poi_style_constants.BUILDING_COMPLEX_ENTRANCE
          : null;
      }
      break;
    case PURPOSE.BUILDING_ENTRANCE:
      showEntrance =
        !munimap_range.contains(FLOOR_RESOLUTION, resolution) &&
        munimap_range.contains(resolutions.BUILDING_ENTRANCE, resolution);
      result = showEntrance ? munimap_poi_style_constants.ENTRANCE : null;
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
  const {selectedFeature, activeFloorCodes, targetId} = options;

  const styleFce = (feature, res) => {
    const locCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
    if (locCode && activeFloorCodes.includes(locCode)) {
      return activeStyleFunction(feature, res);
    }

    const poiType = feature.get('typ');
    const entranceTypes = [
      PURPOSE.BUILDING_ENTRANCE,
      PURPOSE.BUILDING_COMPLEX_ENTRANCE,
    ];
    if (entranceTypes.includes(poiType)) {
      const defaultFloor = feature.get('vychoziPodlazi');
      munimap_assert.assertNumber(defaultFloor);
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

    entranceTypes.push(PURPOSE.COMPLEX_ENTRANCE);
    if (entranceTypes.includes(poiType)) {
      return outdoorStyleFunction(feature, res, selectedFeature, targetId);
    }
    return null;
  };
  return styleFce;
};

export {getActiveStyleFunction};
