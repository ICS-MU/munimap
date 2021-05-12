/**
 * @param {*} assertion Assertion we expected to be truthy.
 * @param {string=} opt_msg optional message
 * @return {boolean} assertion
 * @throws {AssertionError} AssertionError
 */
export default (assertion, opt_msg) => {
  if (!assertion) {
    throw new Error(opt_msg);
  }
  return assertion;
};
