goog.provide('munimap.move');

/**
 * @param {ol.Extent} ext1
 * @param {ol.Extent} ext2
 * @return {number}
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
