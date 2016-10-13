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
 * @param {munimap.style.MarkersAwareOptions} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.building.style.function =
    function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var resColor = munimap.style.RESOLUTION_COLOR.find(
      function(obj, i, arr) {
        return resolution > obj.resolution || i === (arr.length - 1);
      });

  var markerSource = options.markerSource;
  var markers = markerSource.getFeatures();
  var marked = markers.indexOf(feature) >= 0;
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
  var map = options.map;
  goog.asserts.assertInstanceof(map, ol.Map);
  var activeBuilding = munimap.getVars(map).activeBuilding;
  var isActive = activeBuilding &&
      activeBuilding === munimap.building.getLocationCode(feature);
  if (isActive &&
      munimap.range.contains(munimap.floor.RESOLUTION, resolution)) {
    var selectedFill = new ol.style.Fill({
      color: result.getFill().getColor()
    });
    var selectedStroke = new ol.style.Stroke({
      color: result.getStroke().getColor(),
      width: 2 * result.getStroke().getWidth()
    });
    result = new ol.style.Style({
      fill: selectedFill,
      stroke: selectedStroke
    });
  }
  return result;
};


/**
 * @param {munimap.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.building.style.labelFunction =
    function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var markerSource = options.markerSource;
  var markers = markerSource.getFeatures();
  var marked = markers.indexOf(feature) >= 0;
  var isActive = munimap.building.isActive(feature, options.map);

  var result = null;
  if (!marked && resolution < munimap.complex.RESOLUTION.max &&
      (!isActive || (isActive &&
          !munimap.range.contains(munimap.floor.RESOLUTION, resolution)))) {
    var geometryFunction = goog.partial(
        munimap.geom.INTERSECT_CENTER_GEOMETRY_FUNCTION, options.map);
    var units = munimap.building.getUnits(feature);
    var opts = {
      fill: munimap.style.TEXT_FILL,
      fontSize: munimap.building.style.FONT_SIZE,
      geometry: geometryFunction
    };
    if (!munimap.range.contains(munimap.floor.RESOLUTION, resolution)) {
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
            opts.title = title;
            result = munimap.style.getLabelWithPin(opts);
          }
        }
      } else if (resolution < munimap.complex.RESOLUTION.min) {
        result = munimap.building.style.defaultLabelFunction(
            options.map, feature, resolution);
      }
    } else {
      var uid = munimap.store.getUid(feature);
      if (uid) {
        goog.asserts.assertString(uid);
        if (munimap.building.style.LABEL_CACHE[uid]) {
          return munimap.building.style.LABEL_CACHE[uid];
        }
      }
      var title = munimap.building.getDefaultLabel(feature, resolution);
      if (goog.isDef(title)) {
        if (units.length > 0) {
          opts.title = title;
          result = munimap.style.getLabelWithPin(opts);
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
      }
      if (uid) {
        goog.asserts.assertString(uid);
        munimap.building.style.LABEL_CACHE[uid] = result;
      }
    }
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
