goog.provide('munimap.room.label');
goog.provide('munimap.room.label.big');


/**
 * @type {munimap.Range}
 * @const
 */
munimap.room.label.big.RESOLUTION = munimap.range.createResolution(0, 0.15);


/**
 * @type {string}
 * @const
 */
munimap.room.label.LAYER_ID = 'roomlabel';


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector|undefined}
 */
munimap.room.label.getLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(munimap.room.label.isLayer);
  if (result) {
    goog.asserts.assertInstanceof(result, ol.layer.Vector);
  }
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
munimap.room.label.isLayer = function(layer) {
  return layer.get('id') === munimap.room.label.LAYER_ID;
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
munimap.room.label.getStore = function(map) {
  var layer = munimap.room.label.getLayer(map);
  var result = layer.getSource();
  return result;
};
