goog.provide('munimap.Range');
goog.provide('munimap.range');


/**
 * @typedef {{
 *   min: number,
 *   max: number,
 *   includesMin: boolean,
 *   includesMax: boolean
 * }}
 */
munimap.Range;


/**
 * @param {munimap.Range} range
 * @param {number} number
 * @return {boolean}
 */
munimap.range.contains = function(range, number) {
  return (range.min < number || (range.includesMin && number == range.min)) &&
    (number < range.max || (range.includesMax && number == range.max));
};


/**
 * See minResolution and maxResolution properties at
 * http://openlayers.org/en/master/apidoc/ol.layer.Base.html
 * @param {number} min
 * @param {number} max
 * @return {munimap.Range}
 */
munimap.range.createResolution = function(min, max) {
  return {
    min: min,
    max: max,
    includesMin: true,
    includesMax: false
  };
};


