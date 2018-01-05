goog.provide('munimap.assert');


goog.require('assert');
goog.require('goog.asserts');
goog.require('jpad.func');
goog.require('munimap');
goog.require('munimap.building');
goog.require('munimap.lang');
goog.require('munimap.optpoi');
goog.require('munimap.room');


/**
 * @param {Array.<string>|undefined} markers
 */
munimap.assert.markers = function(markers) {
  if (markers !== undefined) {
    assert(goog.isArray(markers), 'Markers should be an array.');
    var featureMarkers = [];

    markers.forEach(function(el) {
      if (goog.isString(el)) {
        if (!(munimap.building.isCodeOrLikeExpr(el)) &&
            !(munimap.room.isCodeOrLikeExpr(el)) &&
            !(munimap.door.isCodeOrLikeExpr(el)) &&
            !(munimap.optpoi.isCtgUid(el))) {
          goog.asserts.fail('Markers should contain 1. building, room or ' +
              'door location codes, or 2. corresponding LIKE expressions, or ' +
              '3. POI categories.');
        }
      } else if (jpad.func.instanceof(ol.Feature, el)) {
        goog.asserts.assertInstanceof(el, ol.Feature);
        featureMarkers.push(el);
        munimap.marker.custom.assertSuitable(el);
      } else {
        goog.asserts.fail('Markers should contain only strings or ' +
            'only instances of ol.Feature');
      }
    });
    if (markers.some(function(el) {
      return munimap.optpoi.isCtgUid(el);
    })) {
      if (!(markers.every(function(el) {
        return munimap.optpoi.isCtgUid(el);
      }))) {
        goog.asserts.fail('Markers should contain 1. building, room or ' +
            'door location codes, or 2. corresponding LIKE expressions, or ' +
            '3. POI categories.');
      }
    }
  }
};


/**
 * @param {munimap.getMainFeatureAtPixelFunction|undefined} fce
 */
munimap.assert.getMainFeatureAtPixel = function(fce) {
  if (goog.isDef(fce)) {
    goog.asserts.assertFunction(fce, 'Parameter getMainFeatureAtPixel ' +
        'should be a function of type munimap.getMainFeatureAtPixelFunction.');
  }
};


/**
 * @param {Array.<ol.layer.Vector>|undefined} layers
 */
munimap.assert.layers = function(layers) {
  if (layers !== undefined) {
    assert(goog.isArray(layers),
        'Layers should be an array of ol.layer.Vector objects.');

    var onlyLayers = layers.every(function(layer) {
      return layer instanceof ol.layer.Vector;
    });
    assert(onlyLayers, 'Layers should contain only ol.layer.Vector objects.');
  }
};


/**
 * @param {string|Element} target
 */
munimap.assert.target = function(target) {
  if (goog.isString(target)) {
    assert.element(goog.dom.getElement(target),
        'Target element "' + target + '" not found in document.');
  } else {
    assert(document.body.contains(target),
        'Target element is not in document.');
  }
};


/**
 * @param {number|undefined} zoom
 */
munimap.assert.zoom = function(zoom) {
  assert(zoom === undefined || (zoom >= 0 && zoom <= 30),
      'Zoom should be in range <0,30>.');
};


/**
 * @param {Array.<string>|string|undefined} zoomTo
 */
munimap.assert.zoomTo = function(zoomTo) {
  if (zoomTo !== undefined) {
    assert(goog.isArray(zoomTo) || goog.isString(zoomTo),
        'ZoomTo should be string or array of strings.');
    zoomTo = goog.isString(zoomTo) ? [zoomTo] : zoomTo;
    var onlyBuildings = zoomTo.every(munimap.building.isCodeOrLikeExpr);
    if (!onlyBuildings) {
      var onlyRooms = zoomTo.every(munimap.room.isCodeOrLikeExpr);
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
munimap.assert.lang = function(lang) {
  if (lang !== undefined) {
    if (goog.isString(lang)) {
      switch (lang) {
        case munimap.lang.Abbr.CZECH:
        case munimap.lang.Abbr.ENGLISH:
          break;
        default:
          var values = [];
          for (var langCode in munimap.lang.Abbr) {
            values.push(munimap.lang.Abbr[langCode]);
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


/**
 * @param {string|undefined} baseMap
 */
munimap.assert.baseMap = function(baseMap) {
  if (baseMap !== undefined) {
    if (goog.isString(baseMap)) {
      var baseMaps = goog.object.getValues(munimap.BaseMaps);
      if (!goog.array.contains(baseMaps, baseMap)) {
        goog.asserts.fail('Parameter baseMap contains unknown value. ' +
            'List of possible values: ' + baseMaps.join(', ') + '.');
      }
    } else {
      goog.asserts.fail('Parameter baseMap should be string.');
    }
  }
};
<<<<<<< HEAD
=======


/**
 * @param {boolean|undefined} pubTran
 */
munimap.assert.pubTran = function(pubTran) {
  if (pubTran !== undefined) {
    goog.asserts.assertBoolean(pubTran,
        'Parameter pubTran should be boolean (true or false).');
  }
};


/**
 * @param {boolean|undefined} mapLinks
 */
munimap.assert.mapLinks = function(mapLinks) {
  if (mapLinks !== undefined) {
    goog.asserts.assertBoolean(mapLinks,
        'Parameter mapLinks should be boolean (true or false).');
  }
};


/**
 * @param {boolean|undefined} locationCodes
 */
munimap.assert.locationCodes = function(locationCodes) {
  if (locationCodes !== undefined) {
    goog.asserts.assertBoolean(locationCodes,
        'Parameter locationCodes should be boolean (true or false).');
  }
};
>>>>>>> bd66799... add switch to munimap.create for showing location codes instead of room numbers
