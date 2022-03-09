/**
 *
 */

/**
 * @typedef {Object} ResolutionColorObject
 * @property {number} resolution resolution
 * @property {string} color color
 * @property {number} opacity opacity
 */

/**
 * @type {Array<ResolutionColorObject>}
 * @const
 */
const RESOLUTION_COLOR = [
  {resolution: 0.59, color: '#fff', opacity: 1},
  {resolution: 0.48, color: '#fdfdfd', opacity: 0.8},
  {resolution: 0.38, color: '#fbfbfb', opacity: 0.4},
  {resolution: 0.32, color: '#efefef', opacity: 0.2},
  {resolution: 0.29, color: '#ededed', opacity: 0.2},
];

/**
 * @type {number}
 * @protected
 * @const
 */
const CHAR_HEIGHT_WIDTH_RATIO = 3 / 2;

/**
 * @param {Array<string>} parts parts
 * @param {string} separator separator
 * @return {string} text
 */
const alignTextToRows = (parts, separator) => {
  let maxLength = 0;
  let charCount = 0;
  parts.forEach((part) => {
    charCount += part.length;
    if (part.length > maxLength) {
      maxLength = part.length;
    }
  });
  let charsPerRow = Math.ceil(Math.sqrt(CHAR_HEIGHT_WIDTH_RATIO * charCount));
  if (maxLength > charsPerRow) {
    charsPerRow = maxLength;
  }
  let text;
  parts.forEach((part, i) => {
    if (i === 0) {
      text = part;
    } else {
      const charsInLastRow = text.substring(text.lastIndexOf('\n') + 1).length;
      if (
        (charsInLastRow < charsPerRow &&
          (part.length < 3 || charsInLastRow < charsPerRow / 2)) ||
        charsInLastRow + part.length <= charsPerRow
      ) {
        text += separator + part;
      } else {
        text += '\n' + part;
      }
    }
  });
  return text;
};

export {RESOLUTION_COLOR, alignTextToRows};
