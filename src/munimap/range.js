/**
 * @module range
 */

/**
 * @typedef {Object} RangeInterface
 * @property {number} min
 * @property {number} max
 * @property {boolean} includesMin
 * @property {boolean} includesMax
 */

/**
 * @param {RangeInterface} range range
 * @param {number} number number
 * @return {boolean} whether contains number
 */
export const contains = (range, number) => {
  return (
    (range.min < number || (range.includesMin && number == range.min)) &&
    (number < range.max || (range.includesMax && number == range.max))
  );
};

/**
 * See minResolution and maxResolution properties at
 * http://openlayers.org/en/master/apidoc/ol.layer.Base.html
 * @param {number} min min
 * @param {number} max max
 * @return {RangeInterface} range
 */
export const createResolution = (min, max) => {
  return {
    min: min,
    max: max,
    includesMin: true,
    includesMax: false,
  };
};