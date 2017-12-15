goog.provide('munimap.extent');


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @return {ol.Extent}
 */
munimap.extent.ofFeature = function(feature) {
  if (feature instanceof ol.Feature) {
    var geom = feature.getGeometry();
    if (geom) {
      return geom.getExtent();
    } else {
      return ol.extent.createEmpty();
    }
  } else {
    return feature.getExtent();
  }
};


/**
 * @param {Array<ol.Feature|ol.render.Feature>} features
 * @return {ol.Extent}
 */
munimap.extent.ofFeatures = function(features) {
  var extent = ol.extent.createEmpty();
  features.forEach(function(feature) {
    var ext;
    if (feature instanceof ol.Feature) {
      var geom = feature.getGeometry();
      if (geom) {
        if (munimap.room.isRoom(feature) && geom instanceof ol.geom.Point) {
          var locCode = /**@type (string)*/ (feature.get('polohKod'));
          var building = munimap.building.getByCode(locCode);
          ext = building.getGeometry().getExtent();
        } else {
          ext = geom.getExtent();
        }
      }
    }
    else {
      ext = feature.getExtent();
    }
    if (ext) {
      ol.extent.extend(extent, ext);
    }
  });
  return extent;
};
