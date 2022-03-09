/**
 * @module style/room
 */
import * as munimap_range from '../utils/range.js';
import * as munimap_style from './style.js';
import * as munimap_utils from '../utils/utils.js';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {Fill, Stroke, Style, Text} from 'ol/style';
import {
  ICON_HEIGHT as POI_ICON_HEIGHT,
  Resolutions as PoiResolutions,
} from '../style/poi.js';
import {PURPOSE as POI_PURPOSE} from '../feature/poi.constants.js';
import {LABEL_CACHE as STYLE_LABEL_CACHE, getLabelHeight} from './style.js';
import {alignTextToRows} from './_constants.js';
import {getDefaultLabel} from '../feature/room.js';
import {
  getCorridor as getMarkerCorridorStyle,
  getRoom as getMarkerRoomStyle,
} from './marker.js';
import {getStore as getMarkerStore} from '../source/marker.js';
import {getUid} from '../utils/store.js';

/**
 * @typedef {import("ol/render/Event").default} RenderEvent
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 */

/**
 * @typedef {Object} StyleFunctionOptions
 * @property {string} targetId targetId
 * @property {string} lang lang
 * @property {boolean} requiredLocationCodes requiredLocationCodes
 * @property {string} selectedFloorCode selectedFloorCode
 */

/**
 * @type {import('../utils/range.js').RangeInterface}
 * @const
 */
const BIG_LABEL_RESOLUTION = munimap_range.createResolution(0, 0.15);

/**
 * @type {string}
 * @const
 */
const CORRIDOR_IMG_PATH = APP_PATH + 'img/room.style.coridors.bg.png';

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
 * @type {number}
 */
const SMALL_FONT_SIZE = 9;

/**
 * @type {number}
 */
const FONT_SIZE = 11;

/**
 * @type {Fill}
 * @const
 */
const FILL = new Fill({
  color: '#ffffff',
});

/**
 * @type {Style}
 * @const
 */
const STROKE = new Style({
  stroke: new Stroke({
    color: '#99a9c8',
    width: 1,
  }),
  zIndex: 4,
});

/**
 * @type {Array<Style>}
 * @const
 */
const STYLE = [
  new Style({
    fill: FILL,
    zIndex: 0,
  }),
  STROKE,
];

/**
 * @type {Array<string>}
 * @const
 */
const PURPOSES_TO_OMIT = [
  'angl.dvorek',
  'balkon',
  'manipulační prostory',
  'nevyužívané prostory', //also gateaway which are not used for drive in,
  //but can be used as corridor
  'plocha pod schodištěm',
  'předsíň', //also some corridors
  'příjem', //receptions
  'rampa', //somewhere is maybe an entrance
  'světlík',
  'šachta',
  'vrátnice',
  'výtah', //shown due to ucel_gis
];

/**
 * @type {Style}
 */
const STAIRCASE_BACKGROUND_ICON = new Style({
  geometry: CENTER_GEOMETRY_FUNCTION,
  text: new Text({
    text: '\uf0c8',
    font: `normal ${POI_ICON_HEIGHT}px MunimapFont`,
    fill: new Fill({
      color: '#666',
    }),
  }),
  zIndex: 5,
});

/**
 * @type {Array<Style>}
 */
const STAIRCASE_ICON = [
  STAIRCASE_BACKGROUND_ICON,
  new Style({
    geometry: CENTER_GEOMETRY_FUNCTION,
    text: new Text({
      text: '\ue806',
      font: 'normal 16px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
    zIndex: 5,
  }),
];

/**
 * @param {RenderEvent} event event
 */
const setCorridorStyle = (event) => {
  if (CORRIDOR.length === 0) {
    const context = event.context;
    const image = new Image();
    image.src = CORRIDOR_IMG_PATH;
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
      CORRIDOR = [corridorBackground, corridorStyle, STROKE];
      STAIRCASE = [staircaseBackground, corridorStyle, STROKE];
    };
  }
};

/**
 * @param {string} title title
 * @return {string} aligned title
 */
const alignRoomTitleToRows = (title) => {
  if (title.indexOf(' / ') >= 0) {
    let mainParts = title.split(' / ');
    mainParts = mainParts.map((part) => {
      let result = part;
      if (part.indexOf(' ') >= 0) {
        const parts = part.split(' ');
        result = alignTextToRows(parts, ' ');
      }
      return result;
    });
    title = mainParts.join(' /\n');
  } else {
    if (title.indexOf(' ') >= 0) {
      const parts = title.split(' ');
      title = alignTextToRows(parts, ' ');
    }
  }
  return title;
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
  let result = marked ? getMarkerRoomStyle() : STYLE;

  switch (purposeGroup) {
    case 'komunikace obecně':
      if (PURPOSES_TO_OMIT.indexOf(purpose) === -1) {
        if (purpose === 'schodiště') {
          result = marked ? getMarkerRoomStyle() : STAIRCASE;
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
  const labelCache = munimap_range.contains(BIG_LABEL_RESOLUTION, resolution)
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
      const fontSize = munimap_range.contains(BIG_LABEL_RESOLUTION, resolution)
        ? FONT_SIZE
        : SMALL_FONT_SIZE;
      const textFont = 'bold ' + fontSize + 'px arial';

      if (showLocationCodes) {
        title = /**@type {string}*/ (feature.get('polohKod'));
        const purposeTitle = /**@type {string}*/ (feature.get('ucel_nazev'));
        if (
          munimap_utils.isDefAndNotNull(purposeGis) &&
          (purposeGis === POI_PURPOSE.ELEVATOR ||
            purposeGis === POI_PURPOSE.INFORMATION_POINT)
        ) {
          offset = POI_ICON_HEIGHT - 6;
        } else if (
          munimap_utils.isDefAndNotNull(purposeTitle) &&
          (purposeTitle === 'WC' || purposeTitle === 'schodiště')
        ) {
          offset = POI_ICON_HEIGHT - 6;
        }
      } else {
        title = getDefaultLabel(feature, lang);
      }
      if (title) {
        if (
          munimap_utils.isDefAndNotNull(purposeGis) &&
          purposeGis === POI_PURPOSE.CLASSROOM &&
          munimap_range.contains(PoiResolutions.STAIRS, resolution)
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
            fill: munimap_style.TEXT_FILL,
            stroke: munimap_style.TEXT_STROKE,
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
      munimap_range.contains(PoiResolutions.STAIRS, res) &&
      result === getStaircase()
    ) {
      result = [...result, ...STAIRCASE_ICON];
    }
    return result;
  };
  return styleFce;
};

export {
  FONT_SIZE,
  STAIRCASE_ICON,
  setCorridorStyle,
  alignRoomTitleToRows,
  getActiveStyleFunction,
  getDefaultStyleFunction,
  getLabelFunction,
  getStaircase,
};
