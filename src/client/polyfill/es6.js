goog.provide('polyfill.es6');


/**
 */
if (!Array.prototype.find) {
  /**
   * @param {Function} predicate
   * @return {*}
   * @suppress {duplicate}
   */
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = /** @type {Array} */(Object(this));
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}


/**
 */
if (!String.prototype.startsWith) {
  /**
   * @param {string} searchString
   * @param {number=} opt_position
   * @return {boolean}
   * @suppress {duplicate}
   */
  String.prototype.startsWith = function(searchString, opt_position) {
    var position = opt_position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}
