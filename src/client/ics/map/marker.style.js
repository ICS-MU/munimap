goog.provide('ics.map.marker.style');


/**
 * @type {ol.style.Fill}
 * @const
 */
ics.map.marker.style.FILL = new ol.style.Fill({
  color: '#e51c23'
});


/**
 * @type {ol.style.Fill}
 * @const
 */
ics.map.marker.style.TEXT_FILL = new ol.style.Fill({
  color: '#e51c23'
});


/**
 * Styles corresponding different resolutions.
 * @type {Object.<number, ol.style.Style|Array.<ol.style.Style>>}
 * @const
 */
ics.map.marker.style.WHITE_TO_GREY_CACHE = {};


/**
 * @type {ol.style.Fill}
 * @const
 */
ics.map.marker.style.BUILDING_FILL = new ol.style.Fill({
  color: '#ffffff'
});


/**
 * @type {ol.style.Stroke}
 * @const
 */
ics.map.marker.style.BUILDING_STROKE = new ol.style.Stroke({
  color: '#e51c23',
  width: 1
});


/**
 * @type {ol.style.Style}
 * @const
 */
ics.map.marker.style.BUILDING = new ol.style.Style({
  fill: ics.map.marker.style.BUILDING_FILL,
  stroke: ics.map.marker.style.BUILDING_STROKE
});


/**
 * @type {ol.style.Style}
 * @const
 */
ics.map.marker.style.NO_GEOMETRY_BUILDING = new ol.style.Style({
  fill: ics.map.style.NO_GEOMETRY_FILL,
  stroke: ics.map.marker.style.BUILDING_STROKE
});


/**
 * @type {ol.style.Fill}
 * @const
 */
ics.map.marker.style.ROOM_FILL = new ol.style.Fill({
  color: '#fff'
});


/**
 * @type {ol.style.Stroke}
 * @const
 */
ics.map.marker.style.ROOM_STROKE = new ol.style.Stroke({
  color: '#e51c23',
  width: 1
});


/**
 * @type {ol.style.Style}
 * @const
 */
ics.map.marker.style.ROOM = new ol.style.Style({
  fill: ics.map.marker.style.ROOM_FILL,
  stroke: ics.map.marker.style.ROOM_STROKE,
  zIndex: 5
});


/**
 * @type {ol.style.Style}
 * @const
 * @protected
 */
ics.map.marker.style.PIN = new ol.style.Style({
  geometry: ics.map.geom.CENTER_GEOMETRY_FUNCTION,
  text: new ol.style.Text({
    text: '\uf041',
    font: 'normal ' + ics.map.style.PIN_SIZE + 'px FontAwesome',
    fill: ics.map.marker.style.TEXT_FILL,
    offsetY: - ics.map.style.PIN_SIZE / 2,
    stroke: ics.map.style.TEXT_STROKE
  }),
  zIndex: 6
});


/**
 * @param {ics.map.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {Array.<ol.style.Style>}
 */
ics.map.marker.style.function = function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  if (ics.map.range.contains(ics.map.floor.RESOLUTION, resolution) &&
      ics.map.building.isBuilding(feature) &&
      ics.map.building.isActive(feature, options.map)) {
    return null;
  }

  var result = [];
  if (ics.map.room.isRoom(feature)) {
    var locCode = /**@type {string}*/ (feature.get('polohKod'));
    var activeFloor = ics.map.getVars(options.map).activeFloor;
    var inActiveFloor = activeFloor &&
        ics.map.floor.getActiveFloors(options.map).some(function(floorCode) {
          return locCode.startsWith(floorCode);
        });
    if (ics.map.range.contains(ics.map.floor.RESOLUTION, resolution) &&
        !inActiveFloor) {
      return null;
    }

    var markedRoomResolution = ics.map.range.createResolution(
        ics.map.floor.RESOLUTION.max,
        ics.map.cluster.ROOM_RESOLUTION.min
        );
    if (ics.map.range.contains(markedRoomResolution, resolution)) {
      result.push(ics.map.marker.style.ROOM);
    }
  }
  if (!ics.map.room.isRoom(feature) ||
      !ics.map.range.contains(
      ics.map.cluster.ROOM_RESOLUTION, resolution)) {
    var textStyle =
        ics.map.marker.style.labelFunction(options, feature, resolution);
    if (goog.isDefAndNotNull(textStyle)) {
      goog.array.extend(result, textStyle);
    }
  }
  return result;
};


/**
 * @param {ics.map.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return Array.<ol.style.Style>
 */
ics.map.marker.style.labelFunction = function(options, feature, resolution) {
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
    var fontSize;
    if (ics.map.room.isRoom(feature)) {
      fontSize = 11;
    } else if (ics.map.building.isBuilding(feature) &&
        ics.map.range.contains(ics.map.floor.RESOLUTION, resolution)) {
      fontSize = ics.map.building.style.BIG_FONT_SIZE;
    } else {
      fontSize = ics.map.building.style.FONT_SIZE;
    }
    var markers = options.markerSource.getFeatures();
    var isMarked = goog.array.contains(markers, feature) ||
        (ics.map.cluster.getFeatures(feature).length &&
            ics.map.cluster.containsMarker(options.map, feature));
    var fill = isMarked ?
        ics.map.marker.style.TEXT_FILL :
        ics.map.style.TEXT_FILL;
    var textStyle = new ol.style.Style({
      geometry: ics.map.building.isBuilding(feature) ?
          intersectFunction :
          ics.map.geom.CENTER_GEOMETRY_FUNCTION,
      text: new ol.style.Text({
        font: 'bold ' + fontSize + 'px arial',
        fill: fill,
        offsetY: ics.map.style.getLabelHeight(title, fontSize) / 2 + 2,
        stroke: ics.map.style.TEXT_STROKE,
        text: title
      }),
      zIndex: 6
    });

    var pin;
    if (ics.map.building.isBuilding(feature)) {
      pin = new ol.style.Style({
        geometry: intersectFunction,
        text: new ol.style.Text({
          text: '\uf041',
          font: 'normal ' + ics.map.style.PIN_SIZE + 'px FontAwesome',
          fill: fill,
          offsetY: - ics.map.style.PIN_SIZE / 2,
          stroke: ics.map.style.TEXT_STROKE
        }),
        zIndex: 6
      });
    } else {
      if (isMarked) {
        pin = ics.map.marker.style.PIN;
      } else {
        pin = ics.map.style.PIN;
      }
    }
    return [textStyle, pin];
  } else {
    return null;
  }
};


/**
 * @typedef {{
 *   map: ol.Map,
 *   markerSource: ol.source.Vector,
 *   markerLabel: (ics.map.create.MarkerLabel|undefined)
 * }}
 */
ics.map.marker.style.labelFunction.Options;
