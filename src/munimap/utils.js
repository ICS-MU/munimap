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

export {
  removeArrayDuplicates,
  isString,
  isNumber,
  isDef,
  isDefAndNotNull,
  isArray,
  isBoolean,
};
