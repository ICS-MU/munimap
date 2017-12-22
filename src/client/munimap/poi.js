goog.provide('munimap.poi');

goog.require('munimap.feature');
goog.require('munimap.load');
goog.require('munimap.load.floorBasedActive');
goog.require('munimap.map');
goog.require('munimap.store');
goog.require('munimap.type');


/**
 * @type {munimap.Range}
 * @const
 */
munimap.poi.RESOLUTION = munimap.range.createResolution(0, 1.195);


/**
 * @type {ol.source.Vector}
 * @const
 * @protected
 */
munimap.poi.STORE = new ol.source.Vector();


/**
 * @type {munimap.type.Options}
 * @const
 */
munimap.poi.TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: munimap.load.MUNIMAP_URL,
  store: munimap.poi.STORE,
  layerId: 0,
  name: 'poi'
};


/**
 * @enum {string}
 * @const
 */
munimap.poi.Purpose = {
  INFORMATION_POINT: 'informace',
  BUILDING_ENTRANCE: 'vstup do budovy',
  BUILDING_COMPLEX_ENTRANCE: 'vstup do areálu a budovy',
  COMPLEX_ENTRANCE: 'vstup do areálu',
  ELEVATOR: 'výtah',
  CLASSROOM: 'učebna',
  TOILET: 'WC',
  TOILET_IMMOBILE: 'WC invalidé',
  TOILET_MEN: 'WC muži',
  TOILET_WOMEN: 'WC ženy'
};


/**
 * @type {string}
 * @const
 */
munimap.poi.ACTIVE_LAYER_ID = 'active-poi';


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
munimap.poi.createActiveStore = function(map) {
  return new ol.source.Vector({
    loader: goog.partial(munimap.poi.loadActive, { map: map }),
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
munimap.poi.getActiveLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(munimap.poi.isActiveLayer);
  if (result) {
    goog.asserts.assertInstanceof(result, ol.layer.Vector);
  }
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
munimap.poi.isActiveLayer = function(layer) {
  return layer.get('id') === munimap.poi.ACTIVE_LAYER_ID;
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.poi.isPoi = function(feature) {
  var type = /**@type {munimap.type.Options}*/ (feature.get(munimap.type.NAME));
  return type === munimap.poi.TYPE;
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 * @return {boolean}
 */
munimap.poi.isClickable = function(options) {
  var feature = options.feature;
  var resolution = options.resolution;

  if (!munimap.range.contains(munimap.floor.RESOLUTION, resolution)) {
    var poiType = feature.get('typ');
    return poiType === munimap.poi.Purpose.BUILDING_ENTRANCE ||
      poiType === munimap.poi.Purpose.BUILDING_COMPLEX_ENTRANCE;
  }
  return false;
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} poi
 * @return {boolean}
 * @protected
 */
munimap.poi.isInActiveFloor = function(map, poi) {
  goog.asserts.assert(munimap.poi.isPoi(poi));
  var floorCode = /**@type {string}*/(poi.get('polohKodPodlazi'));
  var activeFloors = munimap.floor.getActiveFloors(map);
  return goog.array.contains(activeFloors, floorCode);
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 */
munimap.poi.featureClickHandler = function(options) {
  var feature = options.feature;
  var map = options.map;
  var resolution = options.resolution;

  var isVisible =
    munimap.range.contains(munimap.floor.RESOLUTION, resolution);
  if (!isVisible) {
    var point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
    var coors = point.getCoordinates();
    munimap.map.zoomToPoint(map, coors, munimap.floor.RESOLUTION.max);
  }
  munimap.changeFloor(map, feature);
  if (isVisible) {
    munimap.info.refreshVisibility(map);
  }
};


/**
 * @param {munimap.load.floorBasedActive.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @this {ol.source.Vector}
 */
munimap.poi.loadActive = function(options, extent, resolution, projection) {
  var floors = munimap.floor.getActiveFloors(options.map);
  var entrances = [
    munimap.poi.Purpose.BUILDING_ENTRANCE,
    munimap.poi.Purpose.BUILDING_COMPLEX_ENTRANCE,
    munimap.poi.Purpose.COMPLEX_ENTRANCE
  ];
  var where = 'typ IN (\'' + entrances.join('\', \'') + '\')';
  if (floors.length > 0) {
    var conditions = [];
    floors.forEach(function(floor) {
      conditions.push('polohKodPodlazi LIKE \'' + floor + '%\'');
    });
    where += ' OR ' + conditions.join(' OR ');
  }
  where = '(' + where + ') AND volitelny = 0';
  var opts = {
    type: munimap.poi.TYPE,
    where: where,
    method: 'POST'
  };
  munimap.load.featuresForMap(opts, extent, resolution, projection).then(
    function(pois) {
      var activeLayer = munimap.poi.getActiveLayer(options.map);
      var activeStore = activeLayer.getSource();
      var poisFromActiveFloor = goog.array.filter(pois,
        goog.partial(munimap.poi.isInActiveFloor, options.map));
      var poisToAdd = munimap.store.getNotYetAddedFeatures(activeStore,
        poisFromActiveFloor);
      activeStore.addFeatures(poisToAdd);
    });
};
