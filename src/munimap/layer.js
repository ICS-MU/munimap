/**
 * @module layer
 */

/**
 * @typedef {import("ol/layer/BaseVector").Options} BaseLayerOptions
 */

/**
 * @typedef {Object} VectorLayerExtendedOptions
 * @property {string} id
 * @property {(options: feature.clickHandlerOptions) => boolean} isFeatureClickable
 * @property {(options: feature.clickHandlerOptions) => void} featureClickHandler
 * @property {boolean} redrawOnFloorChange
 *
 * @typedef {BaseLayerOptions & VectorLayerExtendedOptions} VectorLayerOptions
 */

/**
 * @type {string}
 * @const
 */
const CLICK_HANDLER = 'featureClickHandler';

/**
 * @type {string}
 * @const
 */
const IS_CLICKABLE = 'isFeatureClickable';

/**
 * @type {string}
 * @const
 */
const CLEAR_SOURCE = 'clearSourceOnFloorChange';

/**
 * @type {string}
 * @const
 */
const REDRAW = 'redrawOnFloorChange';

/**
 * @type {string}
 * @const
 */
const REFRESH_STYLE = 'refreshStyleOnFloorChange';

/**
 * @type {string}
 * @const
 */
const STYLE_FRAGMENTS = 'styleFragments';

/**
 * @type {string}
 * @const
 */
const TYPE = 'type';

export {
  CLICK_HANDLER,
  IS_CLICKABLE,
  CLEAR_SOURCE,
  REDRAW,
  REFRESH_STYLE,
  STYLE_FRAGMENTS,
  TYPE,
};
