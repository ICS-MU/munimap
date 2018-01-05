goog.provide('munimap.complex');
goog.provide('munimap.complex.style');

goog.require('munimap.lang');
goog.require('munimap.load');
goog.require('munimap.range');
goog.require('munimap.store');
goog.require('munimap.style');


/**
 * @type {munimap.Range}
 * @const
 */
munimap.complex.RESOLUTION = munimap.range.createResolution(1.19, 4.77);


/**
 * @type {string}
 */
munimap.complex.ID_FIELD_NAME = 'inetId';


/**
 * @type {string}
 */
munimap.complex.UNITS_FIELD_NAME = 'pracoviste';


/**
 *
 * @type {number}
 * @protected
 */
munimap.complex.FONT_SIZE = 13;


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.complex.STORE = new ol.source.Vector();


/**
 *
 * @type {munimap.type.Options}
 */
munimap.complex.TYPE = {
  primaryKey: munimap.complex.ID_FIELD_NAME,
  serviceUrl: munimap.load.MUNIMAP_URL,
  store: munimap.complex.STORE,
  layerId: 4,
  name: 'complex'
};


/**
 * @type {string}
 * @const
 */
munimap.complex.LAYER_ID = 'complex';


/**
 * @param {number} id
 * @param {Array.<ol.Feature>=} opt_features
 * @return {ol.Feature} building
 */
munimap.complex.getById = function(id, opt_features) {
  var features = opt_features || munimap.complex.STORE.getFeatures();
  var result = features.find(function(feature) {
    var idProperty = munimap.complex.TYPE.primaryKey;
    return feature.get(idProperty) === id;
  });
  return result || null;
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.complex.isComplex = function(feature) {
  var fType = feature.get(munimap.type.NAME);
  return fType === munimap.complex.TYPE;
};


/**
 * @param {ol.Feature} complex
 * @return {number}
 */
munimap.complex.getBuildingCount = function(complex) {
  var result = complex.get('pocetBudov');
  goog.asserts.assertNumber(result);
  return result;
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 * @return {boolean}
 */
munimap.complex.isClickable = function(options) {
  var resolution = options.resolution;

  return munimap.range.contains(munimap.complex.RESOLUTION, resolution);
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 */
munimap.complex.featureClickHandler = function(options) {
  var feature = options.feature;
  var map = options.map;

  var complexId = /**@type {number}*/ (
      feature.get(munimap.complex.ID_FIELD_NAME)
      );
  var complexBldgs = munimap.building.STORE.getFeatures().filter(
      function(bldg) {
        var cId = bldg.get('arealId');
        if (goog.isDefAndNotNull(cId)) {
          goog.asserts.assertNumber(cId);
          if (complexId === cId) {
            return true;
          }
        }
        return false;
      });
  var extent = munimap.extent.ofFeatures(complexBldgs);
  var view = map.getView();
  var size = map.getSize() || null;
  var futureRes;
  if (complexBldgs.length === 1) {
    futureRes = munimap.floor.RESOLUTION.max / 2;
  } else {
    futureRes = munimap.complex.RESOLUTION.min / 2;
  }
  var futureExtent = ol.extent.getForViewAndSize(
      ol.extent.getCenter(extent), futureRes, view.getRotation(), size);
  munimap.move.setAnimation(map, view.calculateExtent(size), futureExtent);
  view.fit(futureExtent, size);
};


/**
 * @param {munimap.style.MarkersAwareOptions} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array<ol.style.Style>}
 */
munimap.complex.style.function = function(options, feature, resolution) {
  var showLabel = true;

  goog.asserts.assertInstanceof(feature, ol.Feature);
  var bldgCount = munimap.complex.getBuildingCount(feature);
  if (bldgCount === 1) {
    showLabel = munimap.complex.getUnits(feature).length === 0;
    if (showLabel) {
      var markerSource = options.markerSource;
      var markers = markerSource.getFeatures();
      if (markers.length && munimap.building.isBuilding(markers[0])) {
        var complexId =
            /**@type {number}*/(feature.get(munimap.complex.ID_FIELD_NAME));
        var isMarked = markers.some(function(marker) {
          var markerComplexId = marker.get('arealId');
          if (goog.isDefAndNotNull(markerComplexId)) {
            goog.asserts.assertNumber(markerComplexId);
            return markerComplexId === complexId;
          }
          return false;
        });
        showLabel = !isMarked;
      }
    }
  }
  if (showLabel) {
    goog.asserts.assertInstanceof(feature, ol.Feature);
    var title;
    var uid = munimap.store.getUid(feature);
    goog.asserts.assertString(uid);
    if (munimap.style.LABEL_CACHE[uid]) {
      return munimap.style.LABEL_CACHE[uid];
    }

    title = /**@type {string}*/ (feature.get(munimap.lang.getMsg(
        munimap.lang.Translations.COMPLEX_TITLE_FIELD_NAME)));
    title = title.split(', ')[0];
    title = munimap.style.alignTextToRows(title.split(' '), ' ');
    var style = new ol.style.Style({
      geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
      text: new ol.style.Text({
        font: 'bold ' + munimap.complex.FONT_SIZE + 'px arial',
        fill: munimap.style.TEXT_FILL,
        stroke: munimap.style.TEXT_STROKE,
        text: title
      }),
      zIndex: 1
    });
    var result = style;

    munimap.style.LABEL_CACHE[uid] = result;
    return result;
  }
  return null;
};


/**
 * @param {munimap.complex.loadByIds.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>}
 */
munimap.complex.loadByIds = function(options) {
  return munimap.load.features({
    source: munimap.complex.STORE,
    type: munimap.complex.TYPE,
    method: 'POST',
    returnGeometry: true,
    where: 'inetId IN (' + options.ids.join() + ')',
    processor: options.processor
  });
};


/**
 * @typedef {{
 *   ids: (Array<number>),
 *   processor: (munimap.load.Processor|undefined)
 * }}
 */
munimap.complex.loadByIds.Options;


/**
 * @param {ol.Feature} complex
 * @return {Array<ol.Feature>}
 */
munimap.complex.getUnits = function(complex) {
  var result = complex.get(munimap.complex.UNITS_FIELD_NAME);
  goog.asserts.assert(result === null || result instanceof Array);
  return result;
};


