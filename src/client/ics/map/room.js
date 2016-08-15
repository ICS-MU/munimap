goog.provide('ics.map.room');

goog.require('ics.map.floor');
goog.require('ics.map.load');
goog.require('ics.map.load.floorBasedActive');
goog.require('ics.map.store');
goog.require('ics.map.type');
goog.require('ol.loadingstrategy');
goog.require('ol.source.Vector');
goog.require('ol.tilegrid.TileGrid');


/**
 * @type {RegExp}
 * @protected
 */
ics.map.room.CODE_REGEX = /^[A-Z]{3}[0-9]{2}[N,M,P,S,Z]{1}[0-9]{5}[a-z]?$/gi;


/**
 * @type {RegExp}
 * @protected
 */
ics.map.room.LIKE_EXPR_REGEX =
    /^[A-Z_]{3}[0-9_]{2}[NMPSZ_]{1}[0-9_]{5}[a-z_]?$/gi;


/**
 * @type {ol.source.Vector}
 * @const
 */
ics.map.room.STORE = new ol.source.Vector({
  loader: goog.partial(
      ics.map.load.featuresForMap,
      {
        type: function() {
          return ics.map.room.TYPE;
        }
      }
  ),
  strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
    tileSize: 512
  }))
});


/**
 * @type {ics.map.type.Options}
 * @const
 */
ics.map.room.TYPE = {
  primaryKey: 'polohKod',
  serviceUrl: ics.map.load.MUNIMAP_URL,
  store: ics.map.room.STORE,
  layerId: 1,
  name: 'room'
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
ics.map.room.createActiveStore = function(map) {
  return new ol.source.Vector({
    loader: goog.partial(
        ics.map.room.loadActive,
        {
          floorsGetter: ics.map.floor.getActiveFloors,
          map: map
        }
    ),
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
      tileSize: 512
    }))
  });
};


/**
 * @type {ol.source.Vector}
 * @const
 */
ics.map.room.DEFAULT_STORE = new ol.source.Vector({
  loader: goog.partial(
      ics.map.room.loadDefault,
      {
        type: ics.map.room.TYPE,
        where: 'vychoziPodlazi = 1'
      }
  ),
  strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
    tileSize: 512
  }))
});


/**
 * @type {string}
 * @const
 */
ics.map.room.DEFAULT_LAYER_ID = 'room';


/**
 * @type {string}
 * @const
 */
ics.map.room.ACTIVE_LAYER_ID = 'active-room';


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
ics.map.room.getDefaultLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(ics.map.room.isDefaultLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
ics.map.room.isDefaultLayer = function(layer) {
  return layer.get('id') === ics.map.room.DEFAULT_LAYER_ID;
};


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
ics.map.room.getActiveLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(ics.map.room.isActiveLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
ics.map.room.isActiveLayer = function(layer) {
  return layer.get('id') === ics.map.room.ACTIVE_LAYER_ID;
};


/**
 * @param {string} code
 */
ics.map.room.assertCode = function(code) {
  goog.asserts.assert(!!ics.map.room.isCode(code),
      'Location code of room should consist of 3 letters and 2 digits, ' +
      'one of the letters \'N\', \'M\', \'P\', \'S\' or \'Z\' ' +
      'followed by 5 digits, and optionally 1 letter.');
};


/**
 * @param {ol.Feature} feature
 */
ics.map.room.assertRoom = function(feature) {
  goog.asserts.assert(!!ics.map.room.isRoom(feature),
      'Feature does not have value of room\'s primary key.');
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
ics.map.room.isRoom = function(feature) {
  var code = feature.get('polohKod');
  return goog.isString(code) && ics.map.room.isCode(code);
};


/**
 * @param {string} maybeCode
 * @return {boolean}
 */
ics.map.room.isCode = function(maybeCode) {
  return !!maybeCode.match(ics.map.room.CODE_REGEX);
};


/**
 * @param {string} maybeLikeExpr
 * @return {boolean}
 */
ics.map.room.isLikeExpr = function(maybeLikeExpr) {
  return !!maybeLikeExpr.match(ics.map.room.LIKE_EXPR_REGEX) &&
      maybeLikeExpr.indexOf('_') >= 0;
};


/**
 * @param {string} maybeCodeOrLikeExpr
 * @return {boolean}
 */
ics.map.room.isCodeOrLikeExpr = function(maybeCodeOrLikeExpr) {
  return ics.map.room.isCode(maybeCodeOrLikeExpr) ||
      ics.map.room.isLikeExpr(maybeCodeOrLikeExpr);
};


/**
 * @param {string} code
 */
ics.map.room.assertCodeOrLikeExpr = function(code) {
  goog.asserts.assert(!!code.match(ics.map.room.LIKE_EXPR_REGEX),
      'Location code of building should consist of 3 letters and 2 digits, ' +
      'one of the letters \'N\', \'M\', \'P\', \'S\' or \'Z\' ' +
      'followed by 5 digits, and optionally 1 letter. ' +
      'Any of these characters might be replaced with _ wildcard.');
};


/**
 * @param {ol.Feature} room
 * @return {boolean}
 */
ics.map.room.isInActiveFloor = function(room) {
  ics.map.room.assertRoom(room);
  var locCode = /**@type {string}*/(room.get('polohKod'));
  return !!ics.map.floor.active &&
      locCode.startsWith(ics.map.floor.active.locationCode);
};


/**
 *
 * @param {ol.source.Vector} store
 * @param {Array.<ol.Feature>} features
 * @return {Array.<ol.Feature>}
 * @protected
 */
ics.map.room.getNotYetAddedRooms = function(store, features) {
  var storedFeatures = store.getFeatures();
  return features.filter(function(feature) {
    return storedFeatures.indexOf(feature) === -1;
  });
};


/**
 * @param {ics.map.load.floorBasedActive.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @this {ol.source.Vector}
 */
ics.map.room.loadActive = function(options, extent, resolution, projection) {
  var floors = options.floorsGetter();
  var where;
  if (floors.length > 0) {
    var conditions = [];
    floors.forEach(function(floor) {
      conditions.push('polohKod LIKE \'' + floor + '%\'');
    });
    where = conditions.join(' OR ');
    var opts = {
      type: ics.map.room.TYPE,
      where: where,
      method: 'POST'
    };
    ics.map.load.featuresForMap(opts, extent, resolution, projection).then(
        function(rooms) {
          var activeLayer = ics.map.room.getActiveLayer(options.map);
          var activeStore = activeLayer.getSource();
          //check if active floor has changed
          var roomsToAdd =
              ics.map.room.getNotYetAddedRooms(activeStore, rooms);
          activeStore.addFeatures(roomsToAdd);
        });
  }
};


/**
 * @param {ics.map.load.featuresForMap.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @this {ol.source.Vector}
 */
ics.map.room.loadDefault = function(options, extent, resolution, projection) {
  ics.map.load.featuresForMap(options, extent, resolution, projection).then(
      function(rooms) {
        var roomsToAdd =
            ics.map.room.getNotYetAddedRooms(ics.map.room.DEFAULT_STORE, rooms);
        ics.map.room.DEFAULT_STORE.addFeatures(roomsToAdd);
      });
};
