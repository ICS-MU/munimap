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
ics.map.poi.STORE = new ol.source.Vector({
  loader: goog.partial(
      ics.map.poi.load,
      {
        floorsGetter: ics.map.floor.getActiveFloors
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
ics.map.poi.load = function(options, extent, resolution, projection) {
  var floors = options.floorsGetter();
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
  ics.map.load.featuresForMap(opts, extent, resolution, projection);
};
