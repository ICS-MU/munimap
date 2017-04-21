goog.provide('munimap.door');
goog.provide('munimap.door.style');

goog.require('munimap.floor');
goog.require('munimap.load');
goog.require('munimap.load.floorBasedActive');
goog.require('munimap.store');
goog.require('munimap.type');


/**
 * @type {RegExp}
 * @protected
 */
munimap.door.CODE_REGEX =
    /^[A-Z]{3}[0-9]{2}[NMPSZ]{1}[0-9]{2}[D]{1}[0-9]{3}?$/gi;


/**
 * @type {RegExp}
 * @protected
 */
munimap.door.LIKE_EXPR_REGEX =
    /^[A-Z_]{3}[0-9_]{2}[NMPSZ_]{1}[0-9_]{2}[D_]{1}[0-9_]{3}?$/gi;


/**
 * @type {munimap.Range}
 * @const
 */
munimap.door.RESOLUTION = munimap.range.createResolution(0, 0.13);


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.door.STORE = new ol.source.Vector();


/**
 * @type {munimap.type.Options}
 * @const
 */
munimap.door.TYPE = {
  primaryKey: 'pk',
  serviceUrl: munimap.load.MUNIMAP_URL,
  store: munimap.door.STORE,
  layerId: 3,
  name: 'door'
};


/**
 * @type {string}
 * @const
 */
munimap.door.ACTIVE_LAYER_ID = 'active-door';


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
munimap.door.createActiveStore = function(map) {
  return new ol.source.Vector({
    loader: goog.partial(munimap.door.loadActive, {map: map}),
    strategy: /** @type {ol.LoadingStrategy} */(
        ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
          tileSize: 512
        })))
  });
};


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector|undefined}
 */
munimap.door.getActiveLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(munimap.door.isActiveLayer);
  if (result) {
    goog.asserts.assertInstanceof(result, ol.layer.Vector);
  }
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
munimap.door.isActiveLayer = function(layer) {
  return layer.get('id') === munimap.door.ACTIVE_LAYER_ID;
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.door.isDoor = function(feature) {
  var code = feature.get('polohKod');
  return goog.isString(code) && munimap.door.isCode(code);
};


/**
 * @param {string} maybeCode
 * @return {boolean}
 */
munimap.door.isCode = function(maybeCode) {
  return !!maybeCode.match(munimap.door.CODE_REGEX);
};


/**
 * @param {string} maybeLikeExpr
 * @return {boolean}
 */
munimap.door.isLikeExpr = function(maybeLikeExpr) {
  return !!maybeLikeExpr.match(munimap.door.LIKE_EXPR_REGEX) &&
      maybeLikeExpr.indexOf('_') >= 0;
};


/**
 * @param {string} maybeCodeOrLikeExpr
 * @return {boolean}
 */
munimap.door.isCodeOrLikeExpr = function(maybeCodeOrLikeExpr) {
  return munimap.door.isCode(maybeCodeOrLikeExpr) ||
      munimap.door.isLikeExpr(maybeCodeOrLikeExpr);
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} door
 * @return {boolean}
 * @protected
 */
munimap.door.isInActiveFloor = function(map, door) {
  goog.asserts.assert(munimap.door.isDoor(door));
  var floorCode = /**@type {string}*/(door.get('polohKodPodlazi'));
  var activeFloors = munimap.floor.getActiveFloors(map);
  return goog.array.contains(activeFloors, floorCode);
};


/**
 * @param {munimap.load.floorBasedActive.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @this {ol.source.Vector}
 */
munimap.door.loadActive = function(options, extent, resolution, projection) {
  var floors = munimap.floor.getActiveFloors(options.map);
  var where;
  if (floors.length > 0) {
    var conditions = [];
    floors.forEach(function(floor) {
      conditions.push('polohKodPodlazi LIKE \'' + floor + '%\'');
    });
    where = conditions.join(' OR ');
    var opts = {
      type: munimap.door.TYPE,
      where: where,
      method: 'POST'
    };
    munimap.load.featuresForMap(opts, extent, resolution, projection).then(
        function(doors) {
          var activeLayer = munimap.door.getActiveLayer(options.map);
          var activeStore = activeLayer.getSource();
          var doorsFromActiveFloor = goog.array.filter(doors,
              goog.partial(munimap.door.isInActiveFloor, options.map));
          var doorsToAdd = munimap.store.getNotYetAddedFeatures(
              activeStore, doorsFromActiveFloor);
          activeStore.addFeatures(doorsToAdd);
        });
  }
};


/**
 * @type {ol.style.Fill}
 * @protected
 * @const
 */
munimap.door.style.FILL = new ol.style.Fill({
  color: '#999999'
});


/**
 * @type {ol.style.Stroke}
 * @protected
 * @const
 */
munimap.door.style.STROKE = new ol.style.Stroke({
  color: '#000000',
  width: 1
});


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.door.STYLE = new ol.style.Style({
  fill: munimap.door.style.FILL,
  stroke: munimap.door.style.STROKE
});
