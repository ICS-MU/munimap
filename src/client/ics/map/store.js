goog.provide('ics.map.store');

goog.require('goog.net.XhrManager');
goog.require('ics.map.load');
goog.require('ol.Map');


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @return {?string}
 */
ics.map.store.getUid = function(feature) {
  var uid = null;
  var code = feature.get('polohKod');
  if (code) {
    uid = goog.asserts.assertString(code);
  } else {
    var type =
        /**@type {ics.map.type.Options}*/ (feature.get(ics.map.type.NAME));
    if (type) {
      var pk = feature.get(type.primaryKey);
      uid = type.name + ':' + pk;
    }
  }
  return uid;
};
