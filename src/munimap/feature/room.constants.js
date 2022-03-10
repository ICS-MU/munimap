/**
 *
 */
import * as munimap_utils from '../utils/utils.js';
import {MUNIMAP_URL} from '../conf.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
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
 * @param {string} maybeCode code
 * @return {boolean} whether is room code
 */
const isCode = (maybeCode) => !!maybeCode.match(CODE_REGEX);

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
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {boolean} whether is room feature
 */
const isRoom = (feature) => {
  const code = feature.get('polohKod');
  return munimap_utils.isString(code) && isCode(/** @type {string}*/ (code));
};

export {ROOM_TYPES, getType, isCode, isCodeOrLikeExpr, isLikeExpr, isRoom};
