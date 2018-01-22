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
    }
    else {
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
  var currentRes = map.getView().getResolution() || 1;
  // without constrainedResolution zoomToPoint zoom by 1
  var constrainedResolution = map.getView()
      .constrainResolution(currentRes, -2, -1) || 1;
  munimap.map.zoomToPoint(map, center, constrainedResolution);
}
