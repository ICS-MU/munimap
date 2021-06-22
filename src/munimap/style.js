/**
 * @module style
 */

import * as munimap_assert from './assert.js';
import * as munimap_building from './building.js';
import * as munimap_customMarker from './markerCustom.js';
import * as munimap_floor from './floor.js';
import * as munimap_layerPropName from './layer.js';
import * as munimap_marker from './marker.js';
import * as munimap_range from './range.js';
import * as munimap_store from './store.js';
import * as munimap_utils from './utils.js';
import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import {CENTER_GEOMETRY_FUNCTION} from './geom.js';
import {ORDER as FRAGMENT_ORDER} from './styleFragment.js';
import {Fill, Stroke, Style, Text} from 'ol/style';

/**
 * @typedef {import("./marker").LabelFunction} MarkerLabelFunction
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/").Map} ol.Map
 * @typedef {import("ol/style/Style").StyleFunction} ol.StyleFunction
 * @typedef {import("./styleFragment.js").FragmentLayerOptions} FragmentLayerOptions
 * @typedef {import("./styleFragment.js").FragmentOptions} FragmentOptions
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 * @typedef {import("ol/geom/Geometry").default} ol.geom.Geometry
 */

/**
 *
 * @typedef {function(Feature, ?string, Array.<string>): boolean} FilterFunction
 */

/**
 * @typedef {function(StyleFunctionOptions, ol.FeatureLike, number): (Style|Array.<Style>)} StyleFunction
 */

/**
 * @typedef {Object} StyleFunctionOptions
 * @property {ol.Map}  map //?
 * @property {Array<Feature>}  markers //?
 * }}
 */

/**
 * The same options are munimap.marker.style.labelFunction.Options
 * @typedef {Object} MarkersAwareOptions
 * @property {ol.source.Vector} markerSource
 * @property {MarkerLabelFunction}  [markerLabel]
 * @property {ol.Map}  [map]
 * }}
 */

/**
 * @typedef {Object} ResolutionColorObject
 * @property {number} resolution
 * @property {string} color
 * @property {number} opacity
 */

/**
 * @typedef {Object} LabelWithPinOptions
 * @property {Fill}  fill
 * @property {number}  [fontSize]
 * @property {function(Feature):ol.geom.Geometry|ol.geom.Geometry}  geometry
 * @property {string}  [title]
 * @property {string}  [minorTitle]
 * @property {number}  [zIndex]
 */

/**
 * @type {Object.<string, Style|Array.<Style>>}
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
 * @type {Array.<ResolutionColorObject>}
 * @const
 */
const RESOLUTION_COLOR = [
  {resolution: 0.59, color: '#fff', opacity: 1},
  {resolution: 0.48, color: '#fdfdfd', opacity: 0.8},
  {resolution: 0.38, color: '#fbfbfb', opacity: 0.4},
  {resolution: 0.32, color: '#efefef', opacity: 0.2},
  {resolution: 0.29, color: '#ededed', opacity: 0.2},
];

/**
 * @type {number}
 * @protected
 * @const
 */
const CHAR_HEIGHT_WIDTH_RATIO = 3 / 2;

/**
 * @param {Array.<string>} parts parts
 * @param {string} separator separator
 * @return {string} text
 */
const alignTextToRows = (parts, separator) => {
  let maxLength = 0;
  let charCount = 0;
  parts.forEach((part) => {
    charCount += part.length;
    if (part.length > maxLength) {
      maxLength = part.length;
    }
  });
  let charsPerRow = Math.ceil(Math.sqrt(CHAR_HEIGHT_WIDTH_RATIO * charCount));
  if (maxLength > charsPerRow) {
    charsPerRow = maxLength;
  }
  let text;
  parts.forEach((part, i) => {
    if (i === 0) {
      text = part;
    } else {
      const charsInLastRow = text.substr(text.lastIndexOf('\n') + 1).length;
      if (
        (charsInLastRow < charsPerRow &&
          (part.length < 3 || charsInLastRow < charsPerRow / 2)) ||
        charsInLastRow + part.length <= charsPerRow
      ) {
        text += separator + part;
      } else {
        text += '\n' + part;
      }
    }
  });
  return text;
};

