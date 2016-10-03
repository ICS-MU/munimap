goog.provide('ics.map.poi.STYLE');
goog.provide('ics.map.poi.style');

goog.require('ol.Feature');
goog.require('ol.render.Feature');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.RegularShape');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


/**
 * @enum {ics.map.Range}
 * @const
 */
ics.map.poi.style.Resolution = {
  INFORMATION: ics.map.floor.RESOLUTION,
  STAIRS: ics.map.range.createResolution(0, 0.15),
  TOILET: ics.map.range.createResolution(0, 0.13)
};


/**
 * @type {number}
 * @protected
 * @const
 */
ics.map.poi.style.RADIUS = 7;


/**
 * @type {ol.style.Fill}
 * @protected
 * @const
 */
ics.map.poi.style.FILL = new ol.style.Fill({
  color: [255, 255, 255, 1]
});


/**
 * @type {ol.style.Stroke}
 * @protected
 * @const
 */
ics.map.poi.style.STROKE = new ol.style.Stroke({
  color: [0, 0, 0, 1],
  width: 1.2
});


/**
 * @type {ol.style.Style}
 * @const
 */
ics.map.poi.STYLE = new ol.style.Style({
  image: new ol.style.Circle({
    radius: ics.map.poi.style.RADIUS,
    fill: ics.map.poi.style.FILL,
    stroke: ics.map.poi.style.STROKE
  })
});


/**
 * @type {number}
 * @const
 */
ics.map.poi.style.ICON_HEIGHT = 24;


/**
 * @type {ol.style.Style}
 * @const
 */
ics.map.poi.style.BACKGROUND_SQUARE = new ol.style.Style({
  text: new ol.style.Text({
    text: '\uf0c8',
    font: 'normal ' + ics.map.poi.style.ICON_HEIGHT + 'px MunimapFont',
    fill: new ol.style.Fill({
      color: '#666'
    })
  })
});


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
ics.map.poi.style.ELEVATOR = [
  ics.map.poi.style.BACKGROUND_SQUARE,
  new ol.style.Style({
    text: new ol.style.Text({
      text: '\uf183\uf07d',
      font: 'normal 16px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    })
  })
];


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
ics.map.poi.style.ENTRANCE = [
  ics.map.poi.style.BACKGROUND_SQUARE,
  new ol.style.Style({
    text: new ol.style.Text({
      text: '\uf090',
      font: 'normal 16px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    })
  })
];


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
ics.map.poi.style.INFORMATION = [
  ics.map.poi.style.BACKGROUND_SQUARE,
  new ol.style.Style({
    text: new ol.style.Text({
      text: '\uf129',
      offsetY: 1,
      font: 'normal 18px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    })
  })
];


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
ics.map.poi.style.TOILET = [
  ics.map.poi.style.BACKGROUND_SQUARE,
  new ol.style.Style({
    text: new ol.style.Text({
      text: '\uf182\uf183',
      font: 'normal 14px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    })
  })
];


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
ics.map.poi.style.TOILET_IM = [
  ics.map.poi.style.BACKGROUND_SQUARE,
  new ol.style.Style({
    text: new ol.style.Text({
      text: '\uf193',
      font: 'bold 16px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    })
  })
];


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
ics.map.poi.style.TOILET_M = [
  ics.map.poi.style.BACKGROUND_SQUARE,
  new ol.style.Style({
    text: new ol.style.Text({
      text: '\uf183',
      font: 'normal 18px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    })
  })
];


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
ics.map.poi.style.TOILET_W = [
  ics.map.poi.style.BACKGROUND_SQUARE,
  new ol.style.Style({
    text: new ol.style.Text({
      text: '\uf182',
      font: 'normal 18px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    })
  })
];


/**
 * @param {ics.map.load.floorBasedActive.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
ics.map.poi.style.function = function(options, feature, resolution) {
  var result = ics.map.poi.STYLE;
  var poiType = feature.get('typ');
  var showInfo = ics.map.range.contains(
      ics.map.poi.style.Resolution.INFORMATION, resolution);
  var showToilets =
      ics.map.range.contains(ics.map.poi.style.Resolution.TOILET, resolution);
  var showStairs =
      ics.map.range.contains(ics.map.poi.style.Resolution.STAIRS, resolution);
  switch (poiType) {
    case ics.map.poi.Purpose.INFORMATION_POINT:
      result = showInfo ? ics.map.poi.style.INFORMATION : null;
      break;
    case ics.map.poi.Purpose.ELEVATOR:
      result = showStairs ? ics.map.poi.style.ELEVATOR : null;
      break;
    case ics.map.poi.Purpose.BUILDING_ENTRANCE:
    case ics.map.poi.Purpose.BUILDING_COMPLEX_ENTRANCE:
      var floorCode = feature.get('polohKodPodlazi');
      var defaultFloor =
          goog.asserts.assertNumber(feature.get('vychoziPodlazi'));
      var activeFloors = ics.map.floor.getActiveFloors(options.map);
      var notInBldgWithActiveFloor = activeFloors.every(function(floor) {
        var bldgCode = floor.substr(0, 5);
        return !floorCode.startsWith(bldgCode);
      });
      var showEntrance =
          !ics.map.range.contains(ics.map.floor.RESOLUTION, resolution) ||
          (activeFloors.indexOf(floorCode) > -1 ||
          (notInBldgWithActiveFloor && defaultFloor === 1));
      result = showEntrance ? ics.map.poi.style.ENTRANCE : null;
      break;
    case ics.map.poi.Purpose.COMPLEX_ENTRANCE:
      result = ics.map.poi.style.ENTRANCE;
      break;
    case ics.map.poi.Purpose.TOILET_IMMOBILE:
      result = showToilets ? ics.map.poi.style.TOILET_IM : null;
      break;
    case ics.map.poi.Purpose.TOILET_MEN:
      result = showToilets ? ics.map.poi.style.TOILET_M : null;
      break;
    case ics.map.poi.Purpose.TOILET_WOMEN:
      result = showToilets ? ics.map.poi.style.TOILET_W : null;
      break;
    case ics.map.poi.Purpose.TOILET:
      result = showToilets ? ics.map.poi.style.TOILET : null;
      break;
    case ics.map.poi.Purpose.CLASSROOM:
      result = null;
      break;
  }
  return result;
};
