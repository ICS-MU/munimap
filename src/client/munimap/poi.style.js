goog.provide('munimap.poi.STYLE');
goog.provide('munimap.poi.style');


/**
 * @enum {munimap.Range}
 * @const
 */
munimap.poi.style.Resolution = {
  INFORMATION: munimap.floor.RESOLUTION,
  STAIRS: munimap.range.createResolution(0, 0.15),
  TOILET: munimap.range.createResolution(0, 0.13)
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
 * @param {munimap.load.floorBasedActive.Options} options
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.poi.style.function = function(options, feature, resolution) {
  var result = munimap.poi.STYLE;
  var poiType = feature.get('typ');
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
    case munimap.poi.Purpose.BUILDING_COMPLEX_ENTRANCE:
      var floorCode = feature.get('polohKodPodlazi');
      var defaultFloor =
          goog.asserts.assertNumber(feature.get('vychoziPodlazi'));
      var activeFloors = munimap.floor.getActiveFloors(options.map);
      var notInBldgWithActiveFloor = activeFloors.every(function(floor) {
        var bldgCode = floor.substr(0, 5);
        return !floorCode.startsWith(bldgCode);
      });
      var showEntrance =
          !munimap.range.contains(munimap.floor.RESOLUTION, resolution) ||
          (activeFloors.indexOf(floorCode) > -1 ||
          (notInBldgWithActiveFloor && defaultFloor === 1));
      result = showEntrance ? munimap.poi.style.ENTRANCE : null;
      break;
    case munimap.poi.Purpose.COMPLEX_ENTRANCE:
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
