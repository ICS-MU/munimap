import {Fill, Stroke, Style} from 'ol/style';

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

export {FILL, FONT_SIZE, SMALL_FONT_SIZE, STROKE, STYLE};
