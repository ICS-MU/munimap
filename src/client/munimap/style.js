goog.provide('munimap.style');

goog.require('munimap.geom');
goog.require('munimap.style.fragment');


/**
 *
 * @typedef {
 *    function(ol.Feature, ?string, Array.<string>): boolean
 * }
 */
munimap.style.FilterFunction;


/**
 * @typedef {
 *    function(munimap.style.Function.Options, ol.Feature, number):
 *      (ol.style.Style|Array.<ol.style.Style>)
 * }
 */
munimap.style.Function;


/**
 * @typedef {{
 *   markers:? Array.<ol.Feature>
 * }}
 */
munimap.style.Function.Options;


/**
 * @type {Object.<string, ol.style.Style|Array.<ol.style.Style>>}
 * @const
 */
munimap.style.LABEL_CACHE = {};


/**
 * @type {ol.style.Fill}
 * @const
 */
munimap.style.TEXT_FILL = new ol.style.Fill({
  color: '#002776'
});


/**
 * @type {ol.style.Stroke}
 * @const
 */
munimap.style.TEXT_STROKE = new ol.style.Stroke({
  color: '#ffffff',
  width: 4
});


/**
 * @type {ol.style.Fill}
 * @const
 */
munimap.style.NO_GEOMETRY_FILL = new ol.style.Fill({
  color: '#dfdfdf'
});


/**
 * @type {number}
 * @const
 */
munimap.style.PIN_SIZE = 25;


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.style.PIN = new ol.style.Style({
  geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
  text: new ol.style.Text({
    text: '\uf041',
    font: 'normal ' + munimap.style.PIN_SIZE + 'px MunimapFont',
    fill: munimap.style.TEXT_FILL,
    offsetY: - munimap.style.PIN_SIZE / 2,
    stroke: munimap.style.TEXT_STROKE
  }),
  zIndex: 6
});


/**
 * The same options are munimap.marker.style.labelFunction.Options
 * @typedef {{
 *   markerSource: ol.source.Vector,
 *   markerLabel: (munimap.marker.LabelFunction|undefined),
 *   map: (ol.Map|undefined)
 * }}
 */
munimap.style.MarkersAwareOptions;


/**
 * @typedef {{
 *    resolution: number,
 *    color: string,
 *    opacity: number
 * }}
 */
munimap.style.ResolutionColorObject;


/**
 * @type {Array.<munimap.style.ResolutionColorObject>}
 * @const
 */
