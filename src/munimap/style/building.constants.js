import {Fill, Stroke, Style} from 'ol/style';
import {NO_GEOMETRY_FILL as NO_GEOMETRY_FILL_STYLE} from './_constants.js';

/**
 * @type {Fill}
 * @protected
 * @const
 */
const FILL = new Fill({
  color: '#ffffff',
});

/**
 * @type {Stroke}
 * @protected
 * @const
 */
const STROKE = new Stroke({
  color: '#0000dc',
  width: 1,
});

/**
 * @type {Style}
 * @protected
 * @const
 */
const STYLE = new Style({
  fill: FILL,
  stroke: STROKE,
});

/**
 * @type {Style}
 * @const
 */
let NO_GEOMETRY;

/**
 * @return {Style} style
 */
const getNoGeometryStyle = () => {
  if (!NO_GEOMETRY) {
    NO_GEOMETRY = new Style({
      fill: NO_GEOMETRY_FILL_STYLE,
      stroke: STROKE,
    });
  }
  return NO_GEOMETRY;
};

/**
 * @type {number}
 */
const FONT_SIZE = 13;

/**
 * @type {number}
 */
const BIG_FONT_SIZE = 15;

export {BIG_FONT_SIZE, FILL, FONT_SIZE, STROKE, STYLE, getNoGeometryStyle};
