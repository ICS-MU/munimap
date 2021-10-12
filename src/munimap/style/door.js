/**
 * @module style/door
 */

import {Fill, Stroke, Style} from 'ol/style';

/**
 * @type {Fill}
 * @const
 */
const FILL = new Fill({
  color: '#999999',
});

/**
 * @type {Stroke}
 * @const
 */
const STROKE = new Stroke({
  color: '#000000',
  width: 1,
});

/**
 * @type {Style}
 * @const
 */
const STYLE = new Style({
  fill: FILL,
  stroke: STROKE,
});

export {STYLE};
