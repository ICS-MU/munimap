/**
 * @module style/pubtranstop
 */

import * as munimap_pubtran_stop from '../feature/pubtran.stop.js';
import * as munimap_range from '../utils/range.js';
import {Fill, Style, Text} from 'ol/style';

/**
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @type {Style}
 * @const
 */
const BACKGROUND_SQUARE = new Style({
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
const STYLE = [
  BACKGROUND_SQUARE,
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

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 *
 * @return {Style|Array<Style>} style
 */
export const styleFunction = (feature, resolution) => {
  const inClusterRes = munimap_range.contains(
    munimap_pubtran_stop.CLUSTER_RESOLUTION,
    resolution
  );
  if (inClusterRes) {
    const oznacnik = feature.get('oznacnik');
    if (oznacnik === '01') {
      return STYLE;
    } else {
      return null;
    }
  } else {
    return STYLE;
  }
};
