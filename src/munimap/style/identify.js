/**
 * @module style/identify
 */
import * as mm_assert from '../assert/assert.js';
import * as mm_range from '../utils/range.js';
import * as mm_utils from '../utils/utils.js';
import {
  BUILDING_BIG_FONT_SIZE,
  BUILDING_FONT_SIZE,
  IDENTIFY_FILL,
  ROOM_FONT_SIZE,
} from './constants.js';
import {
  CENTER_GEOMETRY_FUNCTION,
  INTERSECT_CENTER_GEOMETRY_FUNCTION,
} from '../utils/geom.js';
import {FLOOR_RESOLUTION} from '../feature/constants.js';
import {getDefaultLabel, getLabelWithPin} from './style.js';
import {getIdentifiedFeature, getLocationCode} from '../identify/identify.js';
import {getMarkerStore} from '../source/constants.js';
import {isBuilding, isDoor, isRoom} from '../feature/utils.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/style").Style} ol.style.Style
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("./marker.js").LabelFunction} LabelFunction
 */

/**
 * @typedef {Object} StyleFunctionOptions
 * @property {string} targetId targetId
 * @property {string} lang language
 * @property {boolean} [locationCodes] whether to show only location codes
 * @property {LabelFunction} [markerLabel] marker label function
 * @property {ol.extent.Extent} [extent] extent
 */

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {StyleFunctionOptions} options opts
 * @return {ol.style.Style|Array<ol.style.Style>} style
 */
const styleFunction = (feature, resolution, options) => {
  const {lang, markerLabel, locationCodes, extent, targetId} = options;
  const markers = getMarkerStore(targetId).getFeatures();

  const identifiedFeature = getIdentifiedFeature(feature);
  const locCode = getLocationCode(feature);

  const _isBuilding = isBuilding(identifiedFeature);
  const _isRoom = isRoom(identifiedFeature);
  const _isDoor = isDoor(identifiedFeature);
  const isMarked = markers.includes(identifiedFeature);

  const geometry = _isBuilding
    ? INTERSECT_CENTER_GEOMETRY_FUNCTION(extent, feature)
    : CENTER_GEOMETRY_FUNCTION(feature);

  let fontSize;
  if (_isRoom || _isDoor) {
    fontSize = ROOM_FONT_SIZE;
  } else if (_isBuilding && mm_range.contains(FLOOR_RESOLUTION, resolution)) {
    fontSize = BUILDING_BIG_FONT_SIZE;
  } else {
    fontSize = BUILDING_FONT_SIZE;
  }

  let title;
  if (mm_utils.isDef(markerLabel)) {
    title = markerLabel(identifiedFeature, resolution);
  }
  if (!title) {
    if (!!locationCodes && (_isRoom || isMarked)) {
      title = locCode;
    } else if (_isBuilding || _isRoom) {
      title = getDefaultLabel(identifiedFeature, resolution, lang);
    }
  }

  if (!title) {
    title = locCode || '';
  }
  mm_assert.assertString(title);

  const opts = {
    fill: IDENTIFY_FILL,
    fontSize: fontSize,
    geometry: geometry,
    title: title,
    zIndex: 7,
  };

  return getLabelWithPin(opts);
};

/**
 * @param {StyleFunctionOptions} options options
 * @return {ol.style.StyleFunction} style function
 */
const getStyleFunction = (options) => {
  const styleFce = (feature, res) => {
    const style = styleFunction(feature, res, options);
    return style;
  };

  return styleFce;
};

export {getStyleFunction};
