/**
 * @param {*} assertion Assertion we expected to be truthy.
 * @param {string=} opt_msg optional message
 */
export default (assertion, opt_msg) => {
  if (!assertion) {
    throw new Error(opt_msg);
  }
};
