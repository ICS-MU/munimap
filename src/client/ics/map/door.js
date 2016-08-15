goog.provide('ics.map.door');
goog.provide('ics.map.door.style');

goog.require('ics.map.floor');
goog.require('ics.map.load');
goog.require('ics.map.load.floorBasedActive');
goog.require('ics.map.store');
goog.require('ics.map.type');
goog.require('ol.loadingstrategy');
goog.require('ol.source.Vector');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');
goog.require('ol.tilegrid.TileGrid');


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.door.RESOLUTION = ics.map.range.createResolution(0, 0.13);


/**
 * @type {ol.source.Vector}
 * @const
 */
ics.map.door.STORE = new ol.source.Vector();


/**
 * @type {ics.map.type.Options}
 * @const
 */
ics.map.door.TYPE = {
  primaryKey: 'pk',
  serviceUrl: ics.map.load.MUNIMAP_URL,
  store: ics.map.door.STORE,
  layerId: 3,
  name: 'door'
};


/**
 * @type {string}
 * @const
 */
ics.map.door.ACTIVE_LAYER_ID = 'active-door';


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
ics.map.door.createActiveStore = function(map) {
  return new ol.source.Vector({
    loader: goog.partial(
        ics.map.door.loadActive,
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
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
ics.map.door.getActiveLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(ics.map.door.isActiveLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
ics.map.door.isActiveLayer = function(layer) {
  return layer.get('id') === ics.map.door.ACTIVE_LAYER_ID;
};


/**
 * @param {ics.map.load.floorBasedActive.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @this {ol.source.Vector}
 */
ics.map.door.loadActive = function(options, extent, resolution, projection) {
  var floors = options.floorsGetter();
  var where;
  if (floors.length > 0) {
    var conditions = [];
    floors.forEach(function(floor) {
      conditions.push('polohKodPodlazi LIKE \'' + floor + '%\'');
    });
    where = conditions.join(' OR ');
    var opts = {
      type: ics.map.door.TYPE,
      where: where,
      method: 'POST'
    };
    ics.map.load.featuresForMap(opts, extent, resolution, projection).then(
        function(doors) {
          var activeLayer = ics.map.door.getActiveLayer(options.map);
          var activeStore = activeLayer.getSource();
          //check if active floor has changed
          var doorsToAdd =
              ics.map.store.getNotYetAddedFeatures(activeStore, doors);
          activeStore.addFeatures(doorsToAdd);
        });
  }
};


/**
 * @type {ol.style.Fill}
 * @protected
 * @const
 */
ics.map.door.style.FILL = new ol.style.Fill({
  color: '#999999'
});


/**
 * @type {ol.style.Stroke}
 * @protected
 * @const
 */
ics.map.door.style.STROKE = new ol.style.Stroke({
  color: '#000000',
  width: 1
});


/**
 * @type {ol.style.Style}
 * @const
 */
ics.map.door.STYLE = new ol.style.Style({
  fill: ics.map.door.style.FILL,
  stroke: ics.map.door.style.STROKE
});
