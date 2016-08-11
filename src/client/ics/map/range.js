goog.provide('ics.map.Range');
goog.provide('ics.map.range');


/**
 * @typedef {{
 *   min: number,
 *   max: number,
 *   includesMin: boolean,
 *   includesMax: boolean
 * }}
 */
ics.map.Range;


/**
 * @param {ics.map.Range} range
 * @param {number} number
 * @return {boolean}
 */
ics.map.range.contains = function(range, number) {
  return (range.min < number || (range.includesMin && number == range.min)) &&
      (number < range.max || (range.includesMax && number == range.max));
};


/**
 * See minResolution and maxResolution properties at
 * http://openlayers.org/en/master/apidoc/ol.layer.Base.html
 * @param {number} min
 * @param {number} max
 * @return {ics.map.Range}
 */
ics.map.range.createResolution = function(min, max) {
  return {
    min: min,
    max: max,
    includesMin: true,
    includesMax: false
  };
};


