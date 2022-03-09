import {MUNIMAP_URL} from '../conf.js';
import {createResolution} from '../utils/range.js';

/**
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 */

/**
 * @type {RegExp}
 */
const CODE_REGEX = /^[A-Z]{3}[0-9]{2}[NMPSZ]{1}[0-9]{2}[D]{1}[0-9]{3}?$/gi;

/**
 * @type {RegExp}
 */
const LIKE_EXPR_REGEX =
  /^[A-Z_]{3}[0-9_]{2}[NMPSZ_]{1}[0-9_]{2}[D_]{1}[0-9_]{3}?$/gi;

/**
 * @type {RangeInterface}
 */
const RESOLUTION = createResolution(0, 0.13);

/**
 * @param {string} maybeCode code
 * @return {boolean} whether is door code
 */
const isCode = (maybeCode) => {
  return !!maybeCode.match(CODE_REGEX);
};

/**
 * @param {string} maybeLikeExpr expression
 * @return {boolean} whether is door like expression
 */
const isLikeExpr = (maybeLikeExpr) => {
  return (
    !!maybeLikeExpr.match(LIKE_EXPR_REGEX) && maybeLikeExpr.indexOf('_') >= 0
  );
};

/**
 * @param {string} maybeCodeOrLikeExpr code or expression
 * @return {boolean} whether is door code or door like expression
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
      primaryKey: 'pk',
      serviceUrl: MUNIMAP_URL,
      layerId: 3,
      name: 'door',
    };
  }
  return TYPE;
};

export {
  CODE_REGEX,
  LIKE_EXPR_REGEX,
  RESOLUTION,
  getType,
  isCode,
  isCodeOrLikeExpr,
  isLikeExpr,
};
