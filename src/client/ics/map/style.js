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
 * @typedef {{
 *   markerSource: ol.source.Vector,
 *   markerLabel: (ics.map.create.MarkerLabel|undefined)
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
  var title;
  var uid = ics.map.store.getUid(feature);
  if (!uid) {
    var clusteredFeatures = feature.get('features');
    var featureTypeName;
    if (ics.map.building.isBuilding(clusteredFeatures[0])) {
      featureTypeName = 'budova';
    } else if (ics.map.room.isRoom(clusteredFeatures[0])) {
      featureTypeName = 'místnost';
    }
    title = clusteredFeatures.length + 'x ' + featureTypeName;
  } else {
    goog.asserts.assertInstanceof(feature, ol.Feature);
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
