goog.provide('ics.map.reset');

goog.require('goog.asserts');
goog.require('ics.map.assert');
goog.require('ics.map.create');
goog.require('ics.map.load');
goog.require('ics.map.marker');
goog.require('ics.map.move');
goog.require('ol.extent');


/**
 * @param {ol.Map} map
 * @param {icsx.map.reset.Options} options
 * @return {goog.Thenable<ol.Map>} promise of features contained
 * in server response
 */
ics.map.reset = function(map, options) {

  ics.map.reset.assertOptions(options);

  return new goog.Promise(function(resolve, reject) {
    goog.Promise.all([
      options,
      ics.map.load.featuresFromParam(options.markers),
      ics.map.load.featuresFromParam(options.zoomTo)
    ]).then(function(results) {
      var options = results[0];
      var markers = results[1];
      var zoomTos = results[2];

      options.target = map.getTarget();
      var view = ics.map.create.calculateView(options, markers, zoomTos);

      return {
        view: view,
        markers: markers,
        markerLabel: options.markerLabel
      };
    }).then(function(options) {
      var markers = options.markers;
      var view = options.view;

      var markerSource = ics.map.marker.getStore(map);
      markerSource.clear();
      markerSource.addFeatures(markers);

      var size = map.getSize();
      goog.asserts.assert(goog.isDefAndNotNull(size));
      var oldExtent = map.getView().calculateExtent(size);
      var newExtent = view.calculateExtent(size);

      if (ol.extent.intersects(oldExtent, newExtent)) {
        ics.map.move.setAnimation(map, oldExtent, newExtent);
      }

      map.setView(view);

      return map;
    }).then(resolve);
  });
};


/**
 * @param {icsx.map.reset.Options} options
 */
ics.map.reset.assertOptions = function(options) {
  goog.asserts.assert(
      options.zoom === undefined || options.zoomTo === undefined,
      'Zoom and zoomTo options can\'t be defined together.');
  goog.asserts.assert(
      options.center === undefined || options.zoomTo === undefined,
      'Center and zoomTo options can\'t be defined together.');
  ics.map.assert.zoom(options.zoom);
  ics.map.assert.zoomTo(options.zoomTo);
  ics.map.assert.markers(options.markers);
};
