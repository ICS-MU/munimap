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
  munimap.matomo.sendEvent('map', 'reset');

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
        markerLabel: options.markerLabel,
        markerFilter: options.markerFilter
      };
    }).then(function(options) {
      var markerLabel = options.markerLabel;
      var markers = options.markers;

      var markerLayer = munimap.marker.getLayer(map);
      var markerSource = munimap.marker.getStore(map);
      markerSource.clear();
      var markerOptions = {
        map: map,
        markerSource: markerSource,
        markerLabel: markerLabel
      };
      markerLayer.setStyle(goog.partial(munimap.marker.style.function,
        markerOptions));

      var clusterLayer = munimap.cluster.getLayer(map);
      var clusterSource = munimap.cluster.getSource(map);
      clusterSource.clear();
      clusterLayer.setStyle(goog.partial(
        munimap.cluster.style.function, markerOptions));

      if (markers && markers.length > 0) {
        markerSource.addFeatures(markers);
        clusterSource.addFeatures(markers);

        var oldMinRes = clusterLayer.getMinResolution();
        var clusterResolution = munimap.cluster.BUILDING_RESOLUTION;
        if (markers.length && (markers.some(function(el) {
          return munimap.room.isRoom(el);
        }) || markers.some(function(el) {
          return munimap.door.isDoor(el);
        })
        )) {
          clusterResolution = munimap.cluster.ROOM_RESOLUTION;
        }
        if (oldMinRes !== clusterResolution.min) {
          clusterLayer.setMinResolution(clusterResolution.min);
        }
      }
      var currentExt = map.getView().calculateExtent();
      var ext = options.view.calculateExtent();
      var res = options.view.getResolution();
      var finalExtent = ol.extent.buffer(ext, res * 50, ext);
      var duration = 0;
      if (ol.extent.intersects(currentExt, finalExtent)) {
        duration = munimap.move.getAnimationDuration(currentExt,
          finalExtent);
      }
      map.getView().fit(finalExtent, {
        duration: duration,
        callback: function() {
          munimap.cluster.updateClusteredFeatures(
            map, map.getView().getResolution() || 0);
          resolve();
        }
      });
    });
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
