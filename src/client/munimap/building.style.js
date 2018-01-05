goog.provide('munimap.building.STYLE');
goog.provide('munimap.building.style');

goog.require('munimap.cluster.style');
goog.require('munimap.complex');
goog.require('munimap.floor');
goog.require('munimap.geom');
goog.require('munimap.marker.style');
goog.require('munimap.range');
goog.require('munimap.store');
goog.require('munimap.style');


/**
 * @type {Object.<string, ol.style.Style|Array.<ol.style.Style>>}
 * @protected
 * @const
 */
munimap.building.style.LABEL_CACHE = {};


/**
 * Styles corresponding different resolutions.
 * @type {Object.<number, ol.style.Style|Array.<ol.style.Style>>}
 * @protected
 * @const
 */
munimap.building.style.WHITE_TO_GREY_CACHE = {};


/**
 * @type {ol.style.Fill}
 * @protected
 * @const
 */
munimap.building.style.FILL = new ol.style.Fill({
  color: '#ffffff'
});


/**
 * @type {ol.style.Stroke}
 * @protected
 * @const
 */
munimap.building.style.STROKE = new ol.style.Stroke({
  color: '#002776',
  width: 1
});


/**
 * @type {ol.style.Style}
 * @protected
 * @const
 */
munimap.building.STYLE = new ol.style.Style({
  fill: munimap.building.style.FILL,
  stroke: munimap.building.style.STROKE
});


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.building.style.NO_GEOMETRY = new ol.style.Style({
  fill: munimap.style.NO_GEOMETRY_FILL,
  stroke: munimap.building.style.STROKE
});


/**
 * @type {number}
 */
munimap.building.style.FONT_SIZE = 13;


/**
 * @type {number}
 */
munimap.building.style.BIG_FONT_SIZE = 15;


/**
 * Filter function of a style fragment (type munimap.style.FilterFunction).
 *
 * @param {ol.Feature} feature
 * @param {?string} selectedFloorCode
 * @param {Array.<string>} activeFloorCodes
 * @return {boolean}
 */
munimap.building.style.selectedFloorFilter =
    function(feature, selectedFloorCode, activeFloorCodes) {
  if (goog.isDefAndNotNull(selectedFloorCode)) {
    var locCode = /**@type {string}*/ (feature.get('polohKod'));
    return selectedFloorCode.startsWith(locCode);
  }
  return false;
};


/**
 * Style function of a style fragment (type munimap.style.Function).
 *
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.building.style.selectedFloorFunction =
    function(options, feature, resolution) {
  var style = munimap.building.style.function(options, feature, resolution);
  var selectedFill = new ol.style.Fill({
    color: style.getFill().getColor()
  });
  var selectedStroke = new ol.style.Stroke({
    color: style.getStroke().getColor(),
    width: 2 * style.getStroke().getWidth()
  });
  return new ol.style.Style({
    fill: selectedFill,
    stroke: selectedStroke
  });
};


/**
 * Style function of a style fragment (type munimap.style.Function).
 *
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.building.style.function =
    function(options, feature, resolution) {
  var resColor = munimap.style.RESOLUTION_COLOR.find(
      function(obj, i, arr) {
        return resolution > obj.resolution || i === (arr.length - 1);
      });

  var marked = options.markers.indexOf(feature) >= 0;
  if (marked) {
    if (!munimap.range.contains(
        munimap.cluster.BUILDING_RESOLUTION, resolution)) {
      var result;
      if (munimap.building.hasInnerGeometry(feature)) {
        if (munimap.marker.style.WHITE_TO_GREY_CACHE[resColor.resolution]) {
          result =
              munimap.marker.style.WHITE_TO_GREY_CACHE[resColor.resolution];
        } else {
          result = new ol.style.Style({
            fill: new ol.style.Fill({
              color: resColor.color
            }),
            stroke: munimap.marker.style.BUILDING_STROKE
          });
          munimap.marker.style.WHITE_TO_GREY_CACHE[resColor.resolution] =
              result;
        }
      } else {
        result = munimap.marker.style.NO_GEOMETRY_BUILDING;
      }
    } else {
      result = munimap.building.STYLE;
    }
  } else {
    if (munimap.building.hasInnerGeometry(feature)) {
      if (munimap.building.style.WHITE_TO_GREY_CACHE[resColor.resolution]) {
        result =
            munimap.building.style.WHITE_TO_GREY_CACHE[resColor.resolution];
      } else {
        result = new ol.style.Style({
          fill: new ol.style.Fill({
            color: resColor.color
          }),
          stroke: munimap.building.style.STROKE
        });
        munimap.building.style.WHITE_TO_GREY_CACHE[resColor.resolution] =
            result;
      }
    } else {
      result = munimap.building.style.NO_GEOMETRY;
    }
  }
  return result;
};


/**
 * Style function of a style fragment (type munimap.style.Function).
 *
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.building.style.labelFunction =
    function(options, feature, resolution) {
  var result = null;
  var marked = options.markers.indexOf(feature) >= 0;
  if (!marked && resolution < munimap.complex.RESOLUTION.max) {
    if (!munimap.range.contains(munimap.floor.RESOLUTION, resolution)) {
      result = munimap.building.style.smallScaleLabelFunction(
          options.map, feature, resolution);
    } else {
      result = munimap.building.style.largeScaleLabelFunction(
          options.map, feature, resolution);
    }
  }
  return result;
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {Array.<ol.style.Style>|ol.style.Style}
 * @protected
 */
