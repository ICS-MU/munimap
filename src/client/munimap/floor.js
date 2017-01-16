goog.provide('munimap.floor');

goog.require('munimap.load');
goog.require('munimap.range');


/**
 * @type {munimap.Range}
 * @const
 */
munimap.floor.RESOLUTION = munimap.range.createResolution(0, 0.3);


/**
 * @typedef {{
 *   locationCode: (string),
 *   floorLayerId: (number)
 * }}
 */
munimap.floor.Options;


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.floor.STORE = new ol.source.Vector();


/**
 * @type {munimap.type.Options}
 * @const
 */
munimap.floor.TYPE = {
  primaryKey: 'polohKod',
  serviceUrl: munimap.load.MUNIMAP_URL,
  store: munimap.floor.STORE,
  layerId: 5,
  name: 'floor'
};


/**
 * @param {ol.Map} map
 * @return {Array.<string>}
 */
munimap.floor.getActiveFloors = function(map) {
  var codes = [];
  var activeFloor = munimap.getProps(map).activeFloor;
  if (activeFloor) {
    var floors = munimap.floor.STORE.getFeatures();
    var active = floors.filter(function(floor) {
      var layerId = /**@type {number}*/ (floor.get('vrstvaId'));
      if (layerId === activeFloor.floorLayerId) {
        return true;
      }
      return false;
    });
    codes = active.map(function(floor) {
      return /**@type {string}*/ (floor.get('polohKod'));
    });
  }
  return codes;
};


/**
 * @param {ol.Map} map
 */
munimap.floor.refreshFloorBasedLayers = function(map) {
  var activeRoomLayer = munimap.room.getActiveLayer(map);
  var activeRoomStore = activeRoomLayer.getSource();
  activeRoomStore.clear();
  var rooms = munimap.room.getDefaultLayer(map);
  rooms.changed();

  var activeDoorLayer = munimap.door.getActiveLayer(map);
  var activeDoorStore = activeDoorLayer.getSource();
  activeDoorStore.clear();

  var activePoiLayer = munimap.poi.getActiveLayer(map);
  var activePoiStore = activePoiLayer.getSource();
  activePoiStore.clear();

  var markers = munimap.marker.getLayer(map);
  markers.changed();
};


/**
 *
 * @param {string} where
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
munimap.floor.loadFloors = function(where) {
  return munimap.load.features({
    source: munimap.floor.STORE,
    type: munimap.floor.TYPE,
    returnGeometry: false,
    where: where
  });
};


/**
 * @param {ol.Feature} a
 * @param {ol.Feature} b
 * @return {number}
 */
munimap.floor.sort = function(a, b) {
  var aCode = /**@type (string)*/ (a.get('polohKod'));
  var bCode = /**@type (string)*/ (b.get('polohKod'));
  return munimap.floor.compareCodesByAltitude(aCode, bCode);
};


/**
 * @param {ol.Feature} feature
 * @return {?munimap.floor.Options} floor
 */
munimap.floor.getFloorObject = function(feature) {
  if (feature) {
    var floorObj = {
      locationCode: /**@type {string}*/ (feature.get('polohKod')),
      floorLayerId: /**@type {number}*/ (feature.get('vrstvaId'))
    };
    return floorObj;
  }
  return null;
};


/**
 * Floor types.
 * @enum {string}
 * @protected
 */
munimap.floor.TYPES = {
  UNDERGROUND: 'P',
  UNDERGROUND_MEZZANINE: 'Z',
  ABOVEGROUND: 'N',
  MEZZANINE: 'M'
};


/**
 * Return ID for ordering.
 * @param {string} floorCode floor code (full or 3-character).
 * @return {number} ID for ordering.
 * @protected
 */
munimap.floor.getOrderId = function(floorCode) {
  var prefix = floorCode.length > 3 ? 5 : 0;
  var letter = floorCode[prefix + 0];
  var num = parseInt(floorCode.substr(prefix + 1), 10);
  var types = munimap.floor.TYPES;

  switch (letter) {
    case types.UNDERGROUND:
      num = num * -2;
      break;
    case types.UNDERGROUND_MEZZANINE:
      num = num * -2 + 1;
      break;
    case types.ABOVEGROUND:
      num = (num - 1) * 2;
      break;
    case types.MEZZANINE:
      num = (num - 1) * 2 + 1;
      break;
  }
  return num;
};


/**
 * Compare two floor codes by altitute, from lowest to highest.
 * @param {string} a floor code.
 * @param {string} b floor code.
 * @return {number}
 */
munimap.floor.compareCodesByAltitude = function(a, b) {
  return munimap.floor.getOrderId(a) - munimap.floor.getOrderId(b);
};
