import {MUNIMAP_URL} from '../conf.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 */

/**
 * @type {RegExp}
 * @protected
 */
const CODE_REGEX = /^[A-Z]{3}[0-9]{2}$/gi;

/**
 * @type {RegExp}
 * @protected
 */
const LIKE_EXPR_REGEX = /^[A-Z_]{3}[0-9_]{2}$/gi;

/**
 * @type {string}
 */
const LOCATION_CODE_FIELD_NAME = 'polohKod';

/**
 * @type {string}
 * @protected
 */
const COMPLEX_FIELD_NAME = 'areal';

/**
 * @type {string}
 */
const COMPLEX_ID_FIELD_NAME = 'arealId';

/**
 * @type {string}
 */
const UNITS_FIELD_NAME = 'pracoviste';

/**
 * @param {string} maybeCode location code
 * @return {boolean} if it it location code or not
 */
const isCode = (maybeCode) => {
  return !!maybeCode.match(CODE_REGEX);
};

/**
 * @param {string} maybeLikeExpr maybeLikeExpr
 * @return {boolean} isLikeExpr
 */
const isLikeExpr = (maybeLikeExpr) => {
  return (
    !!maybeLikeExpr.match(LIKE_EXPR_REGEX) && maybeLikeExpr.indexOf('_') >= 0
  );
};

/**
 * @param {string} maybeCodeOrLikeExpr location code or like expression
 * @return {boolean} if it it location code or not
 */
export const isCodeOrLikeExpr = (maybeCodeOrLikeExpr) => {
  return isCode(maybeCodeOrLikeExpr) || isLikeExpr(maybeCodeOrLikeExpr);
};

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
      primaryKey: LOCATION_CODE_FIELD_NAME,
      serviceUrl: MUNIMAP_URL,
      layerId: 2,
      name: 'building',
    };
  }
  return TYPE;
};

export {
  COMPLEX_FIELD_NAME,
  COMPLEX_ID_FIELD_NAME,
  LOCATION_CODE_FIELD_NAME,
  UNITS_FIELD_NAME,
  getType,
  isCode,
  isLikeExpr,
};
