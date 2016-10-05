goog.provide('munimap.info');

goog.require('goog.style');
goog.require('goog.ui.MenuItem');
goog.require('munimap');
goog.require('munimap.building');
goog.require('ol.Extent');
goog.require('ol.Map');
goog.require('ol.extent');
goog.require('ol.format.GeoJSON');


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
  var activeBuilding = munimap.getVars(map).activeBuilding;
  var isShown = !!activeBuilding &&
      munimap.range.contains(munimap.floor.RESOLUTION, res);
  var element = munimap.getVars(map).info;
  goog.style.setElementShown(element, isShown);
};


/**
 * @param {ol.Map} map
 */
munimap.info.refreshElementPosition = function(map) {
  var element = munimap.getVars(map).info;
  var activeBuilding = munimap.getVars(map).activeBuilding;
  if (goog.isDefAndNotNull(activeBuilding)) {
    var building = munimap.building.getByCode(activeBuilding);

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
        goog.dom.classlist.enable(element, 'hide-tale', false);
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
        goog.dom.classlist.enable(element, 'hide-tale', true);
      }
    }
    if (!goog.isDef(infoBoxPosition)) {
      var parentEl = goog.dom.getParentElement(element);
      var parentElSize = goog.style.getSize(parentEl);
      infoBoxPosition = [parentElSize.width - elSize.width, 0];
      goog.dom.classlist.enable(element, 'hide-tale', true);
    }
    goog.style.setPosition(element, infoBoxPosition[0], infoBoxPosition[1]);
  }
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} building
 */
munimap.info.setBuildingTitle = function(map, building) {
  var element = munimap.getVars(map).info;
  var complexEl = goog.dom.getElementByClass('complex', element);
  var bel = goog.dom.getElementByClass('building', element);
  if (building) {
    var title = /**@type {string}*/ (
        building.get(munimap.building.TITLE_FIELD_NAME)
        );
    var complex = munimap.building.getComplex(building);
    if (goog.isDefAndNotNull(complex)) {
      var complexTitle = /**@type {string}*/ (complex.get('nazevPrez'));
      var buildingType = /**@type {string}*/ (
          building.get(munimap.building.TYPE_FIELD_NAME)
          );
      var buildingTitle = /**@type {string}*/ (
          building.get(munimap.building.ABBR_FIELD_NAME)
          );
      if (goog.isDefAndNotNull(buildingType) &&
              goog.isDefAndNotNull(buildingTitle)) {
        title = buildingType + ' ' + buildingTitle;
      } else {
        title = munimap.building.getTitleWithoutOrgUnit(building);
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
munimap.info.findActiveFloorItem = function(floorSelect, map) {
  var activeItem;
  var activeFloor = munimap.getVars(map).activeFloor;
  if (activeFloor) {
    floorSelect.getMenu().forEachChild(function(item) {
      var floor = /**@type (ol.Feature)*/ (item.getModel());
      var floorCode = /**@type (string)*/ (floor.get('polohKod'));
      if (floorCode === activeFloor.locationCode) {
        activeItem = item;
        return;
      }
    });
  }
  return activeItem;
};


/**
 * @param {ol.Map} map
 * @param {Array.<ol.Feature>} floors
 */
munimap.info.refreshFloorSelect = function(map, floors) {
  var floorSelect = munimap.getVars(map).floorSelect;
  while (floorSelect.getItemAt(0)) {
    floorSelect.removeItemAt(0);
  }
  if (floors) {
    floors.sort(munimap.floor.sort);
    floors.forEach(function(floor) {
      var locCode = /**@type {string}*/ (floor.get('polohKod'));
      var floorCode = locCode.substr(5, 8);
      var floorLabel = munimap.info.getLabelAbbr(floorCode);
      var item = new goog.ui.MenuItem(floorLabel, floor);
      floorSelect.addItem(item);
      item.enableClassName('floor-select-item', true);
      var itemElement = item.getElement();
      goog.dom.setProperties(itemElement,
          {title: munimap.info.getLabel(floorCode)});
    });
    var activeFloorItem = munimap.info.findActiveFloorItem(floorSelect, map);
    if (activeFloorItem) {
      floorSelect.setSelectedItem(activeFloorItem);
    } else {
      var text = munimap.lang.getMsg(munimap.lang.Translations.INFOBOX_CHOOSE);
      floorSelect.setDefaultCaption(goog.dom.createTextNode(text));
    }
  }
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
  if (munimap.lang.active === munimap.lang.Abbr.ENGLISH) {
    numLabel = num;
    mezzanineNumLabel = '.5';
  } else if (munimap.lang.active === munimap.lang.Abbr.CZECH) {
    numLabel = num;
    mezzanineNumLabel = ',5';
  }
  var label;
  var types = munimap.info.FloorTypes;
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
