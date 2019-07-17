goog.provide('munimap.room.STYLE');
goog.provide('munimap.room.style');

goog.require('munimap.lang');
goog.require('munimap.style');


/**
 * @type {number}
 */
munimap.room.style.SMALL_FONT_SIZE = 9;


/**
 * @type {number}
 */
munimap.room.style.FONT_SIZE = 11;


/**
 * @type {ol.style.Fill}
 * @const
 */
munimap.room.style.FILL = new ol.style.Fill({
  color: '#ffffff'
});


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.room.style.STROKE = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: '#99a9c8',
    width: 1
  }),
  zIndex: 4
});


/**
 * @type {Array.<ol.style.Style>}
 * @const
 */
munimap.room.STYLE = [
  new ol.style.Style({
    fill: munimap.room.style.FILL,
    zIndex: 0
  }),
  munimap.room.style.STROKE
];


/**
 * @type {Array<ol.style.Style>}
 */
munimap.room.style.corridor = [];


/**
 * @type {Array<ol.style.Style>}
 */
munimap.room.style.staircase = [];


/**
 * @type {ol.style.Style}
 * @protected
 * @const
 */
munimap.room.style.STAIRCASE_BACKGROUND_ICON = new ol.style.Style({
  geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
  text: new ol.style.Text({
    text: '\uf0c8',
    font: 'normal ' + munimap.poi.style.ICON_HEIGHT + 'px MunimapFont',
    fill: new ol.style.Fill({
      color: '#666'
    })
  }),
  zIndex: 5
});


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
munimap.room.style.STAIRCASE_ICON = [
  munimap.room.style.STAIRCASE_BACKGROUND_ICON,
  new ol.style.Style({
    geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
    text: new ol.style.Text({
      text: '\ue800',
      font: 'normal 16px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    }),
    zIndex: 5
  })
];


/**
 * @param {ol.render.Event} event
 */
munimap.room.style.setCorridorStyle = function(event) {
  if (munimap.room.style.corridor.length === 0) {
    var context = event.context;
    var image = new Image();
    var imgsrc = './room.style.coridors.bg.png';
    if (!jpad.DEV) {
      imgsrc = '//' + jpad.PROD_DOMAIN + imgsrc;
    }
    image.src = imgsrc;
    image.onload = function() {
      var pattern = context.createPattern(image, 'repeat');
      var corridorFill = new ol.style.Fill({
        color: pattern
      });
      var corridorStyle = new ol.style.Style({
        fill: corridorFill,
        zIndex: 1
      });
      var corridorBackground = new ol.style.Style({
        fill: new ol.style.Fill({
          color: '#ffffff'
        })
      });
      var staircaseBackground = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(153,169, 200, 0.4)'
        }),
        zIndex: 1
      });
      munimap.room.style.corridor =
        [corridorBackground, corridorStyle, munimap.room.style.STROKE];
      munimap.room.style.staircase =
        [staircaseBackground, corridorStyle, munimap.room.style.STROKE];
    };
  }
};


/**
 * Filter function of a style fragment (type munimap.style.FilterFunction).
 *
 * @param {ol.Feature} feature
 * @param {?string} selectedFloorCode
 * @param {Array.<string>} activeFloorCodes
 * @return {boolean}
 */
munimap.room.style.selectedFloorFilter =
  function(feature, selectedFloorCode, activeFloorCodes) {
    if (goog.isDefAndNotNull(selectedFloorCode)) {
      var locCode = /**@type {string}*/ (feature.get('polohKod'));
      return locCode.startsWith(selectedFloorCode);
    }
    return false;
  };


/**
 * Filter function of a style fragment (type munimap.style.FilterFunction).
 *
 * @param {ol.Feature} feature
 * @param {?string} selectedFloorCode
 * @param {Array.<string>} activeFloorCodes
 * @return {boolean}
 */
