/**
 * @module style/icon
 */
import {IconPosition} from './_constants.js';

/**
 * @typedef {Object} IconOptions
 * @property {string} url url
 * @property {Array<number>} size size
 * @property {IconPosition} [position] position
 */

/**
 * @param {IconOptions} icon icon
 * @return {Object<string, number>} offsets
 */
const calculateBubbleOffsets = (icon) => {
  const padding = 5;
  let offsetX = 0;
  let offsetY = icon.size[1] / 2 + padding;

  if (icon.position) {
    switch (icon.position) {
      case IconPosition.ORIGIN:
        offsetX = 0;
        offsetY = padding;
        break;
      case IconPosition.BELOW:
        offsetX = 0;
        offsetY = -icon.size[1] / 2 + padding;
        break;
      default:
        break;
    }
  }
  return {offsetX, offsetY};
};

/**
 * @param {IconOptions} icon icon
 * @param {number} offsetY offsetY
 * @return {number} offset
 */
const extendTitleOffset = (icon, offsetY) => {
  if (icon.position && icon.size) {
    switch (icon.position) {
      case IconPosition.ORIGIN:
        return offsetY + icon.size[1] / 2;
      case IconPosition.BELOW:
        return -offsetY;
      default:
        return offsetY;
    }
  }
  return offsetY;
};

/**
 * @param {IconOptions} icon icon
 * @return {Array<number>} anchor
 */
const calculateIconAnchor = (icon) => {
  let anchor = [0.5, 0.5];
  if (icon.position) {
    switch (icon.position) {
      case IconPosition.ABOVE:
        anchor = [0.5, 1.05];
        break;
      case IconPosition.BELOW:
        anchor = [0.5, 0];
        break;
      default:
        anchor = [0.5, 0.5];
        break;
    }
  }
  return anchor;
};

export {calculateBubbleOffsets, calculateIconAnchor, extendTitleOffset};
