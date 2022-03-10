/**
 * @module style/marker
 */

import * as munimap_asserts from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_cluster from '../cluster/cluster.js';
import * as munimap_markerCustom from '../feature/marker.custom.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_style from './style.js';
import * as munimap_style_building_constants from './building.constants.js';
import * as munimap_style_constants from './_constants.js';
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {
  CENTER_GEOMETRY_FUNCTION,
  INTERSECT_CENTER_GEOMETRY_FUNCTION,
} from '../utils/geom.js';
import {RESOLUTION as DOOR_RESOLUTION} from '../feature/door.constants.js';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.constants.js';
import {Fill, Stroke, Style, Text} from 'ol/style';
import {Point} from 'ol/geom';
import {FONT_SIZE as ROOM_FONT_SIZE} from '../style/room.constants.js';
import {isDoor as isDoorFeature} from '../feature/door.constants.js';
import {isRoom as isRoomFeature} from '../feature/room.constants.js';

/**
 * @typedef {import("ol/render/Event").default} RenderEvent
 * @typedef {import("ol/geom/Geometry").default} ol.geom.Geometry
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("ol/style/Style").GeometryFunction} ol.style.Style.GeometryFunction
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("../feature/marker.js").LabelFunction} LabelFunction
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 */

/**
 * @typedef {Object} LabelFunctionOptions
 * @property {ol.Map} map map
 * @property {string} lang lang
 * @property {ol.source.Vector} markerSource marker source
 * @property {LabelFunction} [markerLabel] marker label
 * @property {boolean} [locationCodes] whether to show location codes
 * }}
 */

/**
 * @typedef {Object} StyleFunctionOptions
 * @property {Array<Feature>} markers markers
 * @property {string} lang language
 * @property {ol.Extent} extent extent
 * @property {boolean} locationCodes whether to show only location codes
 * @property {LabelFunction} [markerLabel] marker label function
 * @property {Array<string>} activeFloorCodes active floor codes
 */

/**
 * @type {string}
 * @const
 */
const CORRIDOR_IMG_PATH = APP_PATH + 'img/marker.style.coridors.bg.png';

/**
 * @type {Fill}
 * @const
 */
const FILL = new Fill({
  color: '#e51c23',
});

/**
 * @type {Fill}
 * @const
 */
const TEXT_FILL = new Fill({
  color: '#e51c23',
});

/**
 * Styles corresponding different resolutions.
 * @type {Object<number, Style|Array<Style>>}
 * @const
 */
const WHITE_TO_GREY_CACHE = {};

/**
 * @type {Fill}
 * @const
 */
const BUILDING_FILL = new Fill({
  color: '#ffffff',
});

/**
 * @type {Stroke}
 * @const
 */
const BUILDING_STROKE = new Stroke({
  color: '#e51c23',
  width: 1,
});

/**
 * @type {Style}
 * @const
 */
const BUILDING = new Style({
  fill: BUILDING_FILL,
  stroke: BUILDING_STROKE,
});

/**
 * @type {Fill}
 * @const
 */
const ROOM_FILL = new Fill({
  color: '#fff',
});

/**
 * @type {Stroke}
 * @const
 */
const ROOM_STROKE = new Stroke({
  color: '#e51c23',
  width: 1,
});

/**
 * @type {Style}
 * @const
 */
const ROOM = new Style({
  fill: ROOM_FILL,
  stroke: ROOM_STROKE,
  zIndex: 5,
});

/**
 * @type {Fill}
 * @const
 */
const DOOR_FILL = new Fill({
  color: '#FFC0C0',
});

/**
 * @type {Stroke}
 * @const
 */
const DOOR_STROKE = new Stroke({
  color: '#e51c23',
  width: 1,
});

/**
 * @type {Style}
 * @const
 */
const DOOR = new Style({
  fill: DOOR_FILL,
  stroke: DOOR_STROKE,
  zIndex: 5,
});

/**
 * @type {Array<Style>}
 */
let CORRIDOR = [];

/**
 * @return {Array<Style>} corridor style
 */
const getCorridor = () => CORRIDOR;

/**
 * @return {Style} room style
 */
const getRoom = () => ROOM;

/**
 * @param {RenderEvent} event event
 */
const getPattern = (event) => {
  const context = event.context;
  const image = new Image();
  const imgsrc = CORRIDOR_IMG_PATH;
  image.src = imgsrc;
  image.onload = () => {
    const pattern = context.createPattern(image, 'repeat');
    const fill = new Fill({
      color: pattern,
    });
    const corridorStyle = new Style({
      fill: fill,
      zIndex: 99999,
    });
    const corridorBackground = new Style({
      fill: new Fill({
        color: '#ffffff',
      }),
      stroke: BUILDING_STROKE,
    });
    CORRIDOR = [corridorStyle, corridorBackground];
  };
};

/**
 * This must be a function because of asynchronous import of munimap_style.
 * @return {Text} pin text
 */
const getPinText = function () {
  return new Text({
    text: '\uf041',
    font: 'normal ' + munimap_style_constants.PIN_SIZE + 'px MunimapFont',
    fill: TEXT_FILL,
    offsetY: -munimap_style_constants.PIN_SIZE / 2,
    stroke: munimap_style_constants.TEXT_STROKE,
    overflow: true,
  });
};

/**
 * @param {ol.geom.Geometry|ol.style.Style.GeometryFunction} geometry geom
 * @return {Style} style
 */
const createPinFromGeometry = (geometry) => {
  return new Style({
    geometry: geometry,
    text: getPinText(),
    zIndex: 6,
  });
};

/**
 * This must be a function because of asynchronous import of munimap_style.
 * @return {Style} PIN
 */
const getPin = () => createPinFromGeometry(CENTER_GEOMETRY_FUNCTION);

