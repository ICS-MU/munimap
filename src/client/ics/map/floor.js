goog.provide('ics.map.floor');

goog.require('ics.map.load');
goog.require('ics.map.range');


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.floor.RESOLUTION = ics.map.range.createResolution(0, 0.3);


/**
 * @typedef {{
 *   locationCode: (string),
 *   floorLayerId: (number)
 * }}
 */
ics.map.floor.Options;


/**
 * @type {ol.source.Vector}
 * @const
 */
ics.map.floor.STORE = new ol.source.Vector();


/**
 * @type {ics.map.type.Options}
 * @const
 */
ics.map.floor.TYPE = {
  primaryKey: 'polohKod',
  serviceUrl: ics.map.load.MUNIMAP_URL,
  store: ics.map.floor.STORE,
  layerId: 5,
  name: 'floor'
};


/**
 * @param {ol.Map} map
 * @return {Array.<string>}
 */
ics.map.floor.getActiveFloors = function(map) {
  var codes = [];
  var activeFloor = ics.map.getVars(map).activeFloor;
  if (activeFloor) {
    var floors = ics.map.floor.STORE.getFeatures();
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
ics.map.floor.refreshFloorBasedLayers = function(map) {
  var activeRoomLayer = ics.map.room.getActiveLayer(map);
  var activeRoomStore = activeRoomLayer.getSource();
  activeRoomStore.clear();
  var rooms = ics.map.room.getDefaultLayer(map);
  rooms.changed();

  var activeDoorLayer = ics.map.door.getActiveLayer(map);
  var activeDoorStore = activeDoorLayer.getSource();
  activeDoorStore.clear();

  var activePoiLayer = ics.map.poi.getActiveLayer(map);
  var activePoiStore = activePoiLayer.getSource();
  activePoiStore.clear();

  var markers = ics.map.marker.getLayer(map);
  markers.changed();
};


/**
 *
 * @param {string} where
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
ics.map.floor.loadFloors = function(where) {
  return ics.map.load.features({
    source: ics.map.floor.STORE,
    type: ics.map.floor.TYPE,
    returnGeometry: false,
    where: where
  });
};


/**
 * @param {ol.Feature} a
 * @param {ol.Feature} b
 * @return {number}
 */
ics.map.floor.sort = function(a, b) {
  var aCode = /**@type (string)*/ (a.get('polohKod'));
  var bCode = /**@type (string)*/ (b.get('polohKod'));
  return ics.map.floor.compareCodesByAltitude(aCode, bCode);
};


/**
 * @param {ol.Feature} feature
 * @return {?ics.map.floor.Options} floor
 */
ics.map.floor.getFloorObject = function(feature) {
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
ics.map.floor.TYPES = {
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
ics.map.floor.getOrderId = function(floorCode) {
  var prefix = floorCode.length > 3 ? 5 : 0;
  var letter = floorCode[prefix + 0];
  var num = parseInt(floorCode.substr(prefix + 1), 10);
  var types = ics.map.floor.TYPES;

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
ics.map.floor.compareCodesByAltitude = function(a, b) {
  return ics.map.floor.getOrderId(a) - ics.map.floor.getOrderId(b);
};
