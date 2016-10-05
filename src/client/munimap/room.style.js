goog.provide('munimap.room.STYLE');
goog.provide('munimap.room.style');

goog.require('munimap.style');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


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
munimap.room.style.corridor;


/**
 * @type {Array<ol.style.Style>}
 */
munimap.room.style.staircase;


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
munimap.room.style.STAIRCASE_STYLE_ICON = [
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
 *
 * @param {ol.events.Event} event
 */
munimap.room.style.setCorridorStyle = function(event) {
  if (!goog.isDefAndNotNull(munimap.room.style.corridor)) {
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
 * @param {munimap.room.style.function.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.room.style.function = function(options, feature, resolution) {
  var markerSource = options.markerSource;
  var markers = markerSource.getFeatures();
  var marked = markers.indexOf(feature) >= 0;

  var locCode = /**@type {string}*/ (feature.get('polohKod'));
  var activeFlooors = munimap.floor.getActiveFloors(options.map);
  var inActiveBuilding = activeFlooors.some(function(floor) {
    return locCode.startsWith(floor.substr(0, 5));
  });
  var result;
  if (marked) {
    if (options.isActive || !inActiveBuilding) {
      result = munimap.marker.style.ROOM;
    } else {
      result = null;
    }
  } else {
    result = munimap.room.STYLE;
    if (options.isActive || !inActiveBuilding) {
      var purposeGroup = feature.get('ucel_skupina_nazev');
      var purpose = feature.get('ucel_nazev');
      var purpose_gis = feature.get('ucel_gis');
      var purposesToOmit = [
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
      switch (purposeGroup) {
        case 'komunikace obecně':
          if (purposesToOmit.indexOf(purpose) === -1) {
            if (purpose === 'schodiště') {
              if (options.isActive && munimap.range.contains(
                  munimap.poi.style.Resolution.STAIRS, resolution)) {
                result = goog.array.concat(munimap.room.style.staircase,
                    munimap.room.style.STAIRCASE_STYLE_ICON);
              } else {
                result = munimap.room.style.staircase;
              }
            } else {
              result = munimap.room.style.corridor;
            }
          } else if (purpose_gis === 'výtah') {
            result = munimap.room.style.corridor;
          }
          break;
      }
    } else {
      result = null;
    }
  }
  return result;
};


/**
 * @typedef {{
 *   markerSource: ol.source.Vector,
 *   isActive: (boolean),
 *   map: ol.Map
 * }}
 */
munimap.room.style.function.Options;


/**
 * @type {Object.<string, ol.style.Style|Array.<ol.style.Style>>}
 * @const
 */
munimap.room.style.LABEL_CACHE = {};


/**
 * @param {munimap.style.MarkersAwareOptions} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.room.style.labelFunction = function(options, feature, resolution) {
  var locCode = /**@type {string}*/(feature.get('polohKod'));
  var result = [];
  var map = options.map;
  goog.asserts.assertInstanceof(map, ol.Map);
  var activeFloor = munimap.getVars(map).activeFloor;
  if (activeFloor && locCode.startsWith(activeFloor.locationCode)) {
    var markerSource = options.markerSource;
    var markers = markerSource.getFeatures();
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
        var title;
        var fTitle = feature.get('nazev') || feature.get('cislo');
        if (fTitle) {
          title = goog.asserts.assertString(fTitle);
          title = munimap.room.style.alignRoomTitleToRows(title);
          var purpose = feature.get('ucel_gis');
          var fontSize;
          if (munimap.range.contains(
              munimap.room.label.big.RESOLUTION, resolution)) {
            fontSize = 11;
          } else {
            fontSize = 9;
          }
          var textFont = 'bold ' + fontSize + 'px arial';
          var offset;
          if (goog.isDefAndNotNull(purpose) &&
              purpose === munimap.poi.Purpose.CLASSROOM) {
            var labelHeight = munimap.style.getLabelHeight(title, fontSize);
            var overallHeight = labelHeight + munimap.poi.style.ICON_HEIGHT + 2;
            var iconOffset =
                - (overallHeight - munimap.poi.style.ICON_HEIGHT) / 2;
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