/**
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @param {StyleFunctionOptions} options options
 * @return {Array<Style>} style
 */
const labelFunction = (feature, resolution, options) => {
  const {markers, markerLabel, lang, extent, locationCodes} = options;

  if (!extent) {
    return null;
  }

  let styleArray = [];
  munimap_asserts.assertInstanceof(feature, Feature);
  const isBuilding = munimap_building.isBuilding(feature);
  const isRoom = isRoomFeature(feature);
  const isDoor = isDoorFeature(feature);
  const isCustomMarker = munimap_markerCustom.isCustom(feature);

  let title;
  if (munimap_utils.isDefAndNotNull(markerLabel)) {
    const titleParts = [];
    const name = markerLabel(feature, resolution);
    if (munimap_utils.isDefAndNotNull(name)) {
      titleParts.push(name);
      if (isBuilding) {
        titleParts.push(
          munimap_building.getAddressPart(
            /** @type {Feature}*/ (feature),
            resolution,
            lang
          )
        );
      }
      title = titleParts.join('\n');
    }
  }
  if (!munimap_utils.isDefAndNotNull(title) && !isDoor) {
    const showLocationCodes = locationCodes;
    title = showLocationCodes
      ? /**@type {string}*/ (feature.get('polohKod'))
      : munimap_style.getDefaultLabel(feature, resolution, lang);
  }
  const isMarked = markers.includes(/** @type {Feature}*/ (feature));

  let fill;
  const color = /**@type {string}*/ (feature.get('color'));
  if (color) {
    fill = new Fill({
      color: color,
    });
  } else if (isMarked) {
    fill = TEXT_FILL;
  } else {
    fill = munimap_style_constants.TEXT_FILL;
  }

  let fontSize;
  if (isRoom || isDoor) {
    fontSize = ROOM_FONT_SIZE;
  } else if (
    isBuilding &&
    munimap_range.contains(FLOOR_RESOLUTION, resolution)
  ) {
    fontSize = munimap_style_building_constants.BIG_FONT_SIZE;
  } else {
    fontSize = munimap_style_building_constants.FONT_SIZE;
  }

  const intersectFunction = munimap_utils.partial(
    INTERSECT_CENTER_GEOMETRY_FUNCTION,
    extent
  );
  const geometry = isBuilding ? intersectFunction : CENTER_GEOMETRY_FUNCTION;

  const opts = {
    fill: fill,
    fontSize: fontSize,
    geometry: geometry,
    title: title,
    zIndex: 6,
  };
  if (isBuilding || isCustomMarker) {
    styleArray = munimap_style.getLabelWithPin(opts);
  } else {
    if (title) {
      const textStyle = munimap_style.getTextStyleWithOffsetY(opts);
      styleArray = styleArray.concat(textStyle);
    }
    const pin = isMarked ? getPin() : munimap_style.PIN;
    styleArray.push(pin);
  }
  return styleArray;
};

/**
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @param {StyleFunctionOptions} options options
 * @return {Array<Style>} style
 */
const styleFunction = (feature, resolution, options) => {
  munimap_asserts.assertInstanceof(feature, Feature);

  const result = [];
  const isBuilding = munimap_building.isBuilding(feature);

  if (
    isBuilding &&
    munimap_range.contains(FLOOR_RESOLUTION, resolution) &&
    munimap_building.hasInnerGeometry(feature)
  ) {
    return result;
  }
  const isRoom = isRoomFeature(feature);
  const isDoor = isDoorFeature(feature);

  if (isRoom || isDoor) {
    const locCode = /**@type {string}*/ (feature.get('polohKod'));
    const inActiveFloor = options.activeFloorCodes.some((floorCode) =>
      locCode.startsWith(floorCode)
    );
    const hasPointGeom = feature.getGeometry() instanceof Point;
    if (
      munimap_range.contains(FLOOR_RESOLUTION, resolution) &&
      !inActiveFloor &&
      !hasPointGeom
    ) {
      return null;
    } else if (isRoom) {
      const markedRoomResolution = munimap_range.createResolution(
        FLOOR_RESOLUTION.max,
        munimap_cluster.ROOM_RESOLUTION.min
      );
      if (
        munimap_range.contains(markedRoomResolution, resolution) ||
        hasPointGeom
      ) {
        result.push(ROOM);
      }
    } else if (munimap_range.contains(DOOR_RESOLUTION, resolution)) {
      result.push(DOOR);
    }
  }
  if (
    !(isRoom || isDoor) ||
    !munimap_range.contains(munimap_cluster.ROOM_RESOLUTION, resolution)
  ) {
    const textStyle = labelFunction(feature, resolution, options);
    if (munimap_utils.isDefAndNotNull(textStyle)) {
      result.push(...textStyle);
    }
  }
  return result;
};

/**
 * @param {boolean} inFloorResolutionRange inFloorResolutionRange
 * @param {string} selectedFeature selectedFeature
 * @param {StyleFunctionOptions} options options
 * @return {ol.style.StyleFunction} style fn
 */
const getStyleFunction = (inFloorResolutionRange, selectedFeature, options) => {
  const styleFce = (feature, res) => {
    if (
      inFloorResolutionRange &&
      munimap_building.isBuilding(feature) &&
      munimap_building.isSelected(feature, selectedFeature)
    ) {
      return null;
    }
    const style = styleFunction(feature, res, options);
    return style;
  };

  return styleFce;
};

export {
  BUILDING,
  BUILDING_STROKE,
  FILL,
  DOOR,
  TEXT_FILL,
  WHITE_TO_GREY_CACHE,
  createPinFromGeometry,
  getCorridor,
  getPattern,
  getRoom,
  getStyleFunction,
};
