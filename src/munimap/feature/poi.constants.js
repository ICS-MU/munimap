import {MUNIMAP_URL} from '../conf.js';
import {createResolution} from '../utils/range.js';

/**
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 */

/**
 * @enum {string}
 * @const
 */
const PURPOSE = {
  INFORMATION_POINT: 'informace',
  BUILDING_ENTRANCE: 'vstup do budovy',
  BUILDING_COMPLEX_ENTRANCE: 'vstup do areálu a budovy',
  COMPLEX_ENTRANCE: 'vstup do areálu',
  ELEVATOR: 'výtah',
  CLASSROOM: 'učebna',
  TOILET: 'WC',
  TOILET_IMMOBILE: 'WC invalidé',
  TOILET_MEN: 'WC muži',
  TOILET_WOMEN: 'WC ženy',
};

/**
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = createResolution(0, 1.195);

/**
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'OBJECTID',
      serviceUrl: MUNIMAP_URL,
      layerId: 0,
      name: 'poi',
    };
  }
  return TYPE;
};

export {PURPOSE, RESOLUTION, getType};
