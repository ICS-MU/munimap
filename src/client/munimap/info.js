goog.provide('munimap.info');

goog.require('goog.style');
goog.require('goog.ui.MenuItem');
goog.require('munimap');
goog.require('munimap.building');
goog.require('munimap.lang');


/**
 * Equal to 2 * border-width of ol.popup:after.
 * @type {number}
 * @const
 * @protected
 */
munimap.info.POPUP_TALE_HEIGHT = 10;


/**
 * Equal to left positioning (- 11px of margin) of ol.popup:after.
 * @type {number}
 * @const
 * @protected
 */
munimap.info.POPUP_TALE_INDENT = 8;


/**
 * @param {ol.Extent} extent
 * @param {ol.Extent} viewExtent
 * @param {ol.Feature} building
 * @return {boolean}
 * @protected
 */
munimap.info.isExtentSuitable =
  function(extent, viewExtent, building) {
    if (ol.extent.containsExtent(viewExtent, extent)) {
      var geom = building.getGeometry();
      return !geom.intersectsExtent(extent);
    }
    return false;
  };


/**
 * @param {ol.Map} map
 */
munimap.info.refreshVisibility = function(map) {
  var view = map.getView();
  var res = view.getResolution();
  goog.asserts.assertNumber(res);
  var selectedBuilding = munimap.getProps(map).selectedBuilding;
  var isShown = !!selectedBuilding &&
    munimap.range.contains(munimap.floor.RESOLUTION, res);
  var element = munimap.getProps(map).info;
  goog.style.setElementShown(element, isShown);
};


/**
 * @param {ol.Map} map
 */
munimap.info.refreshElementPosition = function(map) {
  var element = munimap.getProps(map).info;
  var selectedBuilding = munimap.getProps(map).selectedBuilding;
  if (goog.isDefAndNotNull(selectedBuilding)) {
    var building = munimap.building.getByCode(selectedBuilding);

    var view = map.getView();
    var viewExtent = view.calculateExtent(map.getSize() || null);
    var topRight = ol.extent.getTopRight(viewExtent);

    var resolution = view.getResolution();
    var elSize = goog.style.getSize(element);
    var extWidth = resolution * elSize.width;
    var extHeight = resolution *
      (elSize.height + munimap.info.POPUP_TALE_HEIGHT);

    var elExtent = [
      topRight[0] - extWidth, topRight[1] - extHeight, topRight[0], topRight[1]
    ];
    var infoBoxPosition;
    var bldgGeom = building.getGeometry();
    if (!bldgGeom.intersectsExtent(elExtent)) {
      var bottomLeft = ol.extent.getBottomLeft(viewExtent);
      var reducedViewExt = [
        bottomLeft[0], bottomLeft[1],
        topRight[0] - extWidth, topRight[1] - extHeight
      ];
      var format = new ol.format.GeoJSON();
      var intersect = munimap.geom.featureExtentIntersect(
        building, reducedViewExt, format);
      if (goog.isDefAndNotNull(intersect)) {
        var closestPoint = intersect.getGeometry().getClosestPoint(topRight);
        infoBoxPosition = map.getPixelFromCoordinate(
          [closestPoint[0], closestPoint[1] + extHeight]);
        infoBoxPosition[0] -= munimap.info.POPUP_TALE_INDENT;
        goog.dom.classlist.enable(element, 'munimap-hide-tale', false);
      } else {
        intersect = munimap.geom.featureExtentIntersect(
          building, viewExtent, format);
        var bbox = intersect.getGeometry().getExtent();
        var topLeft = ol.extent.getTopLeft(viewExtent);
        var upperExt = [
          topLeft[0], topLeft[1] - extHeight, topRight[0], topRight[1]
        ];
        if (bldgGeom.intersectsExtent(upperExt)) {
          infoBoxPosition = map.getPixelFromCoordinate(
            [bbox[2], topRight[1]]);
        } else {
          infoBoxPosition = map.getPixelFromCoordinate(
            [topRight[0] - extWidth, bbox[3] + extHeight]);
        }
        goog.dom.classlist.enable(element, 'munimap-hide-tale', true);
      }
    }
    if (!goog.isDef(infoBoxPosition)) {
      var parentEl = goog.dom.getParentElement(element);
      var parentElSize = goog.style.getSize(parentEl);
      infoBoxPosition = [parentElSize.width - elSize.width, 0];
      goog.dom.classlist.enable(element, 'munimap-hide-tale', true);
    }
    goog.style.setPosition(element, infoBoxPosition[0], infoBoxPosition[1]);
  }
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} building
 */
