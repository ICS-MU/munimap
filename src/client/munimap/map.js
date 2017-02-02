goog.provide('munimap.map');


/**
 *
 * @param {ol.Map} map
 * @param {ol.Coordinate} point
 */
munimap.map.zoomToPoint = function(map, point) {
  var view = map.getView();
  var size = map.getSize() || null;
  var viewExtent = view.calculateExtent(size);
  var floorResolution = view.constrainResolution(
      munimap.floor.RESOLUTION.max);
  goog.asserts.assertNumber(floorResolution);
  var futureExtent = ol.extent.getForViewAndSize(point,
      floorResolution, view.getRotation(), size);
  munimap.move.setAnimation(map, viewExtent, futureExtent);
  view.setCenter(point);
  view.setResolution(floorResolution);
};
