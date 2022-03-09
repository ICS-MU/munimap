import {MUNIMAP_URL} from '../conf.js';
import {createResolution} from '../utils/range.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 */

/**
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = createResolution(1.19, 4.77);

/**
 * @type {string}
 */
const ID_FIELD_NAME = 'inetId';

/**
 * @type {string}
 */
const UNITS_FIELD_NAME = 'pracoviste';

/**
 *
 * @type {number}
 * @protected
 */
const FONT_SIZE = 13;

/**
 *
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} Type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: ID_FIELD_NAME,
      serviceUrl: MUNIMAP_URL,
      layerId: 4,
      name: 'complex',
    };
  }
  return TYPE;
};

export {FONT_SIZE, ID_FIELD_NAME, RESOLUTION, UNITS_FIELD_NAME, getType};
