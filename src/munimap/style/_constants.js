/**
 * @module style/_constants
 *
 * It must be in separate file because of multiple imports in munimap and
 * circular dependency.
 */
import {Circle, Fill, Stroke, Style, Text} from 'ol/style';
import {createResolution} from '../utils/range.js';

/**
 * @typedef {Object} ResolutionColorObject
 * @property {number} resolution resolution
 * @property {string} color color
 * @property {number} opacity opacity
 */

/**
 * @type {Array<ResolutionColorObject>}
 * @const
 */
const RESOLUTION_COLOR = [
  {resolution: 0.59, color: '#fff', opacity: 1},
  {resolution: 0.48, color: '#fdfdfd', opacity: 0.8},
  {resolution: 0.38, color: '#fbfbfb', opacity: 0.4},
  {resolution: 0.32, color: '#efefef', opacity: 0.2},
  {resolution: 0.29, color: '#ededed', opacity: 0.2},
];

///////////////////////////////////////////////////
/////////////////// GENERAL ///////////////////////
///////////////////////////////////////////////////
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
 * @type {number}
 * @protected
 * @const
 */
const CHAR_HEIGHT_WIDTH_RATIO = 3 / 2;

/////////////////////////////////////////////////////
/////////////////////// BLDG ////////////////////////
/////////////////////////////////////////////////////
/**
 * @type {Fill}
 * @protected
 * @const
 */
const BUILDING_FILL = new Fill({
  color: '#ffffff',
});

/**
 * @type {Stroke}
 * @protected
 * @const
 */
const BUILDING_STROKE = new Stroke({
  color: '#0000dc',
  width: 1,
});

/**
 * @type {Style}
 * @protected
 * @const
 */
const BUILDING_STYLE = new Style({
  fill: BUILDING_FILL,
  stroke: BUILDING_STROKE,
});

/**
 * @type {Style}
 * @const
 */
const BUILDING_NO_GEOMETRY = new Style({
  fill: NO_GEOMETRY_FILL,
  stroke: BUILDING_STROKE,
});

/**
 * @type {number}
 */
const BUILDING_FONT_SIZE = 13;

/**
 * @type {number}
 */
const BUILDING_BIG_FONT_SIZE = 15;

///////////////////////////////////////////////////
////////////////////// ROOM ///////////////////////
///////////////////////////////////////////////////
/**
 * @type {import('../utils/range.js').RangeInterface}
 * @const
 */
const ROOM_BIG_LABEL_RESOLUTION = createResolution(0, 0.15);

/**
 * @type {number}
 */
const ROOM_SMALL_FONT_SIZE = 9;

/**
 * @type {number}
 */
const ROOM_FONT_SIZE = 11;

/**
 * @type {Fill}
 * @const
 */
const ROOM_FILL = new Fill({
  color: '#ffffff',
});

/**
 * @type {Style}
 * @const
 */
