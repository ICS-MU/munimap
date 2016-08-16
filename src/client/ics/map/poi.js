goog.provide('ics.map.poi');

goog.require('ics.map.load');
goog.require('ics.map.load.floorBasedActive');
goog.require('ics.map.store');
goog.require('ics.map.type');
goog.require('ol.loadingstrategy');
goog.require('ol.source.Vector');
goog.require('ol.tilegrid.TileGrid');


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.poi.RESOLUTION = ics.map.range.createResolution(0, 1.195);


/**
 * @type {ol.source.Vector}
 * @const
 */
ics.map.poi.STORE = new ol.source.Vector();


/**
 * @type {ics.map.type.Options}
 * @const
 */
ics.map.poi.TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: ics.map.load.MUNIMAP_URL,
  store: ics.map.poi.STORE,
  layerId: 0,
  name: 'poi'
};


/**
 * @enum {string}
 * @const
 */
ics.map.poi.Purpose = {
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
ics.map.poi.ACTIVE_LAYER_ID = 'active-poi';


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
ics.map.poi.createActiveStore = function(map) {
  return new ol.source.Vector({
    loader: goog.partial(ics.map.poi.loadActive, {map: map}),
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
      tileSize: 512
    }))
  });
};


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
ics.map.poi.getActiveLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(ics.map.poi.isActiveLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
ics.map.poi.isActiveLayer = function(layer) {
  return layer.get('id') === ics.map.poi.ACTIVE_LAYER_ID;
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
ics.map.poi.isPoi = function(feature) {
  var type = /**@type {ics.map.type.Options}*/ (feature.get(ics.map.type.NAME));
  return type.name === ics.map.poi.TYPE.name;
};


/**
 * @param {ics.map.load.floorBasedActive.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @this {ol.source.Vector}
 */
ics.map.poi.loadActive = function(options, extent, resolution, projection) {
  var floors = ics.map.floor.getActiveFloors(options.map);
  var entrances = [
    ics.map.poi.Purpose.BUILDING_ENTRANCE,
    ics.map.poi.Purpose.BUILDING_COMPLEX_ENTRANCE,
    ics.map.poi.Purpose.COMPLEX_ENTRANCE
  ];
  var where = 'typ IN (\'' + entrances.join('\', \'') + '\')';
  if (floors.length > 0) {
    var conditions = [];
    floors.forEach(function(floor) {
      conditions.push('polohKodPodlazi LIKE \'' + floor + '%\'');
    });
    where += ' OR ' + conditions.join(' OR ');
  }
  var opts = {
    type: ics.map.poi.TYPE,
    where: where,
    method: 'POST'
  };
  ics.map.load.featuresForMap(opts, extent, resolution, projection).then(
      function(pois) {
        var activeLayer = ics.map.poi.getActiveLayer(options.map);
        var activeStore = activeLayer.getSource();
        //check if active floor has changed
        var poisToAdd =
            ics.map.store.getNotYetAddedFeatures(activeStore, pois);
        activeStore.addFeatures(poisToAdd);
      });
};
