goog.provide('ics.map.cluster');

goog.require('ics.map.range');
goog.require('ol.Feature');


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.cluster.RESOLUTION =
    ics.map.range.createResolution(8.5, Number.POSITIVE_INFINITY);


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
ics.map.cluster.isCluster = function(feature) {
  var clusteredFeatures = feature.get('features');
  return goog.isArray(clusteredFeatures) &&
      clusteredFeatures.every(function(f) {
        return f instanceof ol.Feature;
      });
};


/**
 * @param {ol.Feature} feature
 * @return {Array.<ol.Feature>}
 */
ics.map.cluster.getFeatures = function(feature) {
  return ics.map.cluster.isCluster(feature) ?
      /** @type {Array.<ol.Feature>} */(feature.get('features')) : [];
};