munimap.style.RESOLUTION_COLOR = [
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
munimap.style.CHAR_HEIGHT_WIDTH_RATIO = 3 / 2;


/**
 * @param {Array.<string>} parts
 * @param {string} separator
 * @return {string}
 */
munimap.style.alignTextToRows = function(parts, separator) {
  var maxLength = 0;
  var charCount = 0;
  parts.forEach(function(part) {
    charCount += part.length;
    if (part.length > maxLength) {
      maxLength = part.length;
    }
  });
  var charsPerRow = Math.ceil(Math.sqrt(
      munimap.style.CHAR_HEIGHT_WIDTH_RATIO * charCount));
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
 * @param {ol.Map} map
 * @param {munimapx.style.fragment.LayerOptions} fragments
 * @return {ol.style.StyleFunction}
 */
munimap.style.createFromFragments = function(map, fragments) {
  var resolution = map.getView().getResolution();
  var showIndoor = goog.isDef(resolution) &&
      munimap.range.contains(munimap.floor.RESOLUTION, resolution);

  var selectedFloor;
  var activeFloors;
  if (showIndoor) {
    var selectedFloorOpts = munimap.getProps(map).selectedFloor;
    selectedFloor = selectedFloorOpts ? selectedFloorOpts.locationCode : null;
    activeFloors = munimap.floor.getActiveFloors(map);
  } else {
    selectedFloor = null;
    activeFloors = [];
  }

  /**
   * @param {ol.Feature} feature
   * @param {number} resolution
   * @return {ol.style.Style|Array.<ol.style.Style>}
   */
  var styleFce = function(feature, resolution) {
    /**
     * @param {munimap.style.fragment.Options} fragment
     * @return {boolean|undefined}
     */
    var testFragment = function(fragment) {
      if (fragment) {
        return fragment.filter(feature, selectedFloor, activeFloors);
      }
      return undefined;
    };

    var style;
    if (showIndoor) {
      munimap.style.fragment.ORDER.find(function(frag) {
        var fragment = fragments[frag];
        if (testFragment(fragment)) {
          style = fragment.style;
          return true;
        }
        return false;
      });
    } else {
      var fragment = fragments['outdoorFeature'];
      if (testFragment(fragment)) {
        style = fragment.style;
      }
    }
    if (style && goog.isFunction(style)) {
      var opts = {
        markers: munimap.marker.getStore(map).getFeatures()
      };
      return style(opts, feature, resolution);
    }
    return style;
  };

  return styleFce;
};


/**
 * @param {ol.Map} map
 * @param {ol.layer.Vector} layer
 */
munimap.style.refreshFromFragments = function(map, layer) {
  var refreshStyle = layer.get('refreshStyleOnFloorChange');
  if (goog.isDef(refreshStyle) && refreshStyle) {
    var fragments = /**@type {munimapx.style.fragment.LayerOptions}*/
        (layer.get('styleFragments'));
    var style = munimap.style.createFromFragments(map, fragments);
    layer.setStyle(style);
  }
};


/**
 * @param {ol.Map} map
 */
munimap.style.refreshAllFromFragments = function(map) {
  var layers = map.getLayers();
  layers.forEach(function(layer) {
    munimap.style.refreshFromFragments(map, layer);
  });
};


/**
 *
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {string|undefined}
 */
munimap.style.getDefaultLabel = function(feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var title;
  var uid = munimap.store.getUid(feature);
  goog.asserts.assert(!!uid);
  if (munimap.building.isBuilding(feature)) {
    title = munimap.building.getDefaultLabel(feature, resolution);
    goog.asserts.assertString(title);
  } else if (munimap.marker.custom.isCustom(feature)) {
    return munimap.marker.custom.getLabel(feature);
  } else {
    title = munimap.room.getDefaultLabel(feature);
  }
  return title;
};


/**
 * @param {string} title
 * @param {number} fontSize
 * @return {number}
 */
munimap.style.getLabelHeight = function(title, fontSize) {
  var rowCount = title.split('\n').length;
  var lineHeight = 1.2 * fontSize;
  return rowCount * lineHeight;
};


/**
 * @param {munimap.style.getLabelWithPin.Options} options
 * @return {ol.style.Style}
 */
munimap.style.getTextStyleWithOffsetY = function(options) {
  var fontSize = options.fontSize;
  var title = options.title;

  var result;
  if (goog.isDef(title) && goog.isDef(fontSize)) {
    result = new ol.style.Style({
      geometry: options.geometry,
      text: new ol.style.Text({
        font: 'bold ' + fontSize + 'px arial',
        fill: options.fill,
        offsetY: munimap.style.getLabelHeight(title, fontSize) / 2 + 2,
        stroke: munimap.style.TEXT_STROKE,
        text: title
      }),
      zIndex: options.zIndex || 4
    });
  }
  return result || null;
};


/**
 * @param {munimap.style.getLabelWithPin.Options} options
 * @return {Array.<ol.style.Style>}
 */
munimap.style.getLabelWithPin =
    function(options) {
  var fill = options.fill;
  var geometry = options.geometry;
  var zIndex = options.zIndex;

  var result = [];
  var pin = new ol.style.Style({
    geometry: geometry,
    text: new ol.style.Text({
      text: '\uf041',
      font: 'normal ' + munimap.style.PIN_SIZE + 'px MunimapFont',
      fill: fill,
      offsetY: - munimap.style.PIN_SIZE / 2,
      stroke: munimap.style.TEXT_STROKE
    }),
    zIndex: zIndex || 5
  });
  result.push(pin);

  if (goog.isDefAndNotNull(options.title)) {
    var textStyle = munimap.style.getTextStyleWithOffsetY(options);
    result.push(textStyle);
  }
  return result;
};


/**
 * @typedef {{
 *   fill: (ol.style.Fill),
 *   fontSize: (number|undefined),
 *   geometry: (function(ol.Feature):ol.geom.Geometry|ol.geom.Geometry),
 *   title: (string|undefined),
 *   zIndex: (number|undefined)
 * }}
 */
munimap.style.getLabelWithPin.Options;
