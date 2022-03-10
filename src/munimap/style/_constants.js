/**
 *
 */
import {Fill, Stroke} from 'ol/style';

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
 * @type {Fill}
 * @const
 */
const TEXT_FILL = new Fill({
  color: '#0000dc',
});

/**
 * @type {Stroke}
 * @const
 */
const TEXT_STROKE = new Stroke({
  color: '#ffffff',
  width: 4,
});

/**
 * @type {Fill}
 * @const
 */
const NO_GEOMETRY_FILL = new Fill({
  color: '#dfdfdf',
});

/**
 * @type {number}
 * @const
 */
const PIN_SIZE = 25;

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

/**
 * @param {string} title title
 * @return {string} aligned title
 */
const alignRoomTitleToRows = (title) => {
  if (title.indexOf(' / ') >= 0) {
    let mainParts = title.split(' / ');
    mainParts = mainParts.map((part) => {
      let result = part;
      if (part.indexOf(' ') >= 0) {
        const parts = part.split(' ');
        result = alignTextToRows(parts, ' ');
      }
      return result;
    });
    title = mainParts.join(' /\n');
  } else {
    if (title.indexOf(' ') >= 0) {
      const parts = title.split(' ');
      title = alignTextToRows(parts, ' ');
    }
  }
  return title;
};

/**
 * @param {string|undefined} text text
 * @param {string} [opt_char] Character for newline (/n or </br>)
 * @return {string|undefined} wrapped text
 */
const wrapText = (text, opt_char) => {
  if (!text) {
    return text;
  }
  let char = opt_char;
  if (!char) {
    char = '\n';
  }
  const wrappedText = [];
  const words = text.split(' ');
  words.forEach((word, i) => {
    wrappedText.push(word);
    if ((i + 1) % 3 === 0) {
      wrappedText.push(char);
    }
  });
  return wrappedText.join(' ');
};

export {
  NO_GEOMETRY_FILL,
  PIN_SIZE,
  RESOLUTION_COLOR,
  TEXT_FILL,
  TEXT_STROKE,
  alignRoomTitleToRows,
  alignTextToRows,
  wrapText,
};
