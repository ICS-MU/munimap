/* eslint-disable no-console */

/**
 * @module assert/assert
 */

import * as mm_utils from '../utils/utils.js';
import {Feature} from 'ol';

/**
 * @extends {Error}
 */
class AssertionError extends Error {
  /**
   * @param {string} message msg
   */
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * @param {*} assertion Assertion we expected to be truthy.
 * @param {string} [opt_msg] optional message
 * @return {boolean} assertion
 * @throws {AssertionError} AssertionError
 */
const assert = (assertion, opt_msg) => {
  if (!assertion) {
    throw new AssertionError(opt_msg);
  }
  return assertion;
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] optional message
 * @return {string} asserted value
 */
const assertString = (val, opt_msg) => {
  if (!mm_utils.isString(val)) {
    let m = `Expected string not ${mm_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {string} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] optional message
 * @return {Array} asserted value
 */
const assertArray = (val, opt_msg) => {
  if (!mm_utils.isArray(val)) {
    let m = `Expected array not ${mm_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {Array} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] optional message
 * @return {boolean} asserted value
 */
const assertBoolean = (val, opt_msg) => {
  if (!mm_utils.isBoolean(val)) {
    let m = `Expected boolean not ${mm_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    console.log(m);
    throw new AssertionError(m);
  }
  return /**@type {boolean} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] optional message
 * @return {number} asserted value
 */
const assertNumber = (val, opt_msg) => {
  if (!mm_utils.isNumber(val)) {
    let m = `Expected number not ${mm_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {number} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] Error message.
 * @return {!Element} asserted value
 * @throws {AssertionError} When the value is not an Element.
 */
const assertElement = (val, opt_msg) => {
  if (!mm_utils.isObject(val) || val.nodeType !== Node.ELEMENT_NODE) {
    let m = `Expected Element not ${mm_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /** @type {!Element} */ (val);
};

/**
 * @param {*} val value
 * @param {Function} type type
 * @param {string} [opt_msg] optional message
 * @return {*} asserted value
 */
const assertInstanceof = (val, type, opt_msg) => {
  if (!(val instanceof type)) {
    let m = `Expected instanceof ${mm_utils.typeOf(type)} not ${mm_utils.typeOf(
      val
    )}.`;

    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {boolean} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] Error message.
 * @return {any} asserted value
 * @throws {AssertionError} When the value is not an Element.
 */
const assertExists = (val, opt_msg) => {
  if (!mm_utils.isDefAndNotNull(val)) {
    let m = `Expected to exist: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /** @type {any}*/ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] Error message.
 * @return {any} asserted value
 * @throws {AssertionError} When the value is not a Function.
 */
const assertFunction = (val, opt_msg) => {
  if (!mm_utils.isFunction(val)) {
    let m = `Expected to exist: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /** @type {any}*/ (val);
};

/**
 * @param {Array<Feature|string>} markers markers
 * @return {Array<Feature>} markers as ol features
 */
const assertMarkerFeatures = (markers) => {
  const result = markers.filter((marker) => !(marker instanceof Feature));
  if (result.length) {
    throw new AssertionError(
      'Something is wrong. Some loaded marker is not ol/Feature.'
    );
  }
  return /**@type {Array<Feature>}*/ (markers);
};

export {
  AssertionError,
  assert,
  assertArray,
  assertBoolean,
  assertElement,
  assertExists,
  assertFunction,
  assertInstanceof,
  assertMarkerFeatures,
  assertNumber,
  assertString,
};
