import {MUNIMAP_PUBTRAN_URL} from '../conf.js';
import {createResolution} from '../utils/range.js';

/**
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 */

/**
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = createResolution(0, 2.39);

/**
 * @type {RangeInterface}
 * @const
 */
const CLUSTER_RESOLUTION = createResolution(0.6, 2.39);

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
      primaryKey: 'OBJECTID',
      serviceUrl: MUNIMAP_PUBTRAN_URL,
      layerId: 0,
      name: 'publictransport',
    };
  }
  return TYPE;
};

export {CLUSTER_RESOLUTION, RESOLUTION, getType};
