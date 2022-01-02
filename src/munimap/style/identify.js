/**
 * @module style/identify
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import {
  BIG_FONT_SIZE as BLDG_BIG_FONT_SIZE,
  FONT_SIZE as BLDG_FONT_SIZE,
} from './building.js';
import {
  CENTER_GEOMETRY_FUNCTION,
  INTERSECT_CENTER_GEOMETRY_FUNCTION,
} from '../utils/geom.js';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.js';
import {Fill} from 'ol/style';
import {FONT_SIZE as ROOM_FONT_SIZE} from './room.js';
import {getDefaultLabel, getLabelWithPin} from './style.js';
import {getIdentifiedFeature, getLocationCode} from '../identify/identify.js';
import {getStore as getMarkerStore} from '../source/marker.js';
import {isBuilding} from '../feature/building.js';
import {isDoor} from '../feature/door.js';
import {isRoom} from '../feature/room.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/style").Style} ol.style.Style
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("./marker.js").LabelFunction} LabelFunction
 */

/**
 * @typedef {Object} StyleFunctionOptions
 * @property {string} lang language
 * @property {boolean} [locationCodes] whether to show only location codes
 * @property {LabelFunction} [markerLabel] marker label function
 * @property {ol.extent.Extent} [extent] extent
 */

/**
 * @type {Fill}
 * @const
 */
const IDENTIFY_FILL = new Fill({
  color: '#eba01e',
});

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {StyleFunctionOptions} options opts
 * @return {ol.style.Style|Array<ol.style.Style>} style
 */
const styleFunction = (feature, resolution, options) => {
  const {lang, markerLabel, locationCodes, extent} = options;
  const markers = getMarkerStore().getFeatures();

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
  } else if (
    _isBuilding &&
    munimap_range.contains(FLOOR_RESOLUTION, resolution)
  ) {
    fontSize = BLDG_BIG_FONT_SIZE;
  } else {
    fontSize = BLDG_FONT_SIZE;
  }

  let title;
  if (munimap_utils.isDef(markerLabel)) {
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
  munimap_assert.assertString(title);

  const opts = {
    fill: IDENTIFY_FILL,
    fontSize: fontSize,
    geometry: geometry,
    title: title,
    zIndex: 7,
  };

  return getLabelWithPin(opts);
};

export {styleFunction};
