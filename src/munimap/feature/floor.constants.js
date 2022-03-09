import {MUNIMAP_URL} from '../conf.js';
import {createResolution} from '../utils/range.js';

/**
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 */

/**
 * @type {RegExp}
 * @protected
 */
const CODE_REGEX = /^[A-Z]{3}[0-9]{2}[NPMZS][0-9]{2}$/gi;

/**
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = createResolution(0, 0.3);

/**
 * Floor types.
 * @enum {string}
 */
const FloorTypes = {
  UNDERGROUND: 'P',
  UNDERGROUND_MEZZANINE: 'Z',
  ABOVEGROUND: 'N',
  MEZZANINE: 'M',
};

/**
 * @param {string} maybeCode location code
 * @return {boolean} if it it location code or not
 */
const isCode = (maybeCode) => {
  return !!maybeCode.match(CODE_REGEX);
};

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
      primaryKey: 'polohKod',
      serviceUrl: MUNIMAP_URL,
      layerId: 5,
      name: 'floor',
    };
  }
  return TYPE;
};

export {RESOLUTION, FloorTypes, getType, isCode};
