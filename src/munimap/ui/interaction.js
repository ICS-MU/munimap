/**
 * @module ui/interaction
 */
import * as munimap_lang from '../lang/lang.js';

/**
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("../view/view.js").ErrorMessageOptions} ErrorMessageOptions
 */

/**
 * @typedef {Object} InvalidCodeOptions
 * @property {Array<string>} invalidCodes invalid codes
 * @property {string} lang language
 * @property {ol.Map} map map
 */

const getErrorMessageStyle = (errEl) => {
  const dpr = window.devicePixelRatio || 1;
  let size;
  let lineHeight;
  if (errEl.offsetWidth < 500) {
    size = 22 * dpr;
    lineHeight = 26 * dpr;
  } else {
    size = 30 * dpr;
    lineHeight = 35 * dpr;
  }
  return {size, lineHeight};
};

/**
 * @param {Array<string>} invalidCodes invalid codes
 * @param {boolean} simpleScroll simple scroll
 * @param {string} lang language
 * @return {string|undefined} message
 */
const createInnerText = (invalidCodes, simpleScroll, lang) => {
  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;
  let msg;
  if (hasInvalidCodes) {
    msg =
      munimap_lang.getMsg(munimap_lang.Translations.ACTIVATE_MAP, lang) +
      '\n' +
      munimap_lang.getMsg(munimap_lang.Translations.NOT_FOUND, lang) +
      ':\n' +
      invalidCodes.join(', ');
  } else if (shouldBlockMap) {
    msg = munimap_lang.getMsg(munimap_lang.Translations.ACTIVATE_MAP, lang);
  }
  return msg;
};

export {createInnerText, getErrorMessageStyle};
