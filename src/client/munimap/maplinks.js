goog.provide('munimap.mapLinks');


/**
 * @param {ol.Map} map
 * @return {ol.control.Control}
 */
munimap.mapLinks.create = function(map) {
  var main = document.createElement('div');
  main.className += ' munimap-link';
  main.appendChild(munimap.mapLinks.part('./seznam.png', map));
  main.appendChild(munimap.mapLinks.part('./google.png', map));
  var result = new ol.control.Control({
    element: main
  });
  return result;
};


/**
 * @param {string} part
 * @param {ol.Map} map
 * @return {Element}
 */
munimap.mapLinks.part = function(part, map) {
  var sub = document.createElement('div');
  sub.className += ' munimap-link-item';
  var path = part;
  if (!jpad.DEV) {
    path = '//' + jpad.PROD_DOMAIN + path;
  }
  sub.addEventListener('click', function() {
    munimap.mapLinks.click(part, map);
  });
  sub.style.backgroundImage = 'url(' + path + ')';
  if (part === './seznam.png') {
    sub.title = munimap.lang.getMsg(munimap.lang.Translations.SEZNAM_MAP);
  } else {
    sub.title = munimap.lang.getMsg(munimap.lang.Translations.GOOGLE_MAP);
  }
  return sub;
};


/**
 * @param {string} part
 * @param {ol.Map} map
 */
munimap.mapLinks.click = function(part, map) {
  var z = map.getView().getZoom().toString();
  var center = ol.proj.transform(
    map.getView().getCenter() || null,
    ol.proj.get('EPSG:3857'),
    ol.proj.get('EPSG:4326')
  );
  var x = center[1].toString();
  var y = center[0].toString();
  if (part === './seznam.png') {
    munimap.matomo.sendEvent('mapLinks', 'mapy.cz');
    window.open('https://mapy.cz/zakladni?x=' + y + '&y=' + x + '&z=' + z);
  } else {
    munimap.matomo.sendEvent('mapLinks', 'maps.google.com');
    window.open('http://www.google.com/maps/@' + x + ',' + y + ',' +
        z + 'z');
  }
};


