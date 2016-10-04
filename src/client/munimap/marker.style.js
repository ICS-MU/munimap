goog.provide('munimap.marker.style');


/**
 * @type {ol.style.Fill}
 * @const
 */
munimap.marker.style.FILL = new ol.style.Fill({
  color: '#e51c23'
});


/**
 * @type {ol.style.Fill}
 * @const
 */
munimap.marker.style.TEXT_FILL = new ol.style.Fill({
  color: '#e51c23'
});


/**
 * Styles corresponding different resolutions.
 * @type {Object.<number, ol.style.Style|Array.<ol.style.Style>>}
 * @const
 */
munimap.marker.style.WHITE_TO_GREY_CACHE = {};


/**
 * @type {ol.style.Fill}
 * @const
 */
munimap.marker.style.BUILDING_FILL = new ol.style.Fill({
  color: '#ffffff'
});


/**
 * @type {ol.style.Stroke}
 * @const
 */
munimap.marker.style.BUILDING_STROKE = new ol.style.Stroke({
  color: '#e51c23',
  width: 1
});


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.marker.style.BUILDING = new ol.style.Style({
  fill: munimap.marker.style.BUILDING_FILL,
  stroke: munimap.marker.style.BUILDING_STROKE
});


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.marker.style.NO_GEOMETRY_BUILDING = new ol.style.Style({
  fill: munimap.style.NO_GEOMETRY_FILL,
  stroke: munimap.marker.style.BUILDING_STROKE
});


/**
 * @type {ol.style.Fill}
 * @const
 */
munimap.marker.style.ROOM_FILL = new ol.style.Fill({
  color: '#fff'
});


/**
 * @type {ol.style.Stroke}
 * @const
 */
munimap.marker.style.ROOM_STROKE = new ol.style.Stroke({
  color: '#e51c23',
  width: 1
});


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.marker.style.ROOM = new ol.style.Style({
  fill: munimap.marker.style.ROOM_FILL,
  stroke: munimap.marker.style.ROOM_STROKE,
  zIndex: 5
});


/**
 * @type {ol.style.Text}
 * @const
 */
munimap.marker.style.PIN_TEXT = new ol.style.Text({
  text: '\uf041',
  font: 'normal ' + munimap.style.PIN_SIZE + 'px MunimapFont',
  fill: munimap.marker.style.TEXT_FILL,
  offsetY: - munimap.style.PIN_SIZE / 2,
  stroke: munimap.style.TEXT_STROKE
});


/**
 * @param {ol.geom.Geometry|ol.style.GeometryFunction} geometry
 * @return {ol.style.Style}
 */
munimap.marker.style.createPinFromGeometry = function(geometry) {
  return new ol.style.Style({
    geometry: geometry,
    text: munimap.marker.style.PIN_TEXT,
    zIndex: 6
  });
};


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.marker.style.PIN = munimap.marker.style.createPinFromGeometry(
    munimap.geom.CENTER_GEOMETRY_FUNCTION
    );


/**
 * @param {munimap.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {Array.<ol.style.Style>}
 */
munimap.marker.style.function = function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  if (munimap.range.contains(munimap.floor.RESOLUTION, resolution) &&
      munimap.building.isBuilding(feature) &&
      munimap.building.isActive(feature, options.map)) {
    return null;
  }

  var result = [];
  if (munimap.room.isRoom(feature)) {
    var locCode = /**@type {string}*/ (feature.get('polohKod'));
    var activeFloor = munimap.getVars(options.map).activeFloor;
    var inActiveFloor = activeFloor &&
        munimap.floor.getActiveFloors(options.map).some(function(floorCode) {
          return locCode.startsWith(floorCode);
        });
    if (munimap.range.contains(munimap.floor.RESOLUTION, resolution) &&
        !inActiveFloor) {
      return null;
    }

    var markedRoomResolution = munimap.range.createResolution(
        munimap.floor.RESOLUTION.max,
        munimap.cluster.ROOM_RESOLUTION.min
        );
    if (munimap.range.contains(markedRoomResolution, resolution)) {
      result.push(munimap.marker.style.ROOM);
    }
  }
  if (!munimap.room.isRoom(feature) ||
      !munimap.range.contains(
      munimap.cluster.ROOM_RESOLUTION, resolution)) {
    var textStyle =
        munimap.marker.style.labelFunction(options, feature, resolution);
    if (goog.isDefAndNotNull(textStyle)) {
      goog.array.extend(result, textStyle);
    }
  }
  return result;
};


/**
 * @param {munimap.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return Array.<ol.style.Style>
 */
munimap.marker.style.labelFunction = function(options, feature, resolution) {
  var styleArray = [];
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var isBuilding = munimap.building.isBuilding(feature);

  var title;
  if (goog.isDef(options.markerLabel)) {
    var titleParts = [];
    var name = options.markerLabel(feature, resolution);
    if (goog.isDefAndNotNull(name)) {
      titleParts.push(name);
      if (isBuilding) {
        titleParts.push(munimap.building.getAddressPart(feature, resolution));
      }
      title = titleParts.join('\n');
    }
  }
  if (!goog.isDefAndNotNull(title)) {
    title = munimap.style.getDefaultLabel(feature, resolution);
  }

  var markers = options.markerSource.getFeatures();
  var isMarked = goog.array.contains(markers, feature);

  var fill = isMarked ?
      munimap.marker.style.TEXT_FILL :
      munimap.style.TEXT_FILL;

  var fontSize;
  if (munimap.room.isRoom(feature)) {
    fontSize = 11;
  } else if (isBuilding &&
      munimap.range.contains(munimap.floor.RESOLUTION, resolution)) {
    fontSize = munimap.building.style.BIG_FONT_SIZE;
  } else {
    fontSize = munimap.building.style.FONT_SIZE;
  }

  var intersectFunction = goog.partial(
      munimap.geom.INTERSECT_CENTER_GEOMETRY_FUNCTION, options.map);
  var geometry = isBuilding ?
      intersectFunction :
      munimap.geom.CENTER_GEOMETRY_FUNCTION;

  var opts = {
    fill: fill,
    fontSize: fontSize,
    geometry: geometry,
    title: title,
    zIndex: 6
  };
  if (isBuilding) {
    styleArray = munimap.style.getLabelWithPin(opts);
  } else {
    if (title) {
      var textStyle = munimap.style.getTextStyleWithOffsetY(opts);
      styleArray.push(textStyle);
    }
    var pin = isMarked ?
        munimap.marker.style.PIN :
        munimap.style.PIN;
    styleArray.push(pin);
  }
  return styleArray;
};


/**
 * @typedef {{
 *   map: ol.Map,
 *   markerSource: ol.source.Vector,
 *   markerLabel: (munimap.create.MarkerLabel|undefined)
 * }}
 */
munimap.marker.style.labelFunction.Options;