munimap.building.style.smallScaleLabelFunction =
    function(map, feature, resolution) {
  var result = null;
  var units = munimap.building.getUnits(feature);
  if (units.length > 0) {
    if (resolution < munimap.cluster.BUILDING_RESOLUTION.min) {
      var title;
      var complex = munimap.building.getComplex(feature);
      if (munimap.range.contains(munimap.complex.RESOLUTION, resolution) &&
          goog.isDefAndNotNull(complex) &&
          munimap.complex.getBuildingCount(complex) > 1) {
        title = munimap.unit.getTitleParts(units).join('\n');
      } else {
        title = munimap.building.getDefaultLabel(feature, resolution);
      }
      if (goog.isDef(title)) {
        var geometryFunction = goog.partial(
            munimap.geom.INTERSECT_CENTER_GEOMETRY_FUNCTION, map);
        var options = {
          fill: munimap.style.TEXT_FILL,
          fontSize: munimap.building.style.FONT_SIZE,
          geometry: geometryFunction,
          title: title
        };
        result = munimap.style.getLabelWithPin(options);
      }
    }
  } else if (resolution < munimap.complex.RESOLUTION.min) {
    result =
        munimap.building.style.defaultLabelFunction(map, feature, resolution);
  }
  return result;
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {Array.<ol.style.Style>|ol.style.Style}
 * @protected
 */
munimap.building.style.largeScaleLabelFunction =
    function(map, feature, resolution) {
  var uid = munimap.store.getUid(feature);
  if (uid) {
    goog.asserts.assertString(uid);
    if (munimap.building.style.LABEL_CACHE[uid]) {
      return munimap.building.style.LABEL_CACHE[uid];
    }
  }

  var result;
  var title = munimap.building.getDefaultLabel(feature, resolution);
  if (goog.isDef(title)) {
    var units = munimap.building.getUnits(feature);
    if (units.length > 0) {
      var geometryFunction = goog.partial(
          munimap.geom.INTERSECT_CENTER_GEOMETRY_FUNCTION, map);
      var options = {
        fill: munimap.style.TEXT_FILL,
        fontSize: munimap.building.style.FONT_SIZE,
        geometry: geometryFunction,
        title: title
      };
      result = munimap.style.getLabelWithPin(options);
    } else {
      result = new ol.style.Style({
        geometry: geometryFunction,
        text: new ol.style.Text({
          font: 'bold ' + munimap.building.style.BIG_FONT_SIZE + 'px arial',
          fill: munimap.style.TEXT_FILL,
          stroke: munimap.style.TEXT_STROKE,
          text: title
        }),
        zIndex: 4
      });
    }
  } else {
    result = null;
  }
  if (uid) {
    goog.asserts.assertString(uid);
    munimap.building.style.LABEL_CACHE[uid] = result;
  }
  return result;
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array<ol.style.Style>}
 * @protected
 */
munimap.building.style.defaultLabelFunction =
    function(map, feature, resolution) {
  var uid = munimap.store.getUid(feature);
  if (uid) {
    goog.asserts.assertString(uid);
    if (munimap.style.LABEL_CACHE[uid]) {
      return munimap.style.LABEL_CACHE[uid];
    }
  }

  var title = munimap.style.getDefaultLabel(feature, resolution);
  var textStyle = new ol.style.Style({
    geometry: goog.partial(
        munimap.geom.INTERSECT_CENTER_GEOMETRY_FUNCTION, map),
    text: new ol.style.Text({
      font: 'bold ' + munimap.building.style.FONT_SIZE + 'px arial',
      fill: munimap.style.TEXT_FILL,
      stroke: munimap.style.TEXT_STROKE,
      text: title
    }),
    zIndex: 4
  });

  if (uid) {
    goog.asserts.assertString(uid);
    munimap.style.LABEL_CACHE[uid] = textStyle;
  }
  return textStyle;
};
