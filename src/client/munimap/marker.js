goog.provide('munimap.marker');
goog.provide('munimap.marker.custom');

goog.require('assert');
goog.require('munimap.range');
goog.require('munimap.style');


/**
 * @type {munimap.Range}
 * @const
 */
munimap.marker.RESOLUTION = munimap.range.createResolution(0, 2.39);


/**
 * @type {string}
 * @const
 */
munimap.marker.LAYER_ID = 'marker';


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
munimap.marker.getLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(munimap.marker.isLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
munimap.marker.isLayer = function(layer) {
  return layer.get('id') === munimap.marker.LAYER_ID;
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
munimap.marker.getStore = function(map) {
  var layer = munimap.marker.getLayer(map);
  var result = layer.getSource();
  return result;
};


/**
 * @param {ol.Map} map
 * @return {Array.<ol.Feature>}
 */
munimap.marker.getFeatures = function(map) {
  var store = munimap.marker.getStore(map);
  return store.getFeatures();
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.marker.isMarker = function(map, feature) {
  var result = munimap.marker.getFeatures(map).indexOf(feature) >= 0;
  return result;
};




/**
 * @type {munimap.type.SimpleOptions}
 * @const
 */
munimap.marker.custom.TYPE = {
  name: 'custom-marker'
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.marker.custom.isCustom = function(feature) {
  var fType = feature.get(munimap.type.NAME);
  return fType === munimap.marker.custom.TYPE;
};


/**
 * True if the feature is suitable to become custom marker.
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.marker.custom.isSuitable = function(feature) {
  var geom = feature.getGeometry();
  return geom instanceof ol.geom.Point;
};


/**
 * True if the feature is suitable to become custom marker.
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.marker.custom.assertSuitable = function(feature) {
  return assert(munimap.marker.custom.isSuitable(feature),
      'Custom marker represented by ol.Feature must have ol.Point geometry');
};


/**
 * Decorate feature to become custom marker. Should be called only if
 * munimap.marker.custom.isSuitable returned true.
 * @param {ol.Feature} feature
 */
munimap.marker.custom.decorate = function(feature) {
  feature.set(munimap.type.NAME, munimap.marker.custom.TYPE);
};