munimap.info.setBuildingTitle = function(map, building) {
  var element = munimap.getProps(map).info;
  var complexEl = goog.dom.getElementByClass('munimap-complex', element);
  var bel = goog.dom.getElementByClass('munimap-building', element);
  if (building) {
    var title = /**@type {string}*/ (building.get(munimap.lang.getMsg(
      munimap.lang.Translations.BUILDING_TITLE_FIELD_NAME)));
    var complex = munimap.building.getComplex(building);
    if (goog.isDefAndNotNull(complex)) {
      var complexTitle = /**@type {string}*/ (complex.get(munimap.lang.getMsg(
        munimap.lang.Translations.COMPLEX_TITLE_FIELD_NAME)));
      var buildingType = /**@type {string}*/ (building.get(munimap.lang.getMsg(
        munimap.lang.Translations.BUILDING_TYPE_FIELD_NAME)));
      var buildingTitle = /**@type {string}*/ (
        building.get(munimap.lang.getMsg(
          munimap.lang.Translations.BUILDING_ABBR_FIELD_NAME))
      );
      if (goog.isDefAndNotNull(buildingType) &&
        goog.isDefAndNotNull(buildingTitle)) {
        title = buildingType + ' ' + buildingTitle;
      } else {
        if (munimap.complex.getBuildingCount(complex) === 1) {
          title = munimap.building.getNamePart(building);
        } else {
          title = munimap.building.getTitleWithoutOrgUnit(building);
        }
      }
      complexEl.innerHTML = complexTitle;
      bel.innerHTML = title;
    } else {
      title = munimap.building.getTitleWithoutOrgUnit(building);
      complexEl.innerHTML = '';
      bel.innerHTML = title;
    }
  } else {
    complexEl.innerHTML = '';
    bel.innerHTML = '';
  }
};


/**
 * @param {goog.ui.Select} floorSelect
 * @param {ol.Map} map
 * @return {goog.ui.MenuItem}
 * @protected
 */
munimap.info.findSelectedFloorItem = function(floorSelect, map) {
  var selectedItem;
  var selectedFloor = munimap.getProps(map).selectedFloor;
  if (selectedFloor) {
    floorSelect.getMenu().forEachChild(function(item) {
      var floor = /**@type (ol.Feature)*/ (item.getModel());
      var floorCode = /**@type (string)*/ (floor.get('polohKod'));
      if (floorCode === selectedFloor.locationCode) {
        selectedItem = item;
        return;
      }
    });
  }
  return selectedItem;
};


/**
 * @param {ol.Map} map
 * @param {Array.<ol.Feature>} floors
 */
munimap.info.refreshFloorSelect = function(map, floors) {
  var floorSelect = munimap.getProps(map).floorSelect;
  var item;
  while (floorSelect.getItemAt(0)) {
    floorSelect.removeItemAt(0);
  }
  if (floors) {
    floors.sort(munimap.floor.sort);
    floors.forEach(function(floor) {
      var locCode = /**@type {string}*/ (floor.get('polohKod'));
      var floorCode = locCode.substr(5, 8);
      var floorLabel = munimap.info.getLabelAbbr(floorCode);
      item = new goog.ui.MenuItem(floorLabel, floor);
      floorSelect.addItem(item);
      item.enableClassName('munimap-floor-select-item', true);
      var itemElement = item.getElement();
      goog.dom.setProperties(itemElement,
        {title: munimap.info.getLabel(floorCode)});
    });
    var selectedFloorItem =
      munimap.info.findSelectedFloorItem(floorSelect, map);
    if (selectedFloorItem) {
      floorSelect.setSelectedItem(selectedFloorItem);
    } else {
      var text = munimap.lang.getMsg(munimap.lang.Translations.INFOBOX_CHOOSE);
      floorSelect.setDefaultCaption(goog.dom.createTextNode(text));
    }
    munimap.info.highlightFloors(map, floorSelect, floors);
  }

};


/**
 * Highlight floors with marker in info bubble
 * @param {ol.Map} map
 * @param {goog.ui.Select} floorSelect
 * @param {Array} floors
 */
munimap.info.highlightFloors = function(map, floorSelect, floors) {
  var markers = munimap.marker.getLayer(map).getSource().getFeatures();
  var buildingCode = floors[0].get('polohKod').substr(0, 5);
  markers.forEach(function(feature) {
    var locCode = /**@type {string}*/ (feature.get('polohKod'));
    if (locCode && locCode.length > 5) {
      var markerCode = locCode.substr(0, 5);
      var floorCode = locCode.substr(5, 3);
      if (markerCode === buildingCode) {
        var floorLabel = munimap.info.getLabelAbbr(floorCode);
        floorSelect.getMenu().forEachChild(function(item) {
          if (floorLabel === item.getContent()) {
            item.addClassName('munimap-marker-floor');
            var itemElement = item.getElement();
            var title = itemElement.getAttribute('title');
            var addTitle =
            munimap.lang.getMsg(munimap.lang.Translations.INFOBOX_MARKED);
            if (itemElement.getAttribute('title').indexOf(addTitle) === -1) {
              goog.dom.setProperties(itemElement,
                {title: title + '\n' + addTitle});
            }
          }
        });
      }
    }
  });
};

