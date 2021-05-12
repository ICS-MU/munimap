import {MUNIMAP_URL} from './conf.js';
import {Vector as ol_source_Vector} from 'ol/source';

/**
 * @typedef {import("./type.js").Options} TypeOptions
 * @typedef {import("ol/source").Vector} ol.source.Vector
 */

/**
 * @type {string}
 */
const LOCATION_CODE_FIELD_NAME = 'polohKod';

/**
 * @type {RegExp}
 * @protected
 */
const CODE_REGEX = /^[A-Z]{3}[0-9]{2}$/gi;

/**
 * @param {string} maybeCode location code
 * @return {boolean} if it it location code or not
 */
const isCode = (maybeCode) => {
  return !!maybeCode.match(CODE_REGEX);
};

/**
 * @param {string} maybeCodeOrLikeExpr location code or like expression
 * @return {boolean} if it it location code or not
 */
export const isCodeOrLikeExpr = (maybeCodeOrLikeExpr) => {
  return isCode(maybeCodeOrLikeExpr);
};

/**
 * @type {ol.source.Vector}
 * @const
 */
const STORE = new ol_source_Vector({});

/**
 *
 * @type {TypeOptions}
 */
export const TYPE = {
  primaryKey: LOCATION_CODE_FIELD_NAME,
  serviceUrl: MUNIMAP_URL,
  store: STORE,
  layerId: 2,
  name: 'building',
};

/**
 * @return {ol.source.Vector} Store
 */
export const getStore = () => {
  return STORE;
};

/**
 * @return {TypeOptions} Type
 */
export const getType = () => {
  return TYPE;
};
