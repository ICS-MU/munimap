goog.provide('ics.map.room.STYLE');
goog.provide('ics.map.room.style');

goog.require('ics.map.style');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


/**
 * @type {ol.style.Fill}
 * @const
 */
ics.map.room.style.FILL = new ol.style.Fill({
  color: '#ffffff'
});


/**
 * @type {ol.style.Style}
 * @const
 */
ics.map.room.style.STROKE = new ol.style.Style({
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
ics.map.room.STYLE = [
  new ol.style.Style({
    fill: ics.map.room.style.FILL,
    zIndex: 0
  }),
  ics.map.room.style.STROKE
];


/**
 * @type {Array<ol.style.Style>}
 */
ics.map.room.style.corridor;


/**
 * @type {Array<ol.style.Style>}
 */
ics.map.room.style.staircase;


/**
 *
 * @param {ol.events.Event} event
 */
ics.map.room.style.setCorridorStyle = function(event) {
  if (!goog.isDefAndNotNull(ics.map.room.style.corridor)) {
    var context = event.context;
    var image = new Image();
    image.src = jpad.DEV ? './room.style.coridors.bg.png' :
            '//maps.muni.cz/munimap/ics/map/room.style.coridors.bg.png';
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
      ics.map.room.style.corridor =
          [corridorBackground, corridorStyle, ics.map.room.style.STROKE];
      ics.map.room.style.staircase =
          [staircaseBackground, corridorStyle, ics.map.room.style.STROKE];
    };
  }
};


/**
 * @param {ics.map.room.style.function.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
ics.map.room.style.function = function(options, feature, resolution) {
  var markerSource = options.markerSource;
  var markers = markerSource.getFeatures();
  var marked = markers.indexOf(feature) >= 0;

  var locCode = /**@type {string}*/ (feature.get('polohKod'));
  var activeFlooors = ics.map.floor.getActiveFloors();
  var inActiveBuilding = activeFlooors.some(function(floor) {
    return locCode.startsWith(floor.substr(0, 5));
  });
  var result;
  if (marked) {
    if (options.isActive || !inActiveBuilding) {
      result = ics.map.marker.style.ROOM;
    } else {
      result = null;
    }
  } else {
    result = ics.map.room.STYLE;
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
              result = ics.map.room.style.staircase;
            } else {
              result = ics.map.room.style.corridor;
            }
          } else if (purpose_gis === 'výtah') {
            result = ics.map.room.style.corridor;
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
 *   isActive: (boolean)
 * }}
 */
ics.map.room.style.function.Options;


/**
 * @type {Object.<string, ol.style.Style|Array.<ol.style.Style>>}
 * @const
 */
ics.map.room.style.LABEL_CACHE = {};


/**
 * @param {ics.map.style.MarkersAwareOptions} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
ics.map.room.style.labelFunction = function(options, feature, resolution) {
  var locCode = /**@type {string}*/(feature.get('polohKod'));
  var result = [];
  if (ics.map.floor.active &&
      locCode.startsWith(ics.map.floor.active.locationCode)) {
    var markerSource = options.markerSource;
    var markers = markerSource.getFeatures();
    var labelCache;
    if (ics.map.range.contains(ics.map.room.label.big.RESOLUTION, resolution)) {
      labelCache = ics.map.room.style.LABEL_CACHE;
    } else {
      labelCache = ics.map.style.LABEL_CACHE;
    }
    if (markers.indexOf(feature) === -1) {
      var uid = ics.map.store.getUid(feature);
      if (uid) {
        goog.asserts.assertString(uid);
        if (labelCache[uid]) {
          return labelCache[uid];
        }
        var title;
        var fTitle = feature.get('nazev') || feature.get('cislo');
        if (fTitle) {
          title = goog.asserts.assertString(fTitle);
          title = ics.map.room.style.alignRoomTitleToRows(title);
          var purpose = feature.get('ucel_gis');
          var fontSize;
          if (ics.map.range.contains(
              ics.map.room.label.big.RESOLUTION, resolution)) {
            fontSize = 11;
          } else {
            fontSize = 9;
          }
          var textFont = 'bold ' + fontSize + 'px arial';
          var offset;
          if (goog.isDefAndNotNull(purpose) &&
              purpose === ics.map.poi.Purpose.CLASSROOM) {
            var labelHeight = ics.map.style.getLabelHeight(title, fontSize);
            var overallHeight = labelHeight + ics.map.poi.style.ICON_HEIGHT + 2;
            var iconOffset =
                - (overallHeight - ics.map.poi.style.ICON_HEIGHT) / 2;
            offset = (overallHeight - labelHeight) / 2;
            goog.array.extend(
                result, ics.map.room.style.getClassroomIcon(iconOffset));
          }
          var textStyle = new ol.style.Style({
            geometry: ics.map.geom.CENTER_GEOMETRY_FUNCTION,
            text: new ol.style.Text({
              font: textFont,
              offsetY: offset,
              fill: ics.map.style.TEXT_FILL,
              stroke: ics.map.style.TEXT_STROKE,
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
ics.map.room.style.alignRoomTitleToRows = function(title) {
  if (title.indexOf(' / ') >= 0) {
    var mainParts = title.split(' / ');
    mainParts = mainParts.map(function(part) {
      var result = part;
      if (part.indexOf(' ') >= 0) {
        var parts = part.split(' ');
        result = ics.map.style.alignTextToRows(parts, ' ');
      }
      return result;
    });
    title = mainParts.join(' /\n');
  } else {
    if (title.indexOf(' ') >= 0) {
      var parts = title.split(' ');
      title = ics.map.style.alignTextToRows(parts, ' ');
    }
  }
  return title;
};


/**
 * @param {number} offsetY
 * @return {Array.<ol.style.Style>}
 * @protected
 */
ics.map.room.style.getClassroomIcon = function(offsetY) {
  var background = new ol.style.Style({
    geometry: ics.map.geom.CENTER_GEOMETRY_FUNCTION,
    text: new ol.style.Text({
      text: '\uf0c8',
      offsetY: offsetY,
      font: 'normal ' + ics.map.poi.style.ICON_HEIGHT + 'px FontAwesome',
      fill: new ol.style.Fill({
        color: '#666'
      })
    }),
    zIndex: 5
  });
  var style = [
    background,
    new ol.style.Style({
      geometry: ics.map.geom.CENTER_GEOMETRY_FUNCTION,
      text: new ol.style.Text({
        text: '\uf19d',
        offsetY: offsetY,
        font: 'normal 15px FontAwesome',
        fill: new ol.style.Fill({
          color: 'white'
        })
      }),
      zIndex: 5
    })
  ];
  return style;
};
