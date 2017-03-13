goog.provide('munimap.store');

goog.require('goog.asserts');
goog.require('munimap.type');


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @return {?string}
 */
munimap.store.getUid = function(feature) {
  var uid = null;
  var code = feature.get('polohKod');
  if (code) {
    uid = goog.asserts.assertString(code);
  } else {
    var type =
        /**@type {munimap.type.Options}*/ (feature.get(munimap.type.NAME));
    if (type) {
      var pk = feature.get(type.primaryKey);
      uid = type.name + ':' + pk;
    }
  }
  return uid;
};


/**
 *
 * @param {ol.source.Vector} store
 * @param {Array.<ol.Feature>} features
 * @return {Array.<ol.Feature>}
 */
munimap.store.getNotYetAddedFeatures = function(store, features) {
  var storedFeatures = store.getFeatures();
  return features.filter(function(feature) {
    return storedFeatures.indexOf(feature) === -1;
  });
};