/**
 * Floor types.
 * @enum {string}
 */
munimap.info.FloorTypes = {
  UNDERGROUND: 'P',
  UNDERGROUND_MEZZANINE: 'Z',
  ABOVEGROUND: 'N',
  MEZZANINE: 'M'
};


/**
 * Get label of given floor code.
 * @param {string} floorCode 3 characters long floor code
 * @return {string} floor label
 */
munimap.info.getLabel = function(floorCode) {
  var letter = floorCode.substr(0, 1);
  var num = parseInt(floorCode.substr(1), 10);
  var numLabel = '';
  if (munimap.lang.active === munimap.lang.Abbr.ENGLISH) {
    switch (num) {
      case 1: numLabel = num + 'st ';
        break;
      case 2: numLabel = num + 'nd ';
        break;
      case 3: numLabel = num + 'rd ';
        break;
      default: numLabel = num + 'th ';
        break;
    }
  } else if (munimap.lang.active === munimap.lang.Abbr.CZECH) {
    numLabel = num + '. ';
  }
  var label;
  var types = munimap.info.FloorTypes;
  var floorTypeString;
  switch (letter) {
    case types.UNDERGROUND:
      floorTypeString =
        munimap.lang.getMsg(munimap.lang.Translations.FLOOR_UNDER);
      label = numLabel + floorTypeString;
      break;
    case types.UNDERGROUND_MEZZANINE:
      floorTypeString =
        munimap.lang.getMsg(munimap.lang.Translations.FLOOR_MEZZANINE_UNDER);
      label = floorTypeString;
      break;
    case types.MEZZANINE:
      floorTypeString =
        munimap.lang.getMsg(munimap.lang.Translations.FLOOR_MEZZANINE);
      label = floorTypeString;
      break;
    case types.ABOVEGROUND:
      floorTypeString =
        munimap.lang.getMsg(munimap.lang.Translations.FLOOR_ABOVE);
      label = numLabel + floorTypeString;
      break;
    default:
      label = floorCode;
      break;
  }
  return label;
};


/**
 * Get abbreviated label of given floor code.
 * @param {string} floorCode 3 characters long floor code
 * @return {string} abbreviated floor label
 */
munimap.info.getLabelAbbr = function(floorCode) {
  var letter = floorCode.substr(0, 1);
  var num = parseInt(floorCode.substr(1), 10);
  var numLabel = '';
  var mezzanineNumLabel = '';
  var types = munimap.info.FloorTypes;
  if (munimap.lang.active === munimap.lang.Abbr.ENGLISH) {
    numLabel = (letter === types.UNDERGROUND_MEZZANINE) ? num - 1 : num;
    mezzanineNumLabel = '.5';
  } else if (munimap.lang.active === munimap.lang.Abbr.CZECH) {
    numLabel = (letter === types.UNDERGROUND_MEZZANINE) ? num - 1 : num;
    mezzanineNumLabel = ',5';
  }
  var label;
  var floorTypeString;
  switch (letter) {
    case types.UNDERGROUND:
      floorTypeString =
        munimap.lang.getMsg(munimap.lang.Translations.FLOOR_UNDER_ABBR);
      label = (munimap.lang.active === munimap.lang.Abbr.ENGLISH) ?
        floorTypeString + numLabel : numLabel + '. ' + floorTypeString;
      break;
    case types.UNDERGROUND_MEZZANINE:
      floorTypeString = munimap.lang.getMsg(
        munimap.lang.Translations.FLOOR_MEZZANINE_UNDER_ABBR);
      label = (munimap.lang.active === munimap.lang.Abbr.ENGLISH) ?
        floorTypeString + numLabel + mezzanineNumLabel :
        numLabel + mezzanineNumLabel + '. ' + floorTypeString;
      break;
    case types.MEZZANINE:
      floorTypeString =
        munimap.lang.getMsg(munimap.lang.Translations.FLOOR_MEZZANINE_ABBR);
      label = (munimap.lang.active === munimap.lang.Abbr.ENGLISH) ?
        floorTypeString + numLabel + mezzanineNumLabel :
        numLabel + mezzanineNumLabel + '. ' + floorTypeString;
      break;
    case types.ABOVEGROUND:
      floorTypeString =
        munimap.lang.getMsg(munimap.lang.Translations.FLOOR_ABOVE_ABBR);
      label = (munimap.lang.active === munimap.lang.Abbr.ENGLISH) ?
        floorTypeString + numLabel : numLabel + '. ' + floorTypeString;
      break;
    default:
      label = floorCode;
      break;
  }
  return label;
};
