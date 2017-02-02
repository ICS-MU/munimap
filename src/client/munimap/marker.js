goog.provide('munimap.marker');
goog.provide('munimap.marker.custom');

goog.require('assert');
goog.require('munimap.feature');
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
 * @param {munimap.featureClickHandlerOptions} options
 * @return {boolean}
 */
munimap.marker.isClickable = function(options) {
  var feature = options.feature;
  var map = options.map;
  var resolution = options.resolution;

  if (munimap.marker.custom.isCustom(feature)) {
    return false;
  } else if (munimap.building.isBuilding(feature)) {
    return munimap.building.hasInnerGeometry(feature) &&
        (!munimap.range.contains(munimap.floor.RESOLUTION, resolution) ||
        !munimap.building.isActive(feature, map));
  } else {
    return munimap.room.isRoom(feature) &&
        (!munimap.range.contains(munimap.floor.RESOLUTION, resolution) ||
        !munimap.room.isInActiveFloor(feature, map));
  }
};


/**
 * @param {munimap.featureClickHandlerOptions} options
 */
munimap.marker.featureClickHandler = function(options) {
  var feature = options.feature;
  var map = options.map;
  var pixel = options.pixel;
  var resolution = options.resolution;

  var wasInnerGeomShown =
      munimap.range.contains(munimap.floor.RESOLUTION, resolution);
  if (!wasInnerGeomShown) {
    var center;
    if (munimap.room.isRoom(feature)) {
      var extent = munimap.extent.ofFeature(feature);
      center = ol.extent.getCenter(extent);
    } else {
      center = munimap.feature.getClosestPointToPixel(map, feature, pixel);
    }
    munimap.feature.zoomToCenter(map, center);
  }
  munimap.changeFloor(map, feature);
  if (wasInnerGeomShown) {
    munimap.info.refreshVisibility(map);
  }
};


/**
 * @type {munimap.type.SimpleOptions}
 * @const
 */
munimap.marker.custom.TYPE = {
  name: 'custom-marker'
};


/**
 * @type {string}
 * @const
 */
munimap.marker.custom.LABEL_FIELD_NAME = 'label';


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.marker.custom.isCustom = function(feature) {
  var fType = feature.get(munimap.type.NAME);
  return fType === munimap.marker.custom.TYPE;
};


/**
 * @param {ol.Feature} feature
 * @return {string|undefined}
 */
munimap.marker.custom.getLabel = function(feature) {
  var label = feature.get(munimap.marker.custom.LABEL_FIELD_NAME);
  goog.asserts.assert(label === undefined || goog.isString(label));
  return label;
};


/**
 * True if the feature is suitable to become custom marker.
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.marker.custom.isSuitable = function(feature) {
  var geom = feature.getGeometry();
  var result = geom instanceof ol.geom.Point;
  if (result) {
    var proj = ol.proj.get('EPSG:4326');
    var projExtent = proj.getExtent();
    result = ol.extent.containsCoordinate(projExtent, geom.getCoordinates());
  }
  return result;
};


/**
 * True if the feature is suitable to become custom marker.
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.marker.custom.assertSuitable = function(feature) {
  return assert(munimap.marker.custom.isSuitable(feature),
      'Custom marker represented by ol.Feature must have ol.Point geometry ' +
      'with appropriate longitude (-180;180) and latitude (-90, 90).');
};


/**
 * Decorate feature to become custom marker. Should be called only if
 * munimap.marker.custom.isSuitable returned true.
 * @param {ol.Feature} feature
 */
munimap.marker.custom.decorate = function(feature) {
  feature.set(munimap.type.NAME, munimap.marker.custom.TYPE);
  var geom = feature.getGeometry();
  var transformFn = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');
  geom.applyTransform(transformFn);
};