const ROOM_STROKE = new Style({
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
const ROOM_STYLE = [
  new Style({
    fill: ROOM_FILL,
    zIndex: 0,
  }),
  ROOM_STROKE,
];

//////////////////////////////////////////////////////
///////////////////////// CLUSTER ////////////////////
//////////////////////////////////////////////////////
/**
 * @type {number}
 * @protected
 * @const
 */
const CLUSTER_RADIUS = 12;

/**
 * @return {Style} style
 * @protected
 */
const MULTIPLE = new Style({
  image: new Circle({
    radius: CLUSTER_RADIUS,
    fill: TEXT_FILL,
    stroke: new Stroke({
      color: '#ffffff',
      width: 2,
    }),
  }),
});

///////////////////////////////////////////////////
////////////////////// DOOR ///////////////////////
///////////////////////////////////////////////////
/**
 * @type {Fill}
 * @const
 */
const DOOR_FILL = new Fill({
  color: '#999999',
});

/**
 * @type {Stroke}
 * @const
 */
const DOOR_STROKE = new Stroke({
  color: '#000000',
  width: 1,
});

/**
 * @type {Style}
 * @const
 */
const DOOR_STYLE = new Style({
  fill: DOOR_FILL,
  stroke: DOOR_STROKE,
});

///////////////////////////////////////////////////
////////////////// IDENTIFY ///////////////////////
///////////////////////////////////////////////////
/**
 * @type {Fill}
 * @const
 */
const IDENTIFY_FILL = new Fill({
  color: '#eba01e',
});

///////////////////////////////////////////////////
//////////////////// PUBTRAN //////////////////////
///////////////////////////////////////////////////
/**
 * @type {Style}
 * @const
 */
const PUBTRAN_BACKGROUND_SQUARE = new Style({
  text: new Text({
    text: '\uf0c8',
    font: 'normal 18px MunimapFont',
    fill: new Fill({
      color: '#666',
    }),
  }),
});

/**
 * @type {Array<Style>}
 * @protected
 * @const
 */
const PUBTRAN_STYLE = [
  PUBTRAN_BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf207',
      font: 'normal 10px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

///////////////////////////////////////////////
/////////////////// MARKER ////////////////////
///////////////////////////////////////////////
/**
 * @type {Fill}
 * @const
 */
const MARKER_FILL = new Fill({
  color: '#e51c23',
});

/**
 * @type {Fill}
 * @const
 */
const MARKER_TEXT_FILL = new Fill({
  color: '#e51c23',
});

/**
 * @type {Fill}
 * @const
 */
const MARKER_BUILDING_FILL = new Fill({
  color: '#ffffff',
});

/**
 * @type {Stroke}
 * @const
 */
const MARKER_BUILDING_STROKE = new Stroke({
  color: '#e51c23',
  width: 1,
});

/**
 * @type {Style}
 * @const
 */
const MARKER_BUILDING = new Style({
  fill: MARKER_BUILDING_FILL,
  stroke: MARKER_BUILDING_STROKE,
});

/**
 * @type {Style}
 * @const
 */
const MARKER_BUILDING_NO_GEOMETRY = new Style({
  fill: NO_GEOMETRY_FILL,
  stroke: MARKER_BUILDING_STROKE,
});

/**
 * @type {Fill}
 * @const
 */
const MARKER_ROOM_FILL = new Fill({
  color: '#fff',
});

/**
 * @type {Stroke}
 * @const
 */
const MARKER_ROOM_STROKE = new Stroke({
  color: '#e51c23',
  width: 1,
});

/**
 * @type {Style}
 * @const
 */
const MARKER_ROOM_STYLE = new Style({
  fill: MARKER_ROOM_FILL,
  stroke: MARKER_ROOM_STROKE,
  zIndex: 5,
});

/**
 * @type {Fill}
 * @const
 */
const MARKER_DOOR_FILL = new Fill({
  color: '#FFC0C0',
});

/**
 * @type {Stroke}
 * @const
 */
const MARKER_DOOR_STROKE = new Stroke({
  color: '#e51c23',
  width: 1,
});

/**
 * @type {Style}
 * @const
 */
const MARKER_DOOR_STYLE = new Style({
  fill: MARKER_DOOR_FILL,
  stroke: MARKER_DOOR_STROKE,
  zIndex: 5,
});

export {
  BUILDING_BIG_FONT_SIZE,
  BUILDING_FONT_SIZE,
  BUILDING_NO_GEOMETRY,
  BUILDING_STROKE,
  BUILDING_STYLE,
  CHAR_HEIGHT_WIDTH_RATIO,
  CLUSTER_RADIUS,
  DOOR_STYLE,
  IDENTIFY_FILL,
  MARKER_BUILDING,
  MARKER_BUILDING_NO_GEOMETRY,
  MARKER_BUILDING_STROKE,
  MARKER_DOOR_STYLE,
  MARKER_FILL,
  MARKER_ROOM_STYLE,
  MARKER_TEXT_FILL,
  MULTIPLE,
  NO_GEOMETRY_FILL,
  PIN_SIZE,
  PUBTRAN_STYLE,
  RESOLUTION_COLOR,
  ROOM_BIG_LABEL_RESOLUTION,
  ROOM_FONT_SIZE,
  ROOM_SMALL_FONT_SIZE,
  ROOM_STROKE,
  ROOM_STYLE,
  TEXT_FILL,
  TEXT_STROKE,
};
