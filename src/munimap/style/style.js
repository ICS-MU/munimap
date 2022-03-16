/**
 * @module style/style
 */

import * as mm_assert from '../assert/assert.js';
import * as mm_building from '../feature/building.js';
import * as mm_customMarker from '../feature/marker.custom.js';
import * as mm_store from '../utils/store.js';
import * as mm_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {IconPosition, PIN_SIZE, TEXT_FILL, TEXT_STROKE} from './_constants.js';
import {Style, Text} from 'ol/style';
import {extendTitleOffset} from './icon.js';
import {getDefaultLabel as getDefaultRoomLabel} from '../feature/room.js';
import {
  isBuilding,
  isCustomMarker,
  isRoom,
} from '../feature/_constants.functions.js';

/**
 * @typedef {import("./marker").LabelFunction} MarkerLabelFunction
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/").Map} ol.Map
 * @typedef {import("ol/style/Style").StyleFunction} ol.StyleFunction
 * @typedef {import("ol/style/Fill").default} ol.style.Fill
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 * @typedef {import("ol/geom/Geometry").default} ol.geom.Geometry
 * @typedef {import("../utils/geom.js").GeometryFunction} GeometryFunction
 * @typedef {import("../conf.js").State} State
 * @typedef {import("./icon.js").IconOptions} IconOptions
 */

/**
 *
 * @typedef {function(Feature, ?string, Array<string>): boolean} FilterFunction
 */

/**
 * @typedef {function(StyleFunctionOptions, ol.FeatureLike, number):
 *    (Style|Array<Style>)} StyleFunction
 */

/**
 * @typedef {Object} StyleFunctionOptions
 * @property {Array<Feature>}  [markers] markers
 * }}
 */

/**
 * @typedef {Object} LabelWithPinOptions
 * @property {ol.style.Fill}  fill fill
 * @property {number}  [fontSize] font size
 * @property {GeometryFunction|ol.geom.Geometry}  geometry geom
 * @property {string}  [title] title
 * @property {string}  [minorTitle] minor title
 * @property {number}  [zIndex] z-index
 * @property {IconOptions} [icon] icon
 */

/**
 * @type {Object<string, Style|Array<Style>>}
 * @const
 */
const LABEL_CACHE = {};

/**
 * @type {Style}
 * @const
 */
const PIN = new Style({
  geometry: CENTER_GEOMETRY_FUNCTION,
  text: new Text({
    text: '\uf041',
    font: 'normal ' + PIN_SIZE + 'px MunimapFont',
    fill: TEXT_FILL,
    offsetY: -PIN_SIZE / 2,
    stroke: TEXT_STROKE,
  }),
  zIndex: 6,
});

/**
 *
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} lang lang
 * @return {string|undefined} default label
 */
const getDefaultLabel = (feature, resolution, lang) => {
  mm_assert.assertInstanceof(feature, Feature);
  let title;
  const uid = mm_store.getUid(feature);
  mm_assert.assert(!!uid);
  if (isBuilding(feature)) {
    title = mm_building.getDefaultLabel(
      /** @type {Feature}*/ (feature),
      resolution,
      lang
    );
    mm_assert.assertString(title);
  } else if (isCustomMarker(feature)) {
    return mm_customMarker.getLabel(feature);
  } else if (isRoom(feature)) {
    title = getDefaultRoomLabel(feature, lang);
  }
  return title;
};

/**
 * @param {string} title title
 * @param {number} fontSize font size
 * @return {number} label height
 */
const getLabelHeight = (title, fontSize) => {
  const rowCount = title.split('\n').length;
  const lineHeight = 1.2 * fontSize;
  return rowCount * lineHeight;
};

/**
 * @param {LabelWithPinOptions} options opts
 * @return {Array<Style>} style
 */
const getTextStyleWithOffsetY = (options) => {
  const fontSize = options.fontSize;
  const icon = options.icon;
  let title = options.title;
  let minorTitle = options.minorTitle;
  let fill = options.fill;
  let minorFill = TEXT_FILL;
  let result;
  if (mm_utils.isDef(title) && mm_utils.isDef(fontSize)) {
    if (!!minorTitle && icon && icon.position === IconPosition.BELOW) {
      [title, minorTitle] = [minorTitle, title];
      [fill, minorFill] = [minorFill, fill];
    }
    mm_assert.assertString(title);
    mm_assert.assertNumber(fontSize);

    let offsetY = getLabelHeight(title, fontSize) / 2 + 2;
    if (icon) {
      offsetY = extendTitleOffset(icon, offsetY);
    }
    result = new Style({
      geometry: options.geometry,
      text: new Text({
        font: 'bold ' + fontSize + 'px arial',
        fill: fill,
        offsetY: offsetY,
        stroke: TEXT_STROKE,
        text: title,
        overflow: true,
      }),
      zIndex: options.zIndex || 4,
    });

    if (minorTitle) {
      let minorOffsetY =
        2 +
        getLabelHeight(title, fontSize) +
        getLabelHeight(minorTitle, fontSize) / 2;
      if (icon) {
        minorOffsetY = extendTitleOffset(icon, minorOffsetY);
      }

      result = [
        result,
        new Style({
          geometry: options.geometry,
          text: new Text({
            font: 'bold ' + fontSize + 'px arial',
            fill: minorFill,
            offsetY: minorOffsetY,
            stroke: TEXT_STROKE,
            text: minorTitle,
            overflow: true,
          }),
          zIndex: options.zIndex || 4,
        }),
      ];
    } else {
      result = [result];
    }
  }
  return result || null;
};

/**
 * @param {LabelWithPinOptions} options options
 * @return {Array<Style>} style
 */
const getLabelWithPin = (options) => {
  const fill = options.fill;
  const geometry = options.geometry;
  const zIndex = options.zIndex;

  let result = [];
  const pin = new Style({
    geometry: geometry,
    text: new Text({
      text: '\uf041',
      font: 'normal ' + PIN_SIZE + 'px MunimapFont',
      fill: fill,
      offsetY: -PIN_SIZE / 2,
      stroke: TEXT_STROKE,
    }),
    zIndex: zIndex || 5,
  });
  result.push(pin);

  if (mm_utils.isDefAndNotNull(options.title)) {
    const textStyle = getTextStyleWithOffsetY(options);
    result = result.concat(textStyle);
  }
  return result;
};

export {
  LABEL_CACHE,
  PIN,
  getLabelWithPin,
  getTextStyleWithOffsetY,
  getDefaultLabel,
  getLabelHeight,
};
