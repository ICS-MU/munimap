goog.provide('munimap.reset');

goog.require('assert');
goog.require('goog.asserts');
goog.require('munimap.assert');
goog.require('munimap.create');
goog.require('munimap.load');
goog.require('munimap.marker');
goog.require('munimap.move');


/**
 * @param {ol.Map} map
 * @param {munimapx.reset.Options} options
 * @return {goog.Thenable<ol.Map>} promise of features contained
 * in server response
 */
munimap.reset = function(map, options) {

  munimap.getProps(map).selectedFloor = null;
  munimap.getProps(map).selectedBuilding = null;

  var resetKeys = goog.object.getKeys(options);
  resetKeys.sort();
  munimap.ga.sendEvent(
      'map',
      'reset',
      resetKeys.join(',')
  );

  munimap.reset.assertOptions(options);

  return new goog.Promise(function(resolve, reject) {
    goog.Promise.all([
      options,
      munimap.create.loadOrDecorateMarkers(options.markers, options),
      munimap.load.featuresFromParam(options.zoomTo)
    ]).then(function(results) {
      var options = results[0];
      var markers = results[1];
      var zoomTos = results[2];

      options.target = map.getTarget();
      var view = munimap.create.calculateView(options, markers, zoomTos);

      return {
        view: view,
        markers: markers,
        markerLabel: options.markerLabel
      };
    }).then(function(options) {
      var markers = options.markers;
      var view = options.view;

      var markerSource = munimap.marker.getStore(map);
      markerSource.clear();
      markerSource.addFeatures(markers);

      var clusterSource = munimap.cluster.getSource(map);
      clusterSource.clear();
      clusterSource.addFeatures(markers);
      var clusterLayer = munimap.cluster.getLayer(map);
      var oldMinRes = clusterLayer.getMinResolution();
      var clusterResolution = munimap.cluster.BUILDING_RESOLUTION;
      var firstMarker = markers[0];
      if (markers.length && (munimap.room.isRoom(firstMarker) ||
          munimap.door.isDoor(firstMarker))) {
        clusterResolution = munimap.cluster.ROOM_RESOLUTION;
      }
      if (oldMinRes !== clusterResolution.min) {
        clusterLayer.setMinResolution(clusterResolution.min);
      }

      var size = map.getSize();
      goog.asserts.assert(goog.isDefAndNotNull(size));
      var oldExtent = map.getView().calculateExtent(size);
      var newExtent = view.calculateExtent(size);

      if (ol.extent.intersects(oldExtent, newExtent)) {
        munimap.move.setAnimation(map, oldExtent, newExtent);
      }

      map.setView(view);

      return map;
    }).then(resolve);
  });
};


/**
 * @param {munimapx.reset.Options} options
 */
munimap.reset.assertOptions = function(options) {
  assert(options.zoom === undefined || options.zoomTo === undefined,
      'Zoom and zoomTo options can\'t be defined together.');
  assert(options.center === undefined || options.zoomTo === undefined,
      'Center and zoomTo options can\'t be defined together.');
  munimap.assert.zoom(options.zoom);
  munimap.assert.zoomTo(options.zoomTo);
  munimap.assert.markers(options.markers);
};
