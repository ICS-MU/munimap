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

const isString = (val) => {
  return typeof val === 'string';
};

export {removeArrayDuplicates, isString};
