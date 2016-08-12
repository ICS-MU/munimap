goog.provide('ics.map.complex');
goog.provide('ics.map.complex.style');

goog.require('ics.map.load');
goog.require('ics.map.range');
goog.require('ics.map.store');
goog.require('ics.map.style');
goog.require('ol.source.Vector');
goog.require('ol.style.Style');
goog.require('ol.style.Text');


/**
 * @type {ics.map.Range}
 * @const
 */
ics.map.complex.RESOLUTION = ics.map.range.createResolution(1.19, 6.4);


/**
 * @type {string}
 */
ics.map.complex.ID_FIELD_NAME = 'inetId';


/**
 * @type {string}
 */
ics.map.complex.UNITS_FIELD_NAME = 'pracoviste';


/**
 *
 * @type {number}
 * @protected
 */
ics.map.complex.FONT_SIZE = 14;


/**
 * @type {ol.source.Vector}
 * @const
 */
ics.map.complex.STORE = new ol.source.Vector();


/**
 *
 * @type {ics.map.type.Options}
 */
ics.map.complex.TYPE = {
  primaryKey: ics.map.complex.ID_FIELD_NAME,
  serviceUrl: ics.map.load.MUNIMAP_URL,
  store: ics.map.complex.STORE,
  layerId: 4,
  name: 'complex'
};


/**
 * @param {number} id
 * @param {Array.<ol.Feature>=} opt_features
 * @return {ol.Feature} building
 */
ics.map.complex.getById = function(id, opt_features) {
  var features = opt_features || ics.map.complex.STORE.getFeatures();
  var result = features.find(function(feature) {
    var idProperty = ics.map.complex.TYPE.primaryKey;
    return feature.get(idProperty) === id;
  });
  return result || null;
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
ics.map.complex.isComplex = function(feature) {
  var fType = feature.get(ics.map.type.NAME);
  return fType === ics.map.complex.TYPE;
};


/**
 * @param {ics.map.style.MarkersAwareOptions} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array<ol.style.Style>}
 */
ics.map.complex.style.function = function(options, feature, resolution) {
  var showLabel = true;
  var markerSource = options.markerSource;
  var markers = markerSource.getFeatures();
  if (markers.length && ics.map.building.isBuilding(markers[0])) {
    var buildingCount = /**@type {number}*/(feature.get('pocetBudov'));
    if (buildingCount === 1) {
      var complexId =
          /**@type {number}*/(feature.get(ics.map.complex.ID_FIELD_NAME));
      showLabel = !markers.some(function(marker) {
        var markerComplexId = marker.get('arealId');
        if (goog.isDefAndNotNull(markerComplexId)) {
          goog.asserts.assertNumber(markerComplexId);
          return markerComplexId === complexId;
        }
        return false;
      });
    }
  }
  if (showLabel) {
    var uid = ics.map.store.getUid(feature);
    goog.asserts.assertString(uid);
    if (ics.map.style.LABEL_CACHE[uid]) {
      return ics.map.style.LABEL_CACHE[uid];
    }
    goog.asserts.assertInstanceof(feature, ol.Feature);
    var title = /**@type {string}*/ (feature.get('nazevPrez'));
    title = title.split(', ')[0];

    var style;
    var units = ics.map.complex.getUnits(feature);
    if (units.length > 0) {
      var titleParts = ics.map.unit.getTitleParts(units);
      titleParts.push(title);
      style = ics.map.style.getLabelWithPin(titleParts.join('\n'),
          ics.map.geom.CENTER_GEOMETRY_FUNCTION, ics.map.complex.FONT_SIZE);
    } else {
      title = ics.map.style.alignTextToRows(title.split(' '), ' ');
      style = new ol.style.Style({
        geometry: ics.map.geom.CENTER_GEOMETRY_FUNCTION,
        text: new ol.style.Text({
          font: 'bold ' + ics.map.complex.FONT_SIZE + 'px arial',
          fill: ics.map.style.TEXT_FILL,
          stroke: ics.map.style.TEXT_STROKE,
          text: title
        }),
        zIndex: 1
      });
    }
    var result = style;
    goog.asserts.assertString(uid);
    ics.map.style.LABEL_CACHE[uid] = result;
    return result;
  }
  return null;
};


/**
 * @param {ics.map.complex.loadByIds.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>}
 */
ics.map.complex.loadByIds = function(options) {
  return ics.map.load.features({
    source: ics.map.complex.STORE,
    type: ics.map.complex.TYPE,
    method: 'POST',
    returnGeometry: true,
    where: 'inetId IN (' + options.ids.join() + ')',
    processor: options.processor
  });
};


/**
 * @typedef {{
 *   ids: (Array<number>),
 *   processor: (ics.map.load.Processor|undefined)
 * }}
 */
ics.map.complex.loadByIds.Options;


/**
 * @param {ol.Feature} complex
 * @return {Array<ol.Feature>}
 */
ics.map.complex.getUnits = function(complex) {
  var result = complex.get(ics.map.complex.UNITS_FIELD_NAME);
  goog.asserts.assert(result === null || result instanceof Array);
  return result;
};


