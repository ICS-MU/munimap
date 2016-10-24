goog.provide('jpad.func');


/**
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {*} object
 * @return {boolean}
 * @template T
 */
jpad.func.instanceof = function(type, object) {
  return object instanceof type;
};
