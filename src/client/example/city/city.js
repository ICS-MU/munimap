goog.provide('example.City');
goog.provide('example.city.Property');

goog.require('ol.Feature');


/**
 * @enum {string}
 */
example.city.Property = {
  MY_TITLE: 'myTitle'
};



/**
 * @constructor
 * @param {examplex.city.Options=} opt_options
 * @extends {ol.Feature}
 */
example.City = function(opt_options) {
  ol.Feature.call(this, opt_options);

};
goog.inherits(example.City, ol.Feature);


/**
 * @return {string}
 */
example.City.prototype.getMyTitle = function() {
  return /** @type {string} */(
      this.get(example.city.Property.MY_TITLE));
};


/**
 * @param {string|undefined} title
 */
example.City.prototype.setMyTitle = function(title) {
  this.set(example.city.Property.MY_TITLE, title);
};
