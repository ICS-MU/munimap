/**
 * @module style/room
 */
import * as mm_range from '../utils/range.js';
import * as mm_utils from '../utils/utils.js';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {Fill, Style, Text} from 'ol/style.js';
import {
  MARKER_ROOM_STYLE,
  POI_ICON_HEIGHT,
  PoiResolutions,
  ROOM_BIG_LABEL_RESOLUTION,
  ROOM_CORRIDOR_IMG_PATH,
  ROOM_FONT_SIZE,
  ROOM_PURPOSES_TO_OMIT,
  ROOM_SMALL_FONT_SIZE,
  ROOM_STAIRCASE_ICON,
  ROOM_STROKE,
  ROOM_STYLE,
  TEXT_FILL,
  TEXT_STROKE,
} from './constants.js';
import {PoiPurpose} from '../feature/constants.js';
import {LABEL_CACHE as STYLE_LABEL_CACHE, getLabelHeight} from './style.js';
import {getDefaultLabel} from '../feature/room.js';
import {getCorridor as getMarkerCorridorStyle} from './marker.js';
import {getMarkerStore} from '../source/constants.js';
import {getUid} from '../utils/store.js';

/**
 * @typedef {import("ol/render/Event").default} RenderEvent
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 */

/**
 * @typedef {object} StyleFunctionOptions
 * @property {string} targetId targetId
 * @property {string} lang lang
 * @property {boolean} requiredLocationCodes requiredLocationCodes
 * @property {string} selectedFloorCode selectedFloorCode
 */

/**
 * @type {Array<Style>}
 */
let CORRIDOR = [];

/**
 * @type {Array<Style>}
 */
let STAIRCASE = [];

/**
 * @return {Array<Style>} style
 */
const getStaircase = () => STAIRCASE;

/**
 * @type {Object<string, Style|Array<Style>>}
 * @const
 */
const LABEL_CACHE = {};

/**
 * @param {RenderEvent} event event
 */
const setCorridorStyle = (event) => {
  if (CORRIDOR.length === 0) {
    const context = /** @type {CanvasRenderingContext2D} */ (event.context);
    const image = new Image();
    image.src = ROOM_CORRIDOR_IMG_PATH;
    image.onload = () => {
      const pattern = context.createPattern(image, 'repeat');
      const corridorFill = new Fill({
        color: pattern,
      });
      const corridorStyle = new Style({
        fill: corridorFill,
        zIndex: 1,
      });
      const corridorBackground = new Style({
        fill: new Fill({
          color: '#ffffff',
        }),
      });
      const staircaseBackground = new Style({
        fill: new Fill({
          color: 'rgba(153,169, 200, 0.4)',
        }),
        zIndex: 1,
      });
      CORRIDOR = [corridorBackground, corridorStyle, ROOM_STROKE];
      STAIRCASE = [staircaseBackground, corridorStyle, ROOM_STROKE];
    };
  }
};

/**
 * @param {number} offsetY offset
 * @return {Array<Style>} style
 * @protected
 */
const getClassroomIcon = (offsetY) => {
  const background = new Style({
    geometry: CENTER_GEOMETRY_FUNCTION,
    text: new Text({
      text: '\uf0c8',
      offsetY: offsetY,
      font: `normal ${POI_ICON_HEIGHT}px MunimapFont`,
      fill: new Fill({
        color: '#666',
      }),
    }),
    zIndex: 5,
  });
  const style = [
    background,
    new Style({
      geometry: CENTER_GEOMETRY_FUNCTION,
      text: new Text({
        text: '\uf19d',
        offsetY: offsetY,
        font: 'normal 15px MunimapFont',
        fill: new Fill({
          color: 'white',
        }),
      }),
      zIndex: 5,
    }),
  ];
  return style;
};

/**
 * @param {ol.Feature} feature feature
 * @param {boolean} marked whether is marked
 * @return {Style|Array<Style>} style
 */
const getStyle = (feature, marked) => {
  const purposeGroup = feature.get('ucel_skupina_nazev');
  const purpose = /** @type {string} */ (feature.get('ucel_nazev'));
  const purposeGis = feature.get('ucel_gis');
  let result = marked ? MARKER_ROOM_STYLE : ROOM_STYLE;

  switch (purposeGroup) {
    case 'komunikace obecně':
      if (ROOM_PURPOSES_TO_OMIT.indexOf(purpose) === -1) {
        if (purpose === 'schodiště') {
          result = marked ? MARKER_ROOM_STYLE : STAIRCASE;
        } else {
          result = marked ? getMarkerCorridorStyle() : CORRIDOR;
        }
      } else if (purposeGis === 'výtah') {
        result = marked ? getMarkerCorridorStyle() : CORRIDOR;
      }
      break;
    default:
      break;
  }
  return result;
};

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} targetId targetId
 * @return {Style|Array<Style>} style
 */