/**
 * @param {ol.Map} map map
 * @param {FragmentLayerOptions} fragments fragments
 * @return {ol.StyleFunction} style function
 */
const createFromFragments = (map, fragments) => {
  const resolution = map.getView().getResolution();
  const showIndoor =
    munimap_utils.isDef(resolution) &&
    munimap_range.contains(
      munimap_floor.RESOLUTION,
      /**@type {number}*/ (resolution)
    );

  let selectedFloor;
  let activeFloors;
  if (showIndoor) {
    // const selectedFloorOpts = munimap.getProps(map).selectedFloor;
    // selectedFloor = selectedFloorOpts ? selectedFloorOpts.locationCode : null;
    // activeFloors = munimap_floor.getActiveFloors(map);
  } else {
    selectedFloor = null;
    activeFloors = [];
  }

  /**
   * @param {ol.FeatureLike} feature feature
   * @param {number} resolution resolution
   * @return {Style|Array.<Style>} style
   */
  const styleFce = function (feature, resolution) {
    munimap_assert.assertInstanceof(feature, Feature);

    /**
     * @param {FragmentOptions} fragment fragment
     * @return {boolean|undefined} result
     */
    const testFragment = (fragment) => {
      munimap_assert.assertInstanceof(feature, Feature);
      if (fragment) {
        return fragment.filter(
          /**@type {Feature}*/ (feature),
          selectedFloor,
          activeFloors
        );
      }
      return undefined;
    };

    let style;
    if (showIndoor) {
      FRAGMENT_ORDER.find((frag) => {
        const fragment = fragments[frag];
        if (testFragment(fragment)) {
          style = fragment.style;
          return true;
        }
        return false;
      });
    } else {
      const fragment = fragments['outdoorFeature'];
      if (testFragment(fragment)) {
        style = fragment.style;
      }
    }
    if (style && munimap_utils.isFunction(style)) {
      const opts = {
        map: map,
        markers: munimap_marker.getStore(map).getFeatures(),
      };
      return /** @type {StyleFunction}*/ (style)(opts, feature, resolution);
    }
    return /** @type {Style|Array<Style>}*/ (style);
  };

  return styleFce;
};

/**
 * @param {ol.Map} map map
 * @param {ol.layer.Base} layer layer
 */
const refreshFromFragments = (map, layer) => {
  const refreshStyle = layer.get(munimap_layerPropName.REFRESH_STYLE);
  if (munimap_utils.isDef(refreshStyle) && refreshStyle) {
    const fragments =
      /**@type {FragmentLayerOptions}*/
      (layer.get(munimap_layerPropName.STYLE_FRAGMENTS));
    const style = createFromFragments(map, fragments);
    munimap_assert.assertInstanceof(layer, VectorLayer);
    /**@type {VectorLayer} */ (layer).setStyle(style);
  }
};

/**
 * @param {ol.Map} map map
 */
const refreshAllFromFragments = (map) => {
  const layers = map.getLayers();
  layers.forEach((layer) => refreshFromFragments(map, layer));
};

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
  }
  // else if (munimap.room.isRoom(feature)) {
  //   title = munimap.room.getDefaultLabel(feature, lang);
  // }
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
 * @param {string=} char Character for newline (/n or </br>)
 * @return {string|undefined} wrapped text
 */
const wrapText = (text, char) => {
  if (!text) {
    return text;
  }
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
 * @return {Array.<Style>} style
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
 * @return {Array.<Style>} style
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
  RESOLUTION_COLOR,
  PIN,
  NO_GEOMETRY_FILL,
  PIN_SIZE,
  TEXT_STROKE,
  TEXT_FILL,
  LABEL_CACHE,
  getLabelWithPin,
  getTextStyleWithOffsetY,
  alignTextToRows,
  getDefaultLabel,
  refreshFromFragments,
};
