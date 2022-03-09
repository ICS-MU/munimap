/**
 * @module style/style
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_customMarker from '../feature/marker.custom.js';
import * as munimap_store from '../utils/store.js';
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {Fill, Stroke, Style, Text} from 'ol/style';
import {
  getDefaultLabel as getDefaultRoomLabel,
  isRoom,
} from '../feature/room.js';

/**
 * @typedef {import("./marker").LabelFunction} MarkerLabelFunction
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/").Map} ol.Map
 * @typedef {import("ol/style/Style").StyleFunction} ol.StyleFunction
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 * @typedef {import("ol/geom/Geometry").default} ol.geom.Geometry
 * @typedef {import("../utils/geom.js").GeometryFunction} GeometryFunction
 * @typedef {import("../conf.js").State} State
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
 * @property {Fill}  fill fill
 * @property {number}  [fontSize] font size
 * @property {GeometryFunction|ol.geom.Geometry|string}  geometry geom
 * @property {string}  [title] title
 * @property {string}  [minorTitle] minor title
 * @property {number}  [zIndex] z-index
 */

/**
 * @type {Object<string, Style|Array<Style>>}
 * @const
 */
const LABEL_CACHE = {};

/**
 * @type {Fill}
 * @const
 */
const TEXT_FILL = new Fill({
  color: '#0000dc',
});

/**
 * @type {Stroke}
 * @const
 */
const TEXT_STROKE = new Stroke({
  color: '#ffffff',
  width: 4,
});

/**
 * @type {Fill}
 * @const
 */
const NO_GEOMETRY_FILL = new Fill({
  color: '#dfdfdf',
});

/**
 * @type {number}
 * @const
 */
const PIN_SIZE = 25;

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
  munimap_assert.assertInstanceof(feature, Feature);
  let title;
  const uid = munimap_store.getUid(feature);
  munimap_assert.assert(!!uid);
  if (munimap_building.isBuilding(feature)) {
    title = munimap_building.getDefaultLabel(
      /** @type {Feature}*/ (feature),
      resolution,
      lang
    );
    munimap_assert.assertString(title);
  } else if (munimap_customMarker.isCustom(feature)) {
    return munimap_customMarker.getLabel(feature);
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
 * @param {string|undefined} text text
 * @param {string} [opt_char] Character for newline (/n or </br>)
 * @return {string|undefined} wrapped text
 */
const wrapText = (text, opt_char) => {
  if (!text) {
    return text;
  }
  let char = opt_char;
  if (!char) {
    char = '\n';
  }
  const wrappedText = [];
  const words = text.split(' ');
  words.forEach((word, i) => {
    wrappedText.push(word);
    if ((i + 1) % 3 === 0) {
      wrappedText.push(char);
    }
  });
  return wrappedText.join(' ');
};

/**
 * @param {LabelWithPinOptions} options opts
 * @return {Array<Style>} style
 */
const getTextStyleWithOffsetY = (options) => {
  const fontSize = options.fontSize;
  const title = options.title;
  const minorTitle = options.minorTitle;
  let result;
  if (munimap_utils.isDef(title) && munimap_utils.isDef(fontSize)) {
    munimap_assert.assertString(title);
    munimap_assert.assertNumber(fontSize);
    result = new Style({
      geometry: options.geometry,
      text: new Text({
        font: 'bold ' + fontSize + 'px arial',
        fill: options.fill,
        offsetY: getLabelHeight(title, fontSize) / 2 + 2,
        stroke: TEXT_STROKE,
        text: title,
        overflow: true,
      }),
      zIndex: options.zIndex || 4,
    });

    if (minorTitle) {
      const minorOffsetY =
        2 +
        getLabelHeight(title, fontSize) +
        getLabelHeight(minorTitle, fontSize) / 2;

      result = [
        result,
        new Style({
          geometry: options.geometry,
          text: new Text({
            font: 'bold ' + fontSize + 'px arial',
            fill: TEXT_FILL,
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

  if (munimap_utils.isDefAndNotNull(options.title)) {
    const textStyle = getTextStyleWithOffsetY(options);
    result = result.concat(textStyle);
  }
  return result;
};

export {
  PIN,
  NO_GEOMETRY_FILL,
  PIN_SIZE,
  TEXT_STROKE,
  TEXT_FILL,
  LABEL_CACHE,
  getLabelWithPin,
  getTextStyleWithOffsetY,
  getDefaultLabel,
  getLabelHeight,
  wrapText,
};
