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
 * @param {?} val value
 * @return {boolean} isString
 */
const isString = (val) => {
  return typeof val === 'string';
};

/**
 * Returns true if the specified value is a number.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
const isNumber = (val) => {
  return typeof val === 'number';
};

/**
 * Returns true if the specified value is not undefined.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
const isDef = (val) => {
  return val !== undefined;
};

/**
 * Returns true if the specified value is defined and not null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
const isDefAndNotNull = (val) => {
  //undefined == null.
  return val != null;
};

/**
 * Returns true if the specified value is an array.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
const isArray = (val) => {
  return Array.isArray(val);
};

/**
 * Returns true if the specified value is a boolean.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
const isBoolean = (val) => {
  return typeof val === 'boolean';
};

/**
 * @param {?} val Variable to test
 * @return {boolean} Whether variable is function.
 */
const isFunction = (val) => {
  return typeof val === 'function';
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
 * @param {*} val value
 * @return {string} result type
 */
const typeOf = (val) => {
  if (isArray(val)) {
    return 'array';
  }
  if (val === null) {
    return 'null';
  }

  return typeof val;
};

/**
 * Returns true if the specified value is an object (incl. Arrays and functions).
 * @param {*} val value
 * @return {boolean} isObject
 */
const isObject = (val) => {
  return Object(val) === val;
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
};
