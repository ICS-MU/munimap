goog.provide('ics.map.assert');


goog.require('ics.map.building');
goog.require('ics.map.lang');
goog.require('ics.map.room');


/**
 * @param {Array.<string>|undefined} markers
 */
ics.map.assert.markers = function(markers) {
  if (markers !== undefined) {
    goog.asserts.assert(goog.isArray(markers),
        'Markers should be an array of strings.');
    var onlyBuildings = markers.every(ics.map.building.isCodeOrLikeExpr);
    if (!onlyBuildings) {
      var onlyRooms = markers.every(ics.map.room.isCodeOrLikeExpr);
      if (!onlyRooms) {
        goog.asserts.fail('Markers should contain only building or only room' +
            ' location codes or corresponding LIKE expressions.');
      }
    }
  }
};


/**
 * @param {string|Element} target
 */
ics.map.assert.target = function(target) {
  if (goog.isString(target)) {
    goog.asserts.assertElement(goog.dom.getElement(target),
        'Target element "' + target + '" not found in document.');
  } else {
    goog.asserts.assert(document.body.contains(target),
        'Target element is not in document.');
  }
};


/**
 * @param {number|undefined} zoom
 */
ics.map.assert.zoom = function(zoom) {
  goog.asserts.assert(zoom === undefined || (zoom >= 0 && zoom <= 30),
      'Zoom should be in range <0,30>.');
};


/**
 * @param {Array.<string>|string|undefined} zoomTo
 */
ics.map.assert.zoomTo = function(zoomTo) {
  if (zoomTo !== undefined) {
    goog.asserts.assert(goog.isArray(zoomTo) || goog.isString(zoomTo),
        'ZoomTo should be string or array of strings.');
    zoomTo = goog.isString(zoomTo) ? [zoomTo] : zoomTo;
    var onlyBuildings = zoomTo.every(ics.map.building.isCodeOrLikeExpr);
    if (!onlyBuildings) {
      var onlyRooms = zoomTo.every(ics.map.room.isCodeOrLikeExpr);
      if (!onlyRooms) {
        goog.asserts.fail('ZoomTo should contain only building or only room' +
            ' location codes or corresponding LIKE expressions.');
      }
    }
  }
};


/**
 * @param {string|undefined} lang
 */
ics.map.assert.lang = function(lang) {
  if (lang !== undefined) {
    if (goog.isString(lang)) {
      switch (lang) {
        case ics.map.lang.Abbr.CZECH:
        case ics.map.lang.Abbr.ENGLISH:
          break;
        default:
          var values = [];
          for (var langCode in ics.map.lang.Abbr) {
            values.push(ics.map.lang.Abbr[langCode]);
          }
          goog.asserts.fail('Parameter lang contains unknown value. ' +
              'List of possible values: ' + values.join(', ') + '.');
          break;
      }
    } else {
      goog.asserts.fail('Parameter lang should be string.');
    }
  }
};
