goog.provide('ics.map.style');

goog.require('ics.map.geom');
goog.require('ol.Feature');
goog.require('ol.geom.Geometry');
goog.require('ol.geom.Point');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


/**
 * @type {Object.<string, ol.style.Style|Array.<ol.style.Style>>}
 * @const
 */
ics.map.style.LABEL_CACHE = {};


/**
 * @type {ol.style.Fill}
 * @const
 */
ics.map.style.TEXT_FILL = new ol.style.Fill({
  color: '#002776'
});


/**
 * @type {ol.style.Stroke}
 * @const
 */
ics.map.style.TEXT_STROKE = new ol.style.Stroke({
  color: '#ffffff',
  width: 4
});


/**
 * @type {ol.style.Fill}
 * @const
 */
ics.map.style.NO_GEOMETRY_FILL = new ol.style.Fill({
  color: '#dfdfdf'
});


/**
 * @type {number}
 * @const
 */
ics.map.style.PIN_SIZE = 25;


/**
 * @type {ol.style.Style}
 * @const
 */
ics.map.style.PIN = new ol.style.Style({
  geometry: ics.map.geom.CENTER_GEOMETRY_FUNCTION,
  text: new ol.style.Text({
    text: '\uf041',
    font: 'normal ' + ics.map.style.PIN_SIZE + 'px FontAwesome',
    fill: ics.map.style.TEXT_FILL,
    offsetY: - ics.map.style.PIN_SIZE / 2,
    stroke: ics.map.style.TEXT_STROKE
  }),
  zIndex: 6
});


/**
 * The same options are ics.map.marker.style.labelFunction.Options
 * @typedef {{
 *   markerSource: ol.source.Vector,
 *   markerLabel: (ics.map.create.MarkerLabel|undefined),
 *   map: (ol.Map|undefined)
 * }}
 */
ics.map.style.MarkersAwareOptions;


/**
 * @typedef {{
 *    resolution: number,
 *    color: string,
 *    opacity: number
 * }}
 */
ics.map.style.ResolutionColorObject;


/**
 * @type {Array.<ics.map.style.ResolutionColorObject>}
 * @const
 */
ics.map.style.RESOLUTION_COLOR = [
  {resolution: 0.59, color: '#fff', opacity: 1},
  {resolution: 0.48, color: '#fdfdfd', opacity: 0.8},
  {resolution: 0.38, color: '#fbfbfb', opacity: 0.4},
  {resolution: 0.32, color: '#efefef', opacity: 0.2},
  {resolution: 0.29, color: '#ededed', opacity: 0.2}
];


/**
 * @type {number}
 * @protected
 * @const
 */
ics.map.style.CHAR_HEIGHT_WIDTH_RATIO = 3 / 2;


/**
 * @param {Array.<string>} parts
 * @param {string} separator
 * @return {string}
 */
ics.map.style.alignTextToRows = function(parts, separator) {
  var maxLength = 0;
  var charCount = 0;
  parts.forEach(function(part) {
    charCount += part.length;
    if (part.length > maxLength) {
      maxLength = part.length;
    }
  });
  var charsPerRow = Math.ceil(Math.sqrt(
      ics.map.style.CHAR_HEIGHT_WIDTH_RATIO * charCount));
  if (maxLength > charsPerRow) {
    charsPerRow = maxLength;
  }
  var rowNumber = 0;
  var text;
  parts.forEach(function(part, i) {
    if (i === 0) {
      text = part;
    } else {
      var charsInLastRow = text.substr(text.lastIndexOf('\n') + 1).length;
      if ((charsInLastRow < charsPerRow &&
          (part.length < 3 || charsInLastRow < charsPerRow / 2)) ||
          charsInLastRow + part.length <= charsPerRow) {
        text += separator + part;
      } else {
        text += '\n' + part;
        rowNumber++;
      }
    }
  });
  return text;
};


/**
 *
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {string|undefined}
 */
ics.map.style.getDefaultLabel = function(feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var title;
  var uid = ics.map.store.getUid(feature);
  if (!uid) {
    var clusteredFeatures = ics.map.cluster.getFeatures(feature);
    var titleParts = [];
    var rooms = clusteredFeatures.filter(function(feat) {
      return ics.map.room.isRoom(feat);
    });
    if (rooms.length) {
      titleParts.push(rooms.length + 'x místnost');
    }
    var bldgs = clusteredFeatures.filter(function(feat) {
      return ics.map.building.isBuilding(feat);
    });
    if (bldgs.length) {
      titleParts.push(bldgs.length + 'x budova');
    }
    title = titleParts.join('\n');
  } else {
    if (ics.map.building.isBuilding(feature)) {
      title = ics.map.building.getLabel(feature, resolution);
      goog.asserts.assertString(title);
    } else {
      title = feature.get('nazev') || feature.get('cislo');
      if (goog.isDef(title)) {
        goog.asserts.assertString(title);
        title = ics.map.room.style.alignRoomTitleToRows(title);
      }
    }
  }
  return title;
};


/**
 * @param {string} title
 * @param {number} fontSize
 * @return {number}
 */
ics.map.style.getLabelHeight = function(title, fontSize) {
  var rowCount = title.split('\n').length;
  var lineHeight = 1.2 * fontSize;
  return rowCount * lineHeight;
};


/**
 * @param {string} title
 * @param {function(ol.Feature):ol.geom.Geometry} geometryFunction
 * @param {number} fontSize
 * @return {Array.<ol.style.Style>}
 */
ics.map.style.getLabelWithPin =
    function(title, geometryFunction, fontSize) {
  var textStyle = new ol.style.Style({
    geometry: geometryFunction,
    text: new ol.style.Text({
      font: 'bold ' + fontSize + 'px arial',
      fill: ics.map.style.TEXT_FILL,
      offsetY: ics.map.style.getLabelHeight(title, fontSize) / 2 + 2,
      stroke: ics.map.style.TEXT_STROKE,
      text: title
    }),
    zIndex: 4
  });

  var pin = new ol.style.Style({
    geometry: geometryFunction,
    text: new ol.style.Text({
      text: '\uf041',
      font: 'normal ' + ics.map.style.PIN_SIZE + 'px FontAwesome',
      fill: ics.map.style.TEXT_FILL,
      offsetY: - ics.map.style.PIN_SIZE / 2,
      stroke: ics.map.style.TEXT_STROKE
    }),
    zIndex: 5
  });
  return [textStyle, pin];
};
