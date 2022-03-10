import {Circle, Fill, Stroke, Style, Text} from 'ol/style';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.constants.js';
import {createResolution} from '../utils/range.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 */

/**
 * @enum {RangeInterface}
 * @const
 */
const Resolutions = {
  INFORMATION: FLOOR_RESOLUTION,
  STAIRS: createResolution(0, 0.15),
  TOILET: createResolution(0, 0.13),
  BUILDING_ENTRANCE: createResolution(0, 1.19),
};

/**
 * @type {number}
 */
const RADIUS = 7;

/**
 * @type {Fill}
 */
const FILL = new Fill({
  color: [255, 255, 255, 1],
});

/**
 * @type {Stroke}
 */
const STROKE = new Stroke({
  color: [0, 0, 0, 1],
  width: 1.2,
});

/**
 * @type {Style}
 * @const
 */
const STYLE = new Style({
  image: new Circle({
    radius: RADIUS,
    fill: FILL,
    stroke: STROKE,
  }),
});

/**
 * @type {number}
 * @const
 */
const ICON_HEIGHT = 24;

/**
 * @type {Style}
 * @const
 */
const BACKGROUND_SQUARE = new Style({
  text: new Text({
    text: '\uf0c8',
    font: `normal ${ICON_HEIGHT}px MunimapFont`,
    fill: new Fill({
      color: '#666',
    }),
  }),
});

/**
 * @type {Style}
 * @const
 */
const BACKGROUND_SQUARE_GREEN = new Style({
  text: new Text({
    text: '\uf0c8',
    font: `normal ${ICON_HEIGHT}px MunimapFont`,
    fill: new Fill({
      color: 'green',
    }),
  }),
});

/**
 * @type {Style}
 * @const
 */
const BACKGROUND_SQUARE_GREEN_BIG = new Style({
  text: new Text({
    text: '\uf0c8',
    font: 'normal 30px MunimapFont',
    fill: new Fill({
      color: 'green',
    }),
  }),
});

/**
 * @type {Array<Style>}
 */
const ELEVATOR = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf183\uf07d',
      font: 'normal 16px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 * @const
 */
const ENTRANCE = [
  BACKGROUND_SQUARE_GREEN,
  new Style({
    text: new Text({
      text: '\uf090',
      font: 'normal 16px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 * @const
 */
const COMPLEX_ENTRANCE = [
  BACKGROUND_SQUARE_GREEN_BIG,
  new Style({
    text: new Text({
      text: '\uf090',
      font: 'normal 20px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 * @const
 */
const BUILDING_COMPLEX_ENTRANCE = [
  BACKGROUND_SQUARE_GREEN_BIG,
  new Style({
    text: new Text({
      text: '\uf090',
      font: 'normal 20px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const INFORMATION = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf129',
      offsetY: 1,
      font: 'normal 18px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const TOILET = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf182\uf183',
      font: 'normal 14px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const TOILET_IM = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf193',
      font: 'bold 16px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const TOILET_M = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf183',
      font: 'normal 18px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const TOILET_W = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf182',
      font: 'normal 18px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

export {
  Resolutions,
  BUILDING_COMPLEX_ENTRANCE,
  COMPLEX_ENTRANCE,
  ELEVATOR,
  ENTRANCE,
  ICON_HEIGHT,
  INFORMATION,
  STYLE,
  TOILET,
  TOILET_IM,
  TOILET_M,
  TOILET_W,
};