munimap.room.style.activeFloorFilter =
  function(feature, selectedFloorCode, activeFloorCodes) {
    var locCode = /**@type {string}*/ (feature.get('polohKod'));
    return activeFloorCodes.some(function(floor) {
      return locCode.startsWith(floor);
    });
  };


/**
 * Filter function of a style fragment (type munimap.style.FilterFunction).
 *
 * @param {ol.Feature} feature
 * @param {?string} selectedFloorCode
 * @param {Array.<string>} activeFloorCodes
 * @return {boolean}
 */
munimap.room.style.defaultFloorFilter =
  function(feature, selectedFloorCode, activeFloorCodes) {
    var locCode = /**@type {string}*/ (feature.get('polohKod'));
    return !activeFloorCodes.some(function(floor) {
      return locCode.startsWith(floor.substr(0, 5));
    });
  };


/**
 * Style function of a style fragment (type munimap.style.Function).
 *
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.room.style.activeFunction = function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var result = munimap.room.style.function(options, feature, resolution);
  if (munimap.range.contains(
    munimap.poi.style.Resolution.STAIRS, resolution) &&
    result === munimap.room.style.staircase) {
    result = goog.array.concat(
      result, munimap.room.style.STAIRCASE_ICON);
  }
  return result;
};


/**
 * Style function of a style fragment (type munimap.style.Function).
 *
 *
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.room.style.function = function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var markers = options.markers;
  var marked = markers.indexOf(feature) >= 0;

  var result;
  if (marked) {
    result = munimap.room.style.getStyle(feature, munimap.marker.style, marked);
  } else {
    result = munimap.room.style.getStyle(feature, munimap.room.style, marked);
  }
  return result;
};

/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {Object} style
 * @param {boolean} marked
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.room.style.getStyle = function(feature, style, marked) {
  var purposeGroup = feature.get('ucel_skupina_nazev');
  var purpose = /** @type {string} */ (feature.get('ucel_nazev'));
  var purpose_gis = feature.get('ucel_gis');
  var result = marked ? style.ROOM : munimap.room.STYLE;
  switch (purposeGroup) {
    case 'komunikace obecně':
      if (munimap.room.style.PURPOSES_TO_OMIT.indexOf(purpose) === -1) {
        if (purpose === 'schodiště') {
          if (marked) {
            result = style.ROOM;
          } else {
            result = style.staircase;
          }
        } else {
          result = style.corridor;
        }
      } else if (purpose_gis === 'výtah') {
        result = style.corridor;
      }
      break;
  }
  return result;
};


/**
 * @type {Array.<string>}
 * @const
 */
munimap.room.style.PURPOSES_TO_OMIT = [
  'angl.dvorek',
  'balkon',
  'manipulační prostory',
  'nevyužívané prostory', //also gateaway which are not used for drive in,
  //but can be used as corridor
  'plocha pod schodištěm',
  'předsíň', //also some corridors
  'příjem', //receptions
  'rampa', //somewhere is maybe an entrance
  'světlík',
  'šachta',
  'vrátnice',
  'výtah' //shown due to ucel_gis
];


/**
 * @type {Object.<string, ol.style.Style|Array.<ol.style.Style>>}
 * @const
 */
munimap.room.style.LABEL_CACHE = {};


