/**
 * @module utils/regex
 */

/**
 * @param {string} codeOrLikeExpr code or like expression
 * @return {RegExp} regExp
 */
const convertCodeOrLikeExpr = (codeOrLikeExpr) => {
  const s = codeOrLikeExpr.replace(/_/g, '.');
  return new RegExp(s);
};

/**
 * @param {string} codeOrLikeExpr code or like expression
 * @param {string} value value to test
 * @return {boolean} result
 */
const testCodeOrLikeExpr = (codeOrLikeExpr, value) => {
  const regex = convertCodeOrLikeExpr(codeOrLikeExpr);
  return regex.test(value);
};

export {testCodeOrLikeExpr};
