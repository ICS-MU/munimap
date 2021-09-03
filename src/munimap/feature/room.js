/**
 * @module feature/room
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import {MUNIMAP_URL} from '../conf.js';
import {alignRoomTitleToRows} from '../style/room.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @enum {string}
 * @const
 */
const ROOM_TYPES = {
  DEFAULT: 'default',
  ACTIVE: 'active',
};

/**
 * @type {RegExp}
 * @protected
 */
const CODE_REGEX = /^[A-Z]{3}[0-9]{2}[NMPSZ]{1}[0-9]{5}[a-z]?$/gi;

/**
 * @type {RegExp}
 * @protected
 */
const LIKE_EXPR_REGEX = /^[A-Z_]{3}[0-9_]{2}[NMPSZ_]{1}[0-9_]{5}[a-z_]?$/gi;

/**
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'polohKod',
      serviceUrl: MUNIMAP_URL,
      layerId: 1,
      name: 'room',
    };
  }
  return TYPE;
};

/**
 * @param {string} maybeCode code
 * @return {boolean} whether is room code
 */
const isCode = (maybeCode) => !!maybeCode.match(CODE_REGEX);

/**
 * @param {ol.Feature} feature feature
 * @return {boolean} whether is room feature
 */
const isRoom = (feature) => {
  const code = feature.get('polohKod');
  return munimap_utils.isString(code) && isCode(/** @type {string}*/ (code));
};

/**
 * @param {string} code code
 */
const assertCode = (code) => {
  munimap_assert.assert(
    !!isCode(code),
    'Location code of room should consist of 3 letters and 2 digits, ' +
      "one of the letters 'N', 'M', 'P', 'S' or 'Z' " +
      'followed by 5 digits, and optionally 1 letter.'
  );
};

/**
 * @param {ol.Feature} feature feature
 */
const assertRoom = (feature) => {
  munimap_assert.assert(
    !!isRoom(feature),
    "Feature does not have value of room's primary key."
  );
};

/**
 * @param {string} maybeLikeExpr expression
 * @return {boolean} whether is room like expression
 */
const isLikeExpr = (maybeLikeExpr) => {
  return (
    !!maybeLikeExpr.match(LIKE_EXPR_REGEX) && maybeLikeExpr.indexOf('_') >= 0
  );
};

/**
 * @param {string} maybeCodeOrLikeExpr code or expression
 * @return {boolean} whether is room code or like expression
 */
const isCodeOrLikeExpr = (maybeCodeOrLikeExpr) => {
  return isCode(maybeCodeOrLikeExpr) || isLikeExpr(maybeCodeOrLikeExpr);
};

/**
 * @param {string} code code
 */
const assertCodeOrLikeExpr = (code) => {
  munimap_assert.assert(
    !!code.match(LIKE_EXPR_REGEX),
    'Location code of building should consist of 3 letters and 2 digits, ' +
      "one of the letters 'N', 'M', 'P', 'S' or 'Z' " +
      'followed by 5 digits, and optionally 1 letter. ' +
      'Any of these characters might be replaced with _ wildcard.');
};

// /**
//  * @param {munimap.feature.clickHandlerOptions} options
//  * @return {boolean}
//  */
// munimap.room.isClickable = function(options) {
//   var feature = options.feature;
//   var map = options.map;

//   return !munimap.room.isInSelectedFloor(feature, map);
// };

// /**
//  * @param {munimap.feature.clickHandlerOptions} options
//  */
// munimap.room.featureClickHandler = function(options) {
//   var feature = options.feature;
//   var map = options.map;

//   munimap.changeFloor(map, feature);
//   munimap.info.refreshVisibility(map);
// };

/**
 * @param {ol.Feature} feature feature
 * @param {string} lang language
 * @return {string|undefined} name part
 * @protected
 */
const getNamePart = (feature, lang) => {
  let title;
  const fTitle = feature.get(
    munimap_lang.getMsg(munimap_lang.Translations.ROOM_TITLE_FIELD_NAME, lang)
  );
  const fNumber = feature.get('cislo');
  if (fTitle || fNumber) {
    if (fTitle) {
      title = munimap_assert.assertString(fTitle);
      title = alignRoomTitleToRows(title);
      if (fNumber) {
        const re = new RegExp('(^| )' + fNumber.toLowerCase() + '( |$)', 'g');
        if (!re.test(fTitle.toLowerCase())) {
          title = fNumber + '\n' + title;
        }
      }
    } else {
      title = munimap_assert.assertString(fNumber);
    }
  }
  return title || undefined;
};

/**
 * @param {ol.Feature} feature feature
 * @param {string} lang language
 * @return {string|undefined} default label
 */
const getDefaultLabel = (feature, lang) => getNamePart(feature, lang);

export {ROOM_TYPES, getDefaultLabel, getType};
