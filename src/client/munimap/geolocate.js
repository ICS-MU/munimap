goog.provide('munimap.geolocate');


/**
 * @param {ol.Map} map
 * @return {ol.control.Control}
 */
munimap.geolocate.create = function(map) {
  var geolocation = new ol.Geolocation({
    projection: map.getView().getProjection()
  });

  var main = document.createElement('div');
  main.className += ' munimap-geolocate';
  main.id = 'muni-locate';
  main.title = munimap.lang.getMsg(munimap.lang.Translations.FIND_ME);
  var icon = document.createElement('i');
  icon.className += ' munimap-crosshairs';
  icon.innerHTML = '&#xe802;';
  main.appendChild(icon);
  var result = new ol.control.Control({
    element: main
  });

  main.addEventListener('click', function() {
    munimap.matomo.sendEvent('geolocation', 'click');
    if (!geolocation.getTracking()) {
      geolocation.setTracking(true);
      geolocation.once('change', function() {
        munimap.geolocate.animation(map, geolocation);
      });
    } else {
      munimap.geolocate.animation(map, geolocation);
    }
  });

  var positionFeature = new ol.Feature();
  positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#002776'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0,39,118,0.25)',
        width: 30
      })
    })
  }));

  geolocation.on('change:position', function() {
    var coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ?
      new ol.geom.Point(coordinates) : null);
  });

  var source = new ol.source.Vector({
    features: [positionFeature]
  });
  var layer = new ol.layer.Vector();

  layer.setSource(source);
  map.addLayer(layer);

  return result;
};


/**
 * @param {ol.Map} map
 * @param {ol.Geolocation} geolocation
 */
munimap.geolocate.animation = function(map, geolocation) {
  var center = geolocation.getPosition() || null;
  var view = map.getView();
  var currExt = view.calculateExtent(map.getSize());
  var res = view.getResolution();
  var buffExt = ol.extent.buffer(currExt, res * 100, currExt);
  var extent = ol.extent.boundingExtent([center, view.getCenter()]);
  var targetExtent = ol.extent.boundingExtent([center]);
  var duration = munimap.move.getAnimationDuration(currExt, targetExtent);
  var resolution = view.getResolutionForExtent(extent);
  var zoom = view.getZoomForResolution(resolution);
  if (ol.extent.intersects(buffExt, targetExtent)) {
    view.animate({
      center: center,
      duration: duration,
      zoom: 18
    });
  } else {
    if (zoom >= 18) {
      zoom = 17.5;
    }
    view.animate({
      center: center,
      duration: duration
    });
    view.animate({
      zoom: zoom,
      duration: duration / 2
    }, {
      zoom: 18,
      duration: duration / 2
    });
  }
};

/**
 * @param {Array.<number>} firstPoint
 * @param {Array.<number>} secondPoint
 * @return {number} distance in meters
 */
munimap.geolocate.getDistance = function(firstPoint, secondPoint) {
  var projection = 'EPSG:4326';
  var length = 0;
  var sourceProj = 'EPSG:3857';
  var c1 = ol.proj.transform(firstPoint, sourceProj, projection);
  var c2 = ol.proj.transform(secondPoint, sourceProj, projection);

  var wgs84Sphere = new ol.Sphere(6378137);
  length += wgs84Sphere.haversineDistance(c1, c2);
  return length;
};
