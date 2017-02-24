goog.provide('munimap.poi.STYLE');
goog.provide('munimap.poi.style');


/**
 * @enum {munimap.Range}
 * @const
 */
munimap.poi.style.Resolution = {
  INFORMATION: munimap.floor.RESOLUTION,
  STAIRS: munimap.range.createResolution(0, 0.15),
  TOILET: munimap.range.createResolution(0, 0.13),
  BUILDING_ENTRANCE: munimap.range.createResolution(0, 1.19)
};


/**
 * @type {number}
 * @protected
 * @const
 */
munimap.poi.style.RADIUS = 7;


/**
 * @type {ol.style.Fill}
 * @protected
 * @const
 */
munimap.poi.style.FILL = new ol.style.Fill({
  color: [255, 255, 255, 1]
});


/**
 * @type {ol.style.Stroke}
 * @protected
 * @const
 */
munimap.poi.style.STROKE = new ol.style.Stroke({
  color: [0, 0, 0, 1],
  width: 1.2
});


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.poi.STYLE = new ol.style.Style({
  image: new ol.style.Circle({
    radius: munimap.poi.style.RADIUS,
    fill: munimap.poi.style.FILL,
    stroke: munimap.poi.style.STROKE
  })
});


/**
 * @type {number}
 * @const
 */
munimap.poi.style.ICON_HEIGHT = 24;


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.poi.style.BACKGROUND_SQUARE = new ol.style.Style({
  text: new ol.style.Text({
    text: '\uf0c8',
    font: 'normal ' + munimap.poi.style.ICON_HEIGHT + 'px MunimapFont',
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
munimap.poi.style.ELEVATOR = [
  munimap.poi.style.BACKGROUND_SQUARE,
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
munimap.poi.style.ENTRANCE = [
  munimap.poi.style.BACKGROUND_SQUARE,
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
munimap.poi.style.INFORMATION = [
  munimap.poi.style.BACKGROUND_SQUARE,
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
munimap.poi.style.TOILET = [
  munimap.poi.style.BACKGROUND_SQUARE,
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
munimap.poi.style.TOILET_IM = [
  munimap.poi.style.BACKGROUND_SQUARE,
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
munimap.poi.style.TOILET_M = [
  munimap.poi.style.BACKGROUND_SQUARE,
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
munimap.poi.style.TOILET_W = [
  munimap.poi.style.BACKGROUND_SQUARE,
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
 * @param {ol.Feature} feature
 * @param {?string} selectedFloorCode
 * @param {Array.<string>} activeFloorCodes
 * @return {boolean}
 */
munimap.poi.style.activeFloorFilter =
    function(feature, selectedFloorCode, activeFloorCodes) {
  var locCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
  if (locCode) {
    return activeFloorCodes.some(function(floor) {
      return locCode === floor;
    });
  }
  return false;
};


/**
 * @param {ol.Feature} feature
 * @param {?string} selectedFloorCode
 * @param {Array.<string>} activeFloorCodes
 * @return {boolean}
 */
munimap.poi.style.outdoorFilter =
    function(feature, selectedFloorCode, activeFloorCodes) {
  var locCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
  return !goog.isDefAndNotNull(locCode) ||
      !activeFloorCodes.some(function(floor) {
        return locCode.startsWith(floor.substr(0, 5));
      });
};


/**
 * @param {ol.Feature} feature
 * @param {?string} selectedFloorCode
 * @param {Array.<string>} activeFloorCodes
 * @return {boolean}
 */
munimap.poi.style.defaultFloorFilter =
    function(feature, selectedFloorCode, activeFloorCodes) {
  var locCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
  return !activeFloorCodes.some(function(floor) {
    return locCode === floor;
  });
};


/**
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.poi.style.activeFloorFunction = function(options, feature, resolution) {
  var result = munimap.poi.STYLE;
  var poiType = feature.get('typ');
  var showEntrance = munimap.range.contains(
      munimap.poi.style.Resolution.BUILDING_ENTRANCE, resolution);
  var showInfo = munimap.range.contains(
      munimap.poi.style.Resolution.INFORMATION, resolution);
  var showToilets =
      munimap.range.contains(munimap.poi.style.Resolution.TOILET, resolution);
  var showStairs =
      munimap.range.contains(munimap.poi.style.Resolution.STAIRS, resolution);
  switch (poiType) {
    case munimap.poi.Purpose.INFORMATION_POINT:
      result = showInfo ? munimap.poi.style.INFORMATION : null;
      break;
    case munimap.poi.Purpose.ELEVATOR:
      result = showStairs ? munimap.poi.style.ELEVATOR : null;
      break;
    case munimap.poi.Purpose.BUILDING_ENTRANCE:
      result = showEntrance ? munimap.poi.style.ENTRANCE : null;
      break;
    case munimap.poi.Purpose.BUILDING_COMPLEX_ENTRANCE:
      result = munimap.poi.style.ENTRANCE;
      break;
    case munimap.poi.Purpose.TOILET_IMMOBILE:
      result = showToilets ? munimap.poi.style.TOILET_IM : null;
      break;
    case munimap.poi.Purpose.TOILET_MEN:
      result = showToilets ? munimap.poi.style.TOILET_M : null;
      break;
    case munimap.poi.Purpose.TOILET_WOMEN:
      result = showToilets ? munimap.poi.style.TOILET_W : null;
      break;
    case munimap.poi.Purpose.TOILET:
      result = showToilets ? munimap.poi.style.TOILET : null;
      break;
    case munimap.poi.Purpose.CLASSROOM:
      result = null;
      break;
  }
  return result;
};


/**
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.poi.style.outdoorFunction = function(options, feature, resolution) {
  var poiType = feature.get('typ');
  var result;
  switch (poiType) {
    case munimap.poi.Purpose.BUILDING_ENTRANCE:
    case munimap.poi.Purpose.BUILDING_COMPLEX_ENTRANCE:
      var defaultFloor =
          goog.asserts.assertNumber(feature.get('vychoziPodlazi'));
      var showBuildingEntrance =
          (!munimap.range.contains(munimap.floor.RESOLUTION, resolution) ||
          defaultFloor === 1);
      if (poiType === munimap.poi.Purpose.BUILDING_ENTRANCE) {
        showBuildingEntrance = showBuildingEntrance && munimap.range.contains(
            munimap.poi.style.Resolution.BUILDING_ENTRANCE, resolution);
      }
      result = showBuildingEntrance ? munimap.poi.style.ENTRANCE : null;
      break;
    case munimap.poi.Purpose.COMPLEX_ENTRANCE:
      result = munimap.poi.style.ENTRANCE;
      break;
    default:
      result = null;
  }
  return result;
};


/**
 * @param {munimap.style.Function.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.poi.style.defaultFunction = function(options, feature, resolution) {
  var result;
  var poiType = feature.get('typ');
  switch (poiType) {
    case munimap.poi.Purpose.BUILDING_ENTRANCE:
    case munimap.poi.Purpose.BUILDING_COMPLEX_ENTRANCE:
      var showEntrance =
          !munimap.range.contains(munimap.floor.RESOLUTION, resolution);
      if (poiType === munimap.poi.Purpose.BUILDING_ENTRANCE) {
        showEntrance = showEntrance && munimap.range.contains(
            munimap.poi.style.Resolution.BUILDING_ENTRANCE, resolution);
      }
      result = showEntrance ? munimap.poi.style.ENTRANCE : null;
      break;
    default:
      result = null;
  }
  return result;
};