/**
 * Style function of a style fragment (type munimap.style.Function).
 *
 *
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.room.style.labelFunction = function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);

  var result = [];
  var markers = options.markers;

  var labelCache;
  if (munimap.range.contains(munimap.room.label.big.RESOLUTION, resolution)) {
    labelCache = munimap.room.style.LABEL_CACHE;
  } else {
    labelCache = munimap.style.LABEL_CACHE;
  }

  if (markers.indexOf(feature) === -1) {
    var uid = munimap.store.getUid(feature);
    if (uid) {
      goog.asserts.assertString(uid);
      if (labelCache[uid]) {
        return labelCache[uid];
      }
      goog.asserts.assertInstanceof(feature, ol.Feature);
      var title;
      var offset;
      var purposeGis = /**@type {string}*/ (feature.get('ucel_gis'));
      var showLocationCodes = munimap.getProps(options.map).locationCodes;
      var fontSize;
      if (munimap.range.contains(
        munimap.room.label.big.RESOLUTION, resolution)) {
        fontSize = munimap.room.style.FONT_SIZE;
      } else {
        fontSize = munimap.room.style.SMALL_FONT_SIZE;
      }
      var textFont = 'bold ' + fontSize + 'px arial';

      if (showLocationCodes) {
        title = /**@type {string}*/ (feature.get('polohKod'));
        var purposeTitle = /**@type {string}*/ (feature.get('ucel_nazev'));
        if (goog.isDefAndNotNull(purposeGis) &&
          (purposeGis === munimap.poi.Purpose.ELEVATOR ||
            purposeGis === munimap.poi.Purpose.INFORMATION_POINT)) {
          offset = munimap.poi.style.ICON_HEIGHT - 6;
        } else if (goog.isDefAndNotNull(purposeTitle) &&
          (purposeTitle === 'WC' || purposeTitle === 'schodiště')) {
          offset = munimap.poi.style.ICON_HEIGHT - 6;
        }
      } else {
        title = munimap.room.getDefaultLabel(feature);
      }
      if (title) {
        if (goog.isDefAndNotNull(purposeGis) &&
          purposeGis === munimap.poi.Purpose.CLASSROOM &&
          munimap.range.contains(munimap.poi.style.Resolution.STAIRS,
            resolution)) {
          var labelHeight = munimap.style.getLabelHeight(title, fontSize);
          var overallHeight =
            labelHeight + munimap.poi.style.ICON_HEIGHT + 2;
          var iconOffset =
            -(overallHeight - munimap.poi.style.ICON_HEIGHT) / 2;
          offset = (overallHeight - labelHeight) / 2;
          goog.array.extend(
            result, munimap.room.style.getClassroomIcon(iconOffset));
        }

        var textStyle = new ol.style.Style({
          geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
          text: new ol.style.Text({
            font: textFont,
            offsetY: offset,
            fill: munimap.style.TEXT_FILL,
            stroke: munimap.style.TEXT_STROKE,
            text: title
          }),
          zIndex: 4
        });
        goog.array.extend(result, textStyle);
      }
    }

    if (uid) {
      goog.asserts.assertString(uid);
      labelCache[uid] = result;
    }
  }

  return result.length ? result : null;
};


/**
 * @param {string} title
 * @return {string}
 */
munimap.room.style.alignRoomTitleToRows = function(title) {
  if (title.indexOf(' / ') >= 0) {
    var mainParts = title.split(' / ');
    mainParts = mainParts.map(function(part) {
      var result = part;
      if (part.indexOf(' ') >= 0) {
        var parts = part.split(' ');
        result = munimap.style.alignTextToRows(parts, ' ');
      }
      return result;
    });
    title = mainParts.join(' /\n');
  } else {
    if (title.indexOf(' ') >= 0) {
      var parts = title.split(' ');
      title = munimap.style.alignTextToRows(parts, ' ');
    }
  }
  return title;
};


/**
 * @param {number} offsetY
 * @return {Array.<ol.style.Style>}
 * @protected
 */
munimap.room.style.getClassroomIcon = function(offsetY) {
  var background = new ol.style.Style({
    geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
    text: new ol.style.Text({
      text: '\uf0c8',
      offsetY: offsetY,
      font: 'normal ' + munimap.poi.style.ICON_HEIGHT + 'px MunimapFont',
      fill: new ol.style.Fill({
        color: '#666'
      })
    }),
    zIndex: 5
  });
  var style = [
    background,
    new ol.style.Style({
      geometry: munimap.geom.CENTER_GEOMETRY_FUNCTION,
      text: new ol.style.Text({
        text: '\uf19d',
        offsetY: offsetY,
        font: 'normal 15px MunimapFont',
        fill: new ol.style.Fill({
          color: 'white'
        })
      }),
      zIndex: 5
    })
  ];
  return style;
};