const defaultStyleFunction = (feature, resolution, targetId) => {
  const marked = getMarkerStore(targetId).getFeatures().indexOf(feature) >= 0;
  return getStyle(feature, marked);
};

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} targetId targetId
 * @param {string} lang language
 * @param {boolean} showLocationCodes whether to show location codes
 * @return {Style|Array<Style>} style
 */
const labelFunction = (
  feature,
  resolution,
  targetId,
  lang,
  showLocationCodes
) => {
  let result = [];
  const marked = getMarkerStore(targetId).getFeatures().indexOf(feature) >= 0;
  const labelCache = mm_range.contains(ROOM_BIG_LABEL_RESOLUTION, resolution)
    ? LABEL_CACHE
    : STYLE_LABEL_CACHE;

  if (!marked) {
    const uid = getUid(feature);
    if (uid) {
      if (labelCache[lang + uid]) {
        return labelCache[lang + uid];
      }
      let title;
      let offset;
      const purposeGis = /**@type {string}*/ (feature.get('ucel_gis'));
      const fontSize = mm_range.contains(ROOM_BIG_LABEL_RESOLUTION, resolution)
        ? ROOM_FONT_SIZE
        : ROOM_SMALL_FONT_SIZE;
      const textFont = 'bold ' + fontSize + 'px arial';

      if (showLocationCodes) {
        title = /**@type {string}*/ (feature.get('polohKod'));
        const purposeTitle = /**@type {string}*/ (feature.get('ucel_nazev'));
        if (
          mm_utils.isDefAndNotNull(purposeGis) &&
          (purposeGis === PoiPurpose.ELEVATOR ||
            purposeGis === PoiPurpose.INFORMATION_POINT)
        ) {
          offset = POI_ICON_HEIGHT - 6;
        } else if (
          mm_utils.isDefAndNotNull(purposeTitle) &&
          (purposeTitle === 'WC' || purposeTitle === 'schodiště')
        ) {
          offset = POI_ICON_HEIGHT - 6;
        }
      } else {
        title = getDefaultLabel(feature, lang);
      }
      if (title) {
        if (
          mm_utils.isDefAndNotNull(purposeGis) &&
          purposeGis === PoiPurpose.CLASSROOM &&
          mm_range.contains(PoiResolutions.STAIRS, resolution)
        ) {
          const labelHeight = getLabelHeight(title, fontSize);
          const overallHeight = labelHeight + POI_ICON_HEIGHT + 2;
          const iconOffset = -(overallHeight - POI_ICON_HEIGHT) / 2;
          offset = (overallHeight - labelHeight) / 2;
          const clasroomIcon = getClassroomIcon(iconOffset);
          result = [...result, ...clasroomIcon];
        }

        const textStyle = new Style({
          geometry: CENTER_GEOMETRY_FUNCTION,
          text: new Text({
            font: textFont,
            offsetY: offset,
            fill: TEXT_FILL,
            stroke: TEXT_STROKE,
            text: title,
          }),
          zIndex: 4,
        });
        result.push(textStyle);
      }
    }

    if (uid) {
      labelCache[lang + uid] = result;
    }
  }

  return result.length ? result : null;
};

/**
 * @param {StyleFunctionOptions} options options
 * @return {ol.style.StyleFunction} style function
 */
const getLabelFunction = (options) => {
  const {lang, requiredLocationCodes, selectedFloorCode, targetId} = options;
  const styleFce = (feature, res) => {
    const locCode = feature.get('polohKod');
    const isSelected =
      selectedFloorCode && locCode.startsWith(selectedFloorCode);
    if (isSelected) {
      return labelFunction(feature, res, targetId, lang, requiredLocationCodes);
    }
    return null;
  };
  return styleFce;
};

/**
 * @param {Array<string>} activeFloorCodes codes
 * @param {string} targetId targetId
 * @return {ol.style.StyleFunction} style function
 */
const getDefaultStyleFunction = (activeFloorCodes, targetId) => {
  const styleFce = (feature, res) => {
    const locCode = feature.get('polohKod');
    const isDefault = !activeFloorCodes.some((code) =>
      locCode.startsWith(code.substring(0, 5))
    );
    if (isDefault) {
      return defaultStyleFunction(feature, res, targetId);
    }
    return null;
  };
  return styleFce;
};

/**
 * @param {string} targetId targetId
 * @return {ol.style.StyleFunction} style function
 */
const getActiveStyleFunction = (targetId) => {
  const styleFce = (feature, res) => {
    let result = defaultStyleFunction(feature, res, targetId);
    if (
      mm_range.contains(PoiResolutions.STAIRS, res) &&
      result === getStaircase()
    ) {
      result = [...result, ...ROOM_STAIRCASE_ICON];
    }
    return result;
  };
  return styleFce;
};

export {
  setCorridorStyle,
  getActiveStyleFunction,
  getDefaultStyleFunction,
  getLabelFunction,
  getStaircase,
};
