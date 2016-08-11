goog.provide('ics.map.room.label');
goog.provide('ics.map.room.label.big');


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.room.label.big.RESOLUTION = ics.map.range.createResolution(0, 0.15);


/**
 * @type {string}
 * @const
 */
ics.map.room.label.LAYER_ID = 'roomlabel';


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
ics.map.room.label.getLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(ics.map.room.label.isLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
ics.map.room.label.isLayer = function(layer) {
  return layer.get('id') === ics.map.room.label.LAYER_ID;
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
ics.map.room.label.getStore = function(map) {
  var layer = ics.map.room.label.getLayer(map);
  var result = layer.getSource();
  return result;
};
