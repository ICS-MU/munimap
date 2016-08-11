goog.provide('ics.map.extent');

goog.require('ol.extent');
goog.require('ol.render.Feature');


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @return {ol.Extent}
 */
ics.map.extent.ofFeature = function(feature) {
  if (feature instanceof ol.render.Feature) {
    return feature.getExtent();
  }
  var geom = feature.getGeometry();
  if (geom) {
    return geom.getExtent();
  } else {
    return ol.extent.createEmpty();
  }
};


/**
 * @param {Array<ol.Feature|ol.render.Feature>} features
 * @return {ol.Extent}
 */
ics.map.extent.ofFeatures = function(features) {
  var extent = ol.extent.createEmpty();
  features.forEach(function(feature) {
    if (feature instanceof ol.render.Feature) {
      var ext = feature.getExtent();
    } else {
      var geom = feature.getGeometry();
      if (geom) {
        ext = geom.getExtent();
      }
    }
    if (ext) {
      ol.extent.extend(extent, ext);
    }
  });
  return extent;
};
