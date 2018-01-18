goog.provide('munimap.matomo');

goog.require('goog.net.XhrIo');
goog.require('munimap.marker');



/**
 * @public
 */
munimap.matomo.init = function() {
  var matomo = 'https://analytics.dis.ics.muni.cz/piwik/piwik.php?idsite=4' + 
  '&rec=1&action_name=library / loaded&url=' + window.location.href +
  '&rand=' + String(Math.random()).slice(2, 8) + '&urlref=' + 
  window.document.referrer + '&res=' + 
  String(window.screen.width) + 'x' + String(window.screen.height) + 
  '&send_image=0';
  goog.net.XhrIo.send(encodeURI(matomo));
};


/**
 * @param {string} category
 * @param {string} action
 */
munimap.matomo.sendEvent = function(category, action) {
  var matomo = 'https://analytics.dis.ics.muni.cz/piwik/piwik.php?idsite=4' + 
  '&rec=1&action_name=' + category + ' / ' + action + '&url=' + 
  window.location.href +
  '&rand=' + String(Math.random()).slice(2, 8) + '&urlref=' + 
  window.document.referrer + '&res=' + 
  String(window.screen.width) + 'x' + String(window.screen.height) + 
  '&e_c=' + category + '&e_a=' + action + '&send_image=0';
  goog.net.XhrIo.send(encodeURI(matomo));
};


/**
 * @param {Array} markers
 */
munimap.matomo.checkCustomMarker = function(markers) {
  if (markers.length && (markers.some(function(el) {
    return munimap.marker.custom.isCustom(el)
  }))) {
    munimap.matomo.sendEvent('customMarker','true');
  }
  else {
    munimap.matomo.sendEvent('customMarker','false');
  }
};
