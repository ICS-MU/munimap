import {MUNIMAP_URL} from '../conf.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 */

/**
 * @type {string}
 * @protected
 */
export const PRIORITY_FIELD_NAME = 'priorita';

/**
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} Type
 */
export const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'OBJECTID',
      serviceUrl: MUNIMAP_URL,
      layerId: 6,
      name: 'unit',
    };
  }
  return TYPE;
};
