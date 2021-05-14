/**
 * @module assert
 */

import * as munimap_utils from './utils.js';

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
 * @param {string=} opt_msg optional message
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
 * @param {string=} opt_msg optional message
 * @return {string} asserted value
 */
const assertString = (val, opt_msg) => {
  if (!munimap_utils.isString(val)) {
    const m = `Expected string not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m + ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {string} */ (val);
};

/**
 * @param {*} val value
 * @param {string=} opt_msg optional message
 * @return {Array} asserted value
 */
const assertArray = (val, opt_msg) => {
  if (!munimap_utils.isArray(val)) {
    const m = `Expected array not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m + ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {Array} */ (val);
};

/**
 * @param {*} val value
 * @param {string=} opt_msg optional message
 * @return {boolean} asserted value
 */
const assertBoolean = (val, opt_msg) => {
  if (!munimap_utils.isBoolean(val)) {
    const m = `Expected boolean not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m + ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {boolean} */ (val);
};

/**
 * @param {*} val value
 * @param {string=} opt_msg optional message
 * @return {number} asserted value
 */
const assertNumber = (val, opt_msg) => {
  if (!munimap_utils.isBoolean(val)) {
    const m = `Expected number not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m + ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {number} */ (val);
};

export {assert, assertArray, assertBoolean, assertString, assertNumber};
