/**
 * @module style/room
 */
import * as munimap_range from '../utils/range.js';
import * as munimap_style from './style.js';
import * as munimap_utils from '../utils/utils.js';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {Fill, Stroke, Style, Text} from 'ol/style';
import {LABEL_CACHE as STYLE_LABEL_CACHE} from './style.js';
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
 * @type {Object.<string, Style|Array.<Style>>}
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
 * @type {Array.<Style>}
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
 * @type {Array.<string>}
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

// /**
//  * @type {ol.style.Style}
//  * @protected
//  * @const
//  */
// munimap.room.style.STAIRCASE_BACKGROUND_ICON = new ol.style.Style({
//   geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
//   text: new ol.style.Text({
//     text: '\uf0c8',
//     font: 'normal ' + munimap.poi.style.ICON_HEIGHT + 'px MunimapFont',
//     fill: new ol.style.Fill({
//       color: '#666'
//     })
//   }),
//   zIndex: 5
// });

// /**
//  * @type {Array<ol.style.Style>}
//  * @protected
//  * @const
//  */
// munimap.room.style.STAIRCASE_ICON = [
//   munimap.room.style.STAIRCASE_BACKGROUND_ICON,
//   new ol.style.Style({
//     geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
//     text: new ol.style.Text({
//       text: '\ue806',
//       font: 'normal 16px MunimapFont',
//       fill: new ol.style.Fill({
//         color: 'white'
//       })
//     }),
//     zIndex: 5
//   })
// ];

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
        result = munimap_style.alignTextToRows(parts, ' ');
      }
      return result;
    });
    title = mainParts.join(' /\n');
  } else {
    if (title.indexOf(' ') >= 0) {
      const parts = title.split(' ');
      title = munimap_style.alignTextToRows(parts, ' ');
    }
  }
  return title;
};

// /**
//  * @param {number} offsetY offset
//  * @return {Array.<Style>} style
//  * @protected
//  */
// const getClassroomIcon = (offsetY) => {
//   const background = new Style({
//     geometry: CENTER_GEOMETRY_FUNCTION,
//     text: new Text({
//       text: '\uf0c8',
//       offsetY: offsetY,
//       font: 'normal ' + munimap.poi.style.ICON_HEIGHT + 'px MunimapFont',
//       fill: new Fill({
//         color: '#666',
//       }),
//     }),
//     zIndex: 5,
//   });
//   const style = [
//     background,
//     new Style({
//       geometry: CENTER_GEOMETRY_FUNCTION,
//       text: new Text({
//         text: '\uf19d',
//         offsetY: offsetY,
//         font: 'normal 15px MunimapFont',
//         fill: new Fill({
//           color: 'white',
//         })
//       }),
//       zIndex: 5,
//     }),
//   ];
//   return style;
// };

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
 * @return {Style|Array<Style>} style
 */
const defaultStyleFunction = (feature, resolution) => {
  const marked = getMarkerStore().getFeatures().indexOf(feature) >= 0;
  return getStyle(feature, marked);
};

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} lang language
 * @param {boolean} showLocationCodes whether to show location codes
 * @return {Style|Array.<Style>} style
 */
const labelFunction = (feature, resolution, lang, showLocationCodes) => {
  const result = [];
  const marked = getMarkerStore().getFeatures().indexOf(feature) >= 0;
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
        // const purposeTitle = /**@type {string}*/ (feature.get('ucel_nazev'));
        // if (munimap_utils.isDefAndNotNull(purposeGis) &&
        //   (purposeGis === munimap.poi.Purpose.ELEVATOR ||
        //     purposeGis === munimap.poi.Purpose.INFORMATION_POINT)) {
        //   offset = munimap.poi.style.ICON_HEIGHT - 6;
        // } else if (jpad.func.isDefAndNotNull(purposeTitle) &&
        //   (purposeTitle === 'WC' || purposeTitle === 'schodiště')) {
        //   offset = munimap.poi.style.ICON_HEIGHT - 6;
        // }
      } else {
        title = getDefaultLabel(feature, lang);
      }
      if (title) {
        // if (munimap_utils.isDefAndNotNull(purposeGis) &&
        //   purposeGis === munimap.poi.Purpose.CLASSROOM &&
        //   munimap.range.contains(munimap.poi.style.Resolution.STAIRS,
        //     resolution)) {
        //   const labelHeight = munimap.style.getLabelHeight(title, fontSize);
        //   const overallHeight =
        //     labelHeight + munimap.poi.style.ICON_HEIGHT + 2;
        //   const iconOffset =
        //     -(overallHeight - munimap.poi.style.ICON_HEIGHT) / 2;
        //   offset = (overallHeight - labelHeight) / 2;
        //   goog.array.extend(
        //     result, munimap.room.style.getClassroomIcon(iconOffset));
        // }

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
 * Style function of a style fragment (type munimap.style.Function).
 *
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Style|Array.<Style>} style
 */
const activeStyleFunction = (feature, resolution) => {
  const result = defaultStyleFunction(feature, resolution);
  // if (munimap_range.contains(
  //   munimap.poi.style.Resolution.STAIRS, resolution) &&
  //   result === munimap.room.style.staircase) {
  //   result = goog.array.concat(
  //     result, munimap.room.style.STAIRCASE_ICON);
  // }
  return result;
};

export {
  setCorridorStyle,
  activeStyleFunction,
  alignRoomTitleToRows,
  defaultStyleFunction,
  labelFunction,
};
