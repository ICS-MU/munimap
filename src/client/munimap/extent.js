goog.provide('munimap.extent');


/**
 * @param {ol.Feature} feature
 * @return {ol.Extent}
 */
munimap.extent.ofFeature = function(feature) {
  var geom = feature.getGeometry();
  if (geom) {
    return geom.getExtent();
  } else {
    return ol.extent.createEmpty();
  }
};


/**
 * @param {Array<ol.Feature>} features
 * @return {ol.Extent}
 */
munimap.extent.ofFeatures = function(features) {
  var extent = ol.extent.createEmpty();
  features.forEach(function(feature) {
    var geom = feature.getGeometry();
    if (geom) {
      var ext = geom.getExtent();
    }
    if (ext) {
      ol.extent.extend(extent, ext);
    }
  });
  return extent;
};
