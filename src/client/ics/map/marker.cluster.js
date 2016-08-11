goog.provide('ics.map.marker.cluster');
goog.provide('ics.map.marker.cluster.style');

goog.require('goog.array');


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.marker.cluster.ROOM_RESOLUTION =
    ics.map.range.createResolution(1.19, Number.POSITIVE_INFINITY);


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.marker.cluster.BUILDING_RESOLUTION =
    ics.map.range.createResolution(8.5, Number.POSITIVE_INFINITY);


/**
 * @type {string}
 * @const
 */
ics.map.marker.cluster.LAYER_ID = 'markercluster';


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
ics.map.marker.cluster.getLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(ics.map.marker.cluster.isLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
ics.map.marker.cluster.isLayer = function(layer) {
  return layer.get('id') === ics.map.marker.cluster.LAYER_ID;
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
ics.map.marker.cluster.getStore = function(map) {
  var layer = ics.map.marker.cluster.getLayer(map);
  var result = layer.getSource();
  return result;
};


/**
 * @type {number}
 * @protected
 * @const
 */
ics.map.marker.cluster.style.RADIUS = 12;


/**
 * @type {ol.style.Style}
 * @protected
 * @const
 */
ics.map.marker.cluster.style.MULTIPLE = new ol.style.Style({
  image: new ol.style.Circle({
    radius: ics.map.marker.cluster.style.RADIUS,
    fill: ics.map.marker.style.FILL,
    stroke: new ol.style.Stroke({
      color: '#ffffff',
      width: 2
    })
  })
});


/**
 * @param {ics.map.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return ol.style.Style|Array.<ol.style.Style>
 */
ics.map.marker.cluster.style.function = function(options, feature, resolution) {
  var features = feature.get('features');
  goog.asserts.assertArray(features);
  var result;
  if (features.length > 1) {
    result = [
      ics.map.marker.cluster.style.labelFunction(options, feature, resolution),
      ics.map.marker.cluster.style.MULTIPLE
    ];
  } else {
    result =
        ics.map.marker.style.labelFunction(options, feature, resolution);
  }
  return result;
};


/**
 * @param {ics.map.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return ol.style.Style
 */
ics.map.marker.cluster.style.labelFunction =
    function(options, feature, resolution) {
  var title;
  if (goog.isDef(options.markerLabel)) {
    title = options.markerLabel(feature, resolution);
  }
  if (!goog.isDefAndNotNull(title)) {
    title = ics.map.style.getDefaultLabel(feature, resolution);
  }
  if (title) {
    goog.asserts.assertInstanceof(feature, ol.Feature);
    var intersectFunction = goog.partial(
        ics.map.geom.INTERSECT_CENTER_GEOMETRY_FUNCTION, options.map);
    var fontSize = 13;
    var offsetY = ics.map.style.getLabelHeight(title, fontSize) / 2 +
        ics.map.marker.cluster.style.RADIUS + 2;
    var textStyle = new ol.style.Style({
      geometry: ics.map.building.isBuilding(feature) ?
          intersectFunction :
          ics.map.geom.CENTER_GEOMETRY_FUNCTION,
      text: new ol.style.Text({
        font: 'bold ' + fontSize + 'px arial',
        fill: ics.map.marker.style.TEXT_FILL,
        offsetY: offsetY,
        stroke: ics.map.style.TEXT_STROKE,
        text: title
      }),
      zIndex: 4
    });
    return textStyle;
  } else {
    return null;
  }
};
