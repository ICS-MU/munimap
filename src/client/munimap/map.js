goog.provide('munimap.map');


/**
 *
 * @param {ol.Map} map
 * @param {ol.Coordinate} point
 * @param {number} resolution
 */
munimap.map.zoomToPoint = function(map, point, resolution) {
  var view = map.getView();
  var size = map.getSize() || null;
  var viewExtent = view.calculateExtent(size);
  var constrainedResolution = view.constrainResolution(resolution, 1, 1);
  goog.asserts.assertNumber(constrainedResolution);
  var futureExtent = ol.extent.getForViewAndSize(point,
    constrainedResolution, view.getRotation(), size);
  var duration = munimap.move.getAnimationDuration(viewExtent, futureExtent);
  view.animate({
    center: point,
    duration: duration,
    resolution: constrainedResolution
  });
};
