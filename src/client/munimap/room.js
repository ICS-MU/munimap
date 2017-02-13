goog.provide('munimap.room');

goog.require('assert');
goog.require('munimap.floor');
goog.require('munimap.lang');
goog.require('munimap.load');
goog.require('munimap.load.floorBasedActive');
goog.require('munimap.store');
goog.require('munimap.type');


/**
 * @type {RegExp}
 * @protected
 */
munimap.room.CODE_REGEX = /^[A-Z]{3}[0-9]{2}[N,M,P,S,Z]{1}[0-9]{5}[a-z]?$/gi;


/**
 * @type {RegExp}
 * @protected
 */
munimap.room.LIKE_EXPR_REGEX =
    /^[A-Z_]{3}[0-9_]{2}[NMPSZ_]{1}[0-9_]{5}[a-z_]?$/gi;


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.room.STORE = new ol.source.Vector();


/**
 * @type {munimap.type.Options}
 * @const
 */
munimap.room.TYPE = {
  primaryKey: 'polohKod',
  serviceUrl: munimap.load.MUNIMAP_URL,
  store: munimap.room.STORE,
  layerId: 1,
  name: 'room'
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
munimap.room.createActiveStore = function(map) {
  return new ol.source.Vector({
    loader: goog.partial(munimap.room.loadActive, {map: map}),
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
      tileSize: 512
    }))
  });
};


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.room.DEFAULT_STORE = new ol.source.Vector({
  loader: goog.partial(
      munimap.room.loadDefault,
      {
        type: munimap.room.TYPE,
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
munimap.room.DEFAULT_LAYER_ID = 'room';


/**
 * @type {string}
 * @const
 */
munimap.room.ACTIVE_LAYER_ID = 'active-room';


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector|undefined}
 */
munimap.room.getDefaultLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(munimap.room.isDefaultLayer);
  if (result) {
    goog.asserts.assertInstanceof(result, ol.layer.Vector);
  }
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
munimap.room.isDefaultLayer = function(layer) {
  return layer.get('id') === munimap.room.DEFAULT_LAYER_ID;
};


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector|undefined}
 */
munimap.room.getActiveLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(munimap.room.isActiveLayer);
  if (result) {
    goog.asserts.assertInstanceof(result, ol.layer.Vector);
  }
  return result;
};


/**
 *
 * @param {ol.Map} map
 * @return {ol.source.Vector|undefined}
 */
munimap.room.getActiveStore = function(map) {
  var layer = munimap.room.getActiveLayer(map) ||
      munimap.room.label.getLayer(map);
  var result;
  if (layer) {
    result = layer.getSource();
  }
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
munimap.room.isActiveLayer = function(layer) {
  return layer.get('id') === munimap.room.ACTIVE_LAYER_ID;
};


/**
 * @param {string} code
 */
munimap.room.assertCode = function(code) {
  assert(!!munimap.room.isCode(code),
      'Location code of room should consist of 3 letters and 2 digits, ' +
      'one of the letters \'N\', \'M\', \'P\', \'S\' or \'Z\' ' +
      'followed by 5 digits, and optionally 1 letter.');
};


/**
 * @param {ol.Feature} feature
 */
munimap.room.assertRoom = function(feature) {
  goog.asserts.assert(!!munimap.room.isRoom(feature),
      'Feature does not have value of room\'s primary key.');
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.room.isRoom = function(feature) {
  var code = feature.get('polohKod');
  return goog.isString(code) && munimap.room.isCode(code);
};


/**
 * @param {string} maybeCode
 * @return {boolean}
 */
munimap.room.isCode = function(maybeCode) {
  return !!maybeCode.match(munimap.room.CODE_REGEX);
};


/**
 * @param {string} maybeLikeExpr
 * @return {boolean}
 */
munimap.room.isLikeExpr = function(maybeLikeExpr) {
  return !!maybeLikeExpr.match(munimap.room.LIKE_EXPR_REGEX) &&
      maybeLikeExpr.indexOf('_') >= 0;
};


/**
 * @param {string} maybeCodeOrLikeExpr
 * @return {boolean}
 */
munimap.room.isCodeOrLikeExpr = function(maybeCodeOrLikeExpr) {
  return munimap.room.isCode(maybeCodeOrLikeExpr) ||
      munimap.room.isLikeExpr(maybeCodeOrLikeExpr);
};


/**
 * @param {string} code
 */
munimap.room.assertCodeOrLikeExpr = function(code) {
  assert(!!code.match(munimap.room.LIKE_EXPR_REGEX),
      'Location code of building should consist of 3 letters and 2 digits, ' +
      'one of the letters \'N\', \'M\', \'P\', \'S\' or \'Z\' ' +
      'followed by 5 digits, and optionally 1 letter. ' +
      'Any of these characters might be replaced with _ wildcard.');
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 * @return {boolean}
 */
munimap.room.isClickable = function(options) {
  var feature = options.feature;
  var map = options.map;

  return !munimap.room.isInActiveFloor(feature, map);
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 */
munimap.room.featureClickHandler = function(options) {
  var feature = options.feature;
  var map = options.map;

  munimap.changeFloor(map, feature);
  munimap.info.refreshVisibility(map);
};


/**
 * @param {ol.Feature} feature
 * @return {string|undefined}
 */
munimap.room.getDefaultLabel = function(feature) {
  return munimap.room.getNamePart(feature);
};


/**
 * @param {ol.Feature} feature
 * @return {string|undefined}
 * @protected
 */
munimap.room.getNamePart = function(feature) {
  var title;
  var fTitle = feature.get(munimap.lang.getMsg(
      munimap.lang.Translations.ROOM_TITLE_FIELD_NAME));
  var fNumber = feature.get('cislo');
  if (fTitle || fNumber) {
    if (fTitle) {
      title = goog.asserts.assertString(fTitle);
      title = munimap.room.style.alignRoomTitleToRows(title);
      if (fNumber) {
        var re =
            new RegExp('(^| )' + fNumber.toLowerCase() + '( |$)', 'g');
        if (!re.test(fTitle.toLowerCase())) {
          title = fNumber + '\n' + title;
        }
      }
    } else {
      title = goog.asserts.assertString(fNumber);
    }
  }
  return title || undefined;
};


/**
 * @param {ol.Feature} room
 * @param {ol.Map} map
 * @return {boolean}
 */
munimap.room.isInActiveFloor = function(room, map) {
  goog.asserts.assert(munimap.room.isRoom(room));
  var locCode = /**@type {string}*/(room.get('polohKod'));
  var selectedFloor = munimap.getProps(map).selectedFloor;
  return !!selectedFloor && locCode.startsWith(selectedFloor.locationCode);
};


/**
 * @param {munimap.load.floorBasedActive.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @this {ol.source.Vector}
 */
munimap.room.loadActive = function(options, extent, resolution, projection) {
  var floors = munimap.floor.getActiveFloors(options.map);
  var where;
  if (floors.length > 0) {
    var conditions = [];
    floors.forEach(function(floor) {
      conditions.push('polohKod LIKE \'' + floor + '%\'');
    });
    where = conditions.join(' OR ');
    var opts = {
      type: munimap.room.TYPE,
      where: where,
      method: 'POST'
    };
    munimap.load.featuresForMap(opts, extent, resolution, projection).then(
        function(rooms) {
          var activeStore = munimap.room.getActiveStore(options.map);
          goog.asserts.assertInstanceof(activeStore, ol.source.Vector);
          //check if active floor has changed
          var roomsToAdd =
              munimap.store.getNotYetAddedFeatures(activeStore, rooms);
          activeStore.addFeatures(roomsToAdd);
        });
  }
};


/**
 * @param {munimap.load.featuresForMap.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @this {ol.source.Vector}
 */
munimap.room.loadDefault = function(options, extent, resolution, projection) {
  munimap.load.featuresForMap(options, extent, resolution, projection).then(
      function(rooms) {
        var roomsToAdd = munimap.store.getNotYetAddedFeatures(
            munimap.room.DEFAULT_STORE, rooms);
        munimap.room.DEFAULT_STORE.addFeatures(roomsToAdd);
      });
};
