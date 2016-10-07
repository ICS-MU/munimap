goog.provide('assert');

goog.require('goog.asserts');
goog.require('goog.dom');


/**
 * @template T
 * @param {T} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @return {T} The value of the condition.
 * @throws {goog.asserts.AssertionError} Failure.
 */
assert = function(condition, opt_message) {
  if (!condition) {
    goog.asserts.fail(opt_message);
  }
  return condition;
};


/**
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @return {!Element} The value, likely to be a DOM Element when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not an Element.
 */
assert.element = function(value, opt_message) {
  if (!goog.isObject(value) || value.nodeType != goog.dom.NodeType.ELEMENT) {
    goog.asserts.fail(opt_message);
  }
  return /** @type {!Element} */ (value);
};
