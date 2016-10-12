goog.provide('munimap.move');


/**
 * @param {ol.Map} map
 * @param {ol.Extent} ext1
 * @param {ol.Extent} ext2
 */
munimap.move.setAnimation = function(map, ext1, ext2) {
  var view = map.getView();
  var duration = munimap.move.getAnimationDuration(ext1, ext2);
  var pan = ol.animation.pan({
    duration: duration,
    source: /** @type {ol.Coordinate} */ (view.getCenter()),
    easing: null
  });
  var zoom = ol.animation.zoom({
    duration: duration,
    resolution: /** @type {number} */ (view.getResolution()),
    easing: null
  });
  map.beforeRender(pan, zoom);
};


/**
 * @param {ol.Extent} ext1
 * @param {ol.Extent} ext2
 * @return {number}
 * @protected
 */
munimap.move.getAnimationDuration = function(ext1, ext2) {
  var area1 = ol.extent.getArea(ext1);
  var area2 = ol.extent.getArea(ext2);
  var enlArea = ol.extent.getEnlargedArea(ext1, ext2);
  var diagonal = Math.sqrt(enlArea);
  var ratio = diagonal / Math.sqrt(area1 + area2);

  if (ratio > 5) {
    ratio = diagonal < 10000 ? 2.5 : 5;
  }
  return ratio * 1000;
};
