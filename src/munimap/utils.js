/**
 * @module utils
 */

/**
 * Remove duplicates from Array.
 * @param {Array} arr array
 */
const removeArrayDuplicates = (arr) => {
  arr = [...new Set(arr)];
};

/**
 * @param {?} value value
 * @return {boolean} isString
 */
const isString = (value) => {
  return typeof value === 'string';
};

/**
 * Returns true if the value is a number.
 * @param {?} value Variable to test.
 * @return {boolean} Whether variable is a number.
 */
const isNumber = (value) => {
  return typeof value === 'number';
};

/**
 * Returns true if the value is not undefined.
 *
 * @param {?} value Variable to test.
 * @return {boolean} Whether variable is defined.
 */
const isDef = (value) => {
  return value !== undefined;
};

/**
 * Returns true if the value is defined and not null.
 * @param {?} value Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
const isDefAndNotNull = (value) => {
  return value !== undefined && value !== null;
};

/**
 * Returns true if the value is an array.
 * @param {?} value Variable to test.
 * @return {boolean} Whether variable is an array.
 */
const isArray = (value) => {
  return Array.isArray(value);
};

/**
 * Returns true if the value is a boolean.
 * @param {?} value Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
const isBoolean = (value) => {
  return typeof value === 'boolean';
};

/**
 * @param {?} value Variable to test
 * @return {boolean} Whether variable is function.
 */
const isFunction = (value) => {
  return typeof value === 'function';
};

/**
 * @param {function} fn function
 * @param {...*} partialArgs arguments
 * @return {any} function
 */
const partial = (fn, ...partialArgs) => {
  const _args = [...partialArgs];
  return (...args) => {
    let newArgs = _args.slice();
    newArgs = [...newArgs, ...args];
    return fn(newArgs);
  };
};

/**
 * @param {Array} arr1 array 1
 * @param {Array} arr2  array 2
 * @return {boolean} is equal
 */
const arrayEquals = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const l = arr1.length;
  for (let i = 0; i < l; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

/**
 * @param {*} value value
 * @return {string} result type
 */
const typeOf = (value) => {
  if (isArray(value)) {
    return 'array';
  }
  if (value === null) {
    return 'null';
  }

  return typeof value;
};

/**
 * Returns true if the value is an object (incl. Arrays and functions).
 * @param {*} value value
 * @return {boolean} isObject
 */
const isObject = (value) => {
  return Object(value) === value;
};

/**
 * @return {boolean} is IE
 */
const isUserAgentIE = () => {
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf('MSIE ');
  const trident = ua.indexOf('Trident/');

  return msie > 0 || trident > 0;
};

/**
 * @param {number} x x
 * @param {number} min min
 * @param {number} max max
 * @return {boolean} inRange
 */
const inRange = (x, min, max) => {
  return x >= min && x <= max;
};

export {
  removeArrayDuplicates,
  isString,
  isNumber,
  isDef,
  isDefAndNotNull,
  isArray,
  isBoolean,
  isFunction,
  partial,
  arrayEquals,
  typeOf,
  isObject,
  isUserAgentIE,
  inRange,
};
