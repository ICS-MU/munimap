goog.provide('ics.map.marker');

goog.require('ics.map.range');
goog.require('ics.map.style');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Style');


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.marker.RESOLUTION = ics.map.range.createResolution(0, 2.39);


/**
 * @type {string}
 * @const
 */
ics.map.marker.LAYER_ID = 'marker';


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
ics.map.marker.getLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(ics.map.marker.isLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
ics.map.marker.isLayer = function(layer) {
  return layer.get('id') === ics.map.marker.LAYER_ID;
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
ics.map.marker.getStore = function(map) {
  var layer = ics.map.marker.getLayer(map);
  var result = layer.getSource();
  return result;
};


/**
 * @param {ol.Map} map
 * @return {Array.<ol.Feature>}
 */
ics.map.marker.getFeatures = function(map) {
  var store = ics.map.marker.getStore(map);
  return store.getFeatures();
};
