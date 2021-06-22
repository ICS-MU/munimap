/**
 * @module markerStyle
 */

import * as munimap_asserts from './assert.js';
import * as munimap_building from './building.js';
import * as munimap_buildingStyle from './buildingStyle.js';
import * as munimap_cluster from './cluster.js';
import * as munimap_floor from './floor.js';
import * as munimap_markerCustom from './markerCustom.js';
import * as munimap_range from './range.js';
import * as munimap_style from './style.js';
import * as munimap_utils from './utils.js';
import Feature from 'ol/Feature';
import {
  CENTER_GEOMETRY_FUNCTION,
  INTERSECT_CENTER_GEOMETRY_FUNCTION,
} from './geom.js';
import {Fill, Stroke, Style, Text} from 'ol/style';

/**
 * @typedef {import("ol/render/Event").default} RenderEvent
 * @typedef {import("ol/geom/Geometry").default} ol.geom.Geometry
 * @typedef {import("ol/style/Style").GeometryFunction} ol.style.Style.GeometryFunction
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("./marker.js").LabelFunction} LabelFunction
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 */

/**
 * @typedef {Object} LabelFunctionOptions
 * @property {ol.Map} map
 * @property {string} lang
 * @property {ol.source.Vector} markerSource
 * @property {LabelFunction} [markerLabel]
 * }}
 */

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
 * @type {Object.<number, Style|Array.<Style>>}
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
 * @type {Style}
 * @const
 */
const NO_GEOMETRY_BUILDING = new Style({
  fill: munimap_style.NO_GEOMETRY_FILL,
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
 * @param {RenderEvent} event event
 */
const getPattern = (event) => {
  const context = event.context;
  const image = new Image();
  const imgsrc = './img/marker.style.coridors.bg.png';
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
 * @type {Text}
 * @const
 */
const PIN_TEXT = new Text({
  text: '\uf041',
  font: 'normal ' + munimap_style.PIN_SIZE + 'px MunimapFont',
  fill: TEXT_FILL,
  offsetY: -munimap_style.PIN_SIZE / 2,
  stroke: munimap_style.TEXT_STROKE,
  overflow: true,
});

/**
 * @param {ol.geom.Geometry|ol.style.Style.GeometryFunction} geometry geom
 * @return {Style} style
 */
const createPinFromGeometry = (geometry) => {
  return new Style({
    geometry: geometry,
    text: PIN_TEXT,
    zIndex: 6,
  });
};

/**
 * @type {Style}
 * @const
 */
const PIN = createPinFromGeometry(CENTER_GEOMETRY_FUNCTION);

/**
 * @param {LabelFunctionOptions} options opts
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Array.<Style>} style
 */
const labelFunction = (options, feature, resolution) => {
  let styleArray = [];
  const lang = options.lang;
  munimap_asserts.assertInstanceof(feature, Feature);
  const isBuilding = munimap_building.isBuilding(feature);
  // var isRoom = munimap.room.isRoom(feature);
  // var isDoor = munimap.door.isDoor(feature);
  const isCustomMarker = munimap_markerCustom.isCustom(feature);

  let title;
  if (munimap_utils.isDef(options.markerLabel)) {
    const titleParts = [];
    const name = options.markerLabel(feature, resolution);
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
  if (!munimap_utils.isDefAndNotNull(title) /*&& !isDoor*/) {
    /*var showLocationCodes = munimap.getProps(options.map).locationCodes;*/
    let showLocationCodes;
    title = showLocationCodes
      ? /**@type {string}*/ (feature.get('polohKod'))
      : munimap_style.getDefaultLabel(feature, resolution, lang);
  }
  const markers = options.markerSource.getFeatures();
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
    fill = munimap_style.TEXT_FILL;
  }

  let fontSize;
  // if (isRoom || isDoor) {
  //   fontSize = munimap.room.style.FONT_SIZE;
  // } else if (isBuilding &&
  if (
    isBuilding &&
    munimap_range.contains(munimap_floor.RESOLUTION, resolution)
  ) {
    fontSize = munimap_buildingStyle.BIG_FONT_SIZE;
  } else {
    fontSize = munimap_buildingStyle.FONT_SIZE;
  }

  const intersectFunction = munimap_utils.partial(
    INTERSECT_CENTER_GEOMETRY_FUNCTION,
    options.map
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
    const pin = isMarked ? PIN : munimap_style.PIN;
    styleArray.push(pin);
  }
  return styleArray;
};

/**
 * @param {LabelFunctionOptions} options opts
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Array.<Style>} style
 */
export const styleFunction = (options, feature, resolution) => {
  munimap_asserts.assertInstanceof(feature, Feature);
  // if (
  //   munimap_range.contains(munimap_floor.RESOLUTION, resolution) &&
  //   munimap_building.isBuilding(feature) &&
  //   munimap_building.isSelected(feature, options.map)
  // ) {
  //   return null;
  // }

  let result = [];
  const isBuilding = munimap_building.isBuilding(feature);
  // var isRoom = munimap.room.isRoom(feature);
  // var isDoor = munimap.door.isDoor(feature);

  // if (isRoom || isDoor) {
  //   var locCode = /**@type {string}*/ (feature.get('polohKod'));
  //   var inActiveFloor = munimap.floor.getActiveFloors(options.map).some(
  //     function(floorCode) {
  //       return locCode.startsWith(floorCode);
  //     }
  //   );
  //   var hasPointGeom = feature.getGeometry() instanceof ol.geom.Point;
  //   if (munimap.range.contains(munimap.floor.RESOLUTION, resolution) &&
  //     !inActiveFloor && !(hasPointGeom)) {
  //     return null;
  //   } else if (isRoom) {
  //     var markedRoomResolution = munimap.range.createResolution(
  //       munimap.floor.RESOLUTION.max,
  //       munimap.cluster.ROOM_RESOLUTION.min
  //     );
  //     if (munimap.range.contains(markedRoomResolution, resolution) ||
  //       hasPointGeom) {
  //       result.push(munimap.marker.style.ROOM);
  //     }
  //   } else if (munimap.range.contains(munimap.door.RESOLUTION, resolution)) {
  //     result.push(munimap.marker.style.DOOR);
  //   }
  // }
  if (
    /*!(isRoom || isDoor) ||*/ isBuilding ||
    !munimap_range.contains(munimap_cluster.ROOM_RESOLUTION, resolution)
  ) {
    const textStyle = labelFunction(options, feature, resolution);
    if (munimap_utils.isDefAndNotNull(textStyle)) {
      result.push(...textStyle);
    }
  }
  return result;
};

export {WHITE_TO_GREY_CACHE, NO_GEOMETRY_BUILDING, BUILDING_STROKE, getPattern};
