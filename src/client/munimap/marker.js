goog.provide('munimap.marker');

goog.require('munimap.range');
goog.require('munimap.style');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Style');


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


