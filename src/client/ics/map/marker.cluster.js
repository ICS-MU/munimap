goog.provide('ics.map.marker.cluster');
goog.provide('ics.map.marker.cluster.style');

goog.require('goog.array');
goog.require('ics.map.marker.style');


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
    ics.map.range.createResolution(6.4, Number.POSITIVE_INFINITY);


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
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 * @protected
 */
ics.map.marker.cluster.getSource = function(map) {
  var clusterStore = ics.map.marker.cluster.getStore(map);
  goog.asserts.assertInstanceof(clusterStore, ol.source.Cluster);
  return clusterStore.getSource();
};


/**
 * @param {ol.Map} map
 * @return {Array.<ol.Feature>}
 * @protected
 */
ics.map.marker.cluster.getSourceFeatures = function(map) {
  var source = ics.map.marker.cluster.getSource(map);
  return source.getFeatures();
};


/**
 * @param {ol.Map} map
 * @param {Array.<ol.Feature>} buildings
 */
ics.map.marker.cluster.addHeadquaters = function(map, buildings) {
  var markers = ics.map.marker.getFeatures(map);
  var bldgsToAdd =
      ics.map.building.getNotMarkedHeadquaters(buildings, markers);
  var clusterFeatures = ics.map.marker.cluster.getSourceFeatures(map);
  bldgsToAdd = bldgsToAdd.filter(function(bldg) {
    return !goog.array.contains(clusterFeatures, bldg);
  });
  ics.map.marker.cluster.getSource(map).addFeatures(bldgsToAdd);
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} cluster
 * @return {boolean}
 */
ics.map.marker.cluster.containsMarker = function(map, cluster) {
  var markers = ics.map.marker.getFeatures(map);
  var clusteredFeatures = cluster.get('features');
  return clusteredFeatures.some(function(feat) {
    return goog.array.contains(markers, feat);
  });
};


/**
 * @param {ol.render.Event} evt
 */
ics.map.marker.cluster.handleMapPrecomposeEvt = function(evt) {
  var map = /**@type {ol.Map}*/(evt.target);
  var mapVars = ics.map.getVars(map);
  var oldRes = mapVars.currentResolution;

  var viewState = evt.frameState.viewState;
  var res = viewState.resolution;
  if (ics.map.range.contains(
      ics.map.marker.cluster.BUILDING_RESOLUTION, oldRes) &&
      !ics.map.range.contains(
      ics.map.marker.cluster.BUILDING_RESOLUTION, res)) {
    var clusterSource = ics.map.marker.cluster.getSource(map);
    clusterSource.clear();
    clusterSource.addFeatures(ics.map.marker.getFeatures(map).concat());
  } else if (ics.map.range.contains(
      ics.map.marker.cluster.BUILDING_RESOLUTION, res) &&
      !ics.map.range.contains(
      ics.map.marker.cluster.BUILDING_RESOLUTION, oldRes)) {
    var bldgs = ics.map.building.STORE.getFeatures();
    ics.map.marker.cluster.addHeadquaters(map, bldgs);
  }
  mapVars.currentResolution = res;
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
    fill: ics.map.style.TEXT_FILL,
    stroke: new ol.style.Stroke({
      color: '#ffffff',
      width: 2
    })
  })
});


/**
 * @type {ol.style.Style}
 * @protected
 * @const
 */
ics.map.marker.cluster.style.MULTIPLE_MARKED = new ol.style.Style({
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
    goog.asserts.assertInstanceof(feature, ol.Feature);
    var containsMarker =
        ics.map.marker.cluster.containsMarker(options.map, feature);
    var circleStyle = containsMarker ?
        ics.map.marker.cluster.style.MULTIPLE_MARKED :
        ics.map.marker.cluster.style.MULTIPLE;
    result = [
      ics.map.marker.cluster.style.labelFunction(options, feature, resolution),
      circleStyle
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
    var map = options.map;
    goog.asserts.assertInstanceof(feature, ol.Feature);
    var intersectFunction = goog.partial(
        ics.map.geom.INTERSECT_CENTER_GEOMETRY_FUNCTION, map);
    var fontSize = 13;
    var offsetY = ics.map.style.getLabelHeight(title, fontSize) / 2 +
        ics.map.marker.cluster.style.RADIUS + 2;
    var containsMarker = ics.map.marker.cluster.containsMarker(map, feature);
    var fill = containsMarker ?
        ics.map.marker.style.TEXT_FILL :
        ics.map.style.TEXT_FILL;
    var textStyle = new ol.style.Style({
      geometry: ics.map.building.isBuilding(feature) ?
          intersectFunction :
          ics.map.geom.CENTER_GEOMETRY_FUNCTION,
      text: new ol.style.Text({
        font: 'bold ' + fontSize + 'px arial',
        fill: fill,
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
