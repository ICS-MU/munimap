/**
 * @module style
 */

/**
 * @typedef {Object} ResolutionColorObject
 * @property {number} resolution
 * @property {string} color
 * @property {number} opacity
 */

/**
 * @type {Array.<ResolutionColorObject>}
 * @const
 */
const RESOLUTION_COLOR = [
  {resolution: 0.59, color: '#fff', opacity: 1},
  {resolution: 0.48, color: '#fdfdfd', opacity: 0.8},
  {resolution: 0.38, color: '#fbfbfb', opacity: 0.4},
  {resolution: 0.32, color: '#efefef', opacity: 0.2},
  {resolution: 0.29, color: '#ededed', opacity: 0.2},
];

export {RESOLUTION_COLOR};
