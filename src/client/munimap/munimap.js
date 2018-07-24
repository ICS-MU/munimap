goog.provide('munimap');

goog.require('munimap.bubble');
goog.require('munimap.layer.propName');
goog.require('munimap.marker');
goog.require('munimap.move');


/**
 * @typedef {{
 *   info: Element,
 *   floorSelect: goog.ui.Select,
 *   selectedBuilding:? (string),
 *   selectedFloor:? (munimap.floor.Options),
 *   currentResolution: (number),
 *   getMainFeatureAtPixel: (munimap.getMainFeatureAtPixelFunction),
 *   locationCodes:? (boolean)
 * }}
 */
munimap.Props;


/**
 * @type {string}
 * @const
 */
munimap.PROPS_NAME = 'munimapProps';


/**
 *
 * @enum {string}
 */
munimap.BaseMaps = {
  OSM: 'osm',
  OSM_BW: 'osm-bw'
};


/**
 * @type {Array.<ol.Map>}
 * @const
 */
munimap.LIST = [];


/**
 * @param {ol.Map} map
 * @return {munimap.Props|undefined}
 */
munimap.getProps = function(map) {
  var props = map.get(munimap.PROPS_NAME);
  if (goog.isDef(props)) {
    return /**@type {munimap.Props}*/(props);
  } else {
    return undefined;
  }
};


/**
 * @typedef {{
 *   feature: (ol.Feature),
 *   layer: (ol.layer.Vector)
 * }}
 */
munimap.LayeredFeature;


/**
 * @typedef {
 *    function(ol.Map, ol.Pixel): munimap.LayeredFeature
 * }
 */
munimap.getMainFeatureAtPixelFunction;


/**
 * @param {ol.Map} map
 * @param {ol.Feature|string|null} featureOrCode
 */
munimap.changeFloor = function(map, featureOrCode) {
  var feature;
  var floorCode;
  var locCode;
  var building = null;
  if (featureOrCode instanceof ol.Feature) {
    feature = featureOrCode;
    if (munimap.building.isBuilding(feature)) {
      if (munimap.building.hasInnerGeometry(feature)) {
        building = feature;
        floorCode = munimap.getSelectedFloorCodeForBuilding(map, building);
      }
    } else if (munimap.room.isRoom(feature) || munimap.door.isDoor(feature)) {
      locCode = /**@type (string)*/ (feature.get('polohKod'));
      building = munimap.building.getByCode(locCode);
      floorCode = locCode.substr(0, 8);
    } else {
      floorCode = /**@type (string)*/ (feature.get('polohKodPodlazi'));
      building = munimap.building.getByCode(floorCode);
    }
  } else if (goog.isString(featureOrCode)) {
    floorCode = featureOrCode;
    building = munimap.building.getByCode(floorCode);
  }

  var mapProps = munimap.getProps(map);
  if (building) {
    locCode = munimap.building.getLocationCode(building);
    if (mapProps.selectedBuilding !== locCode) {
      mapProps.selectedBuilding = locCode;
      building.changed();
      munimap.info.setBuildingTitle(map, building);
    }
    munimap.info.refreshElementPosition(map);
  }

  var selectedFloor = mapProps.selectedFloor;
  if (floorCode) {
    if (!selectedFloor || selectedFloor.locationCode !== floorCode) {
      munimap.setSelectedFloor(map, building, floorCode);
    }
  } else {
    if (goog.isDefAndNotNull(selectedFloor)) {
      mapProps.selectedFloor = null;
      munimap.floor.refreshFloorBasedLayers(map);
    }
    if (building) {
      var buildingCode = munimap.building.getLocationCode(building);
      var where = 'polohKod LIKE \'' + buildingCode + '%\'';
      munimap.floor.loadFloors(where).then(function(floors) {
        munimap.info.refreshFloorSelect(map, floors);
      });
    } else {
      if (mapProps.selectedBuilding) {
        building = munimap.building.getByCode(mapProps.selectedBuilding);
        mapProps.selectedBuilding = null;
        building.changed();
      }
      munimap.info.refreshFloorSelect(map, null);
      munimap.info.setBuildingTitle(map, null);
    }
  }
  if(munimap.bubble.OVERLAY.selectedFloor && 
    selectedFloor !== munimap.bubble.OVERLAY.selectedFloor) {
    map.removeOverlay(munimap.bubble.OVERLAY);
  }
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} building
 * @return {string}
 * @protected
 */
munimap.getSelectedFloorCodeForBuilding = function(map, building) {
  var activeFloors = munimap.floor.getActiveFloors(map);
  var floorCode = activeFloors.find(function(code) {
    return code.substr(0, 5) === munimap.building.getLocationCode(building);
  });
  if (!floorCode) {
    var markerSource = munimap.marker.getStore(map);
    var markedFeatures = markerSource.getFeatures();
    if (markedFeatures.length > 0) {
      var firstMarked = markedFeatures.find(function(marked) {
        if (munimap.room.isRoom(marked) || munimap.door.isDoor(marked)) {
          var buildingLocCode = munimap.building.getLocationCode(building);
          var locationCode =
          /**@type {string}*/ (marked.get('polohKod'));
          return locationCode.substr(0, 5) === buildingLocCode;
        } else {
          return false;
        }
      });

      if (firstMarked) {
        var firstMarkedCode = /**@type {string}*/
            (firstMarked.get('polohKod'));
        floorCode = firstMarkedCode.substr(0, 8);
      }
    }
    if (!floorCode) {
      floorCode =
        /**@type (string)*/ (building.get('vychoziPodlazi'));
    }
  }
  return floorCode;
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} building
 * @param {string} floorCode
 * @protected
 */
munimap.setSelectedFloor = function(map, building, floorCode) {
  var buildingCode = munimap.building.getLocationCode(building);
  var where = 'polohKod LIKE \'' + buildingCode + '%\'';
  munimap.floor.loadFloors(where).then(function(floors) {
    var newSelectedFloor = floors.find(function(floor) {
      return floorCode ===
      /**@type {string}*/ (floor.get('polohKod'));
    });
    goog.asserts.assertInstanceof(newSelectedFloor, ol.Feature);
    var newSelectedWasActive =
        munimap.floor.getActiveFloors(map).some(function(code) {
          return code === floorCode;
        });
    var mapProps = munimap.getProps(map);
    mapProps.selectedFloor =
        munimap.floor.getFloorObject(newSelectedFloor);
    munimap.info.refreshFloorSelect(map, floors);
    if (newSelectedWasActive) {
      munimap.style.refreshAllFromFragments(map);
    } else {
      var where = 'vrstvaId = ' + mapProps.selectedFloor.floorLayerId;
      munimap.floor.loadFloors(where).then(function(floors) {
        if (!!floors) {
          munimap.floor.refreshFloorBasedLayers(map);
        }
      });
    }
  });
};


/**
 * @type {number}
 * @const
 * @protected
 */
munimap.EXTENT_RATIO = 0.8;


/**
 * @param {ol.Extent} extent
 * @return {number}
 */
munimap.getBufferValue = function(extent) {
  var width = ol.extent.getWidth(extent);
  var height = ol.extent.getHeight(extent);
  var shorterSide = width <= height ? width : height;
  return -((1 - munimap.EXTENT_RATIO) * shorterSide);
};


/**
 *
 * @param {ol.Map} map
 * @param {ol.Pixel} pixel
 * @return {munimap.LayeredFeature}
 */
munimap.getMainFeatureAtPixel = function(map, pixel) {
  var mainFeatureCtx;
  var featureCtxs = [];
  var rooms = munimap.room.getDefaultLayer(map);
  var doors = munimap.door.getActiveLayer(map);
  var markerClusterLayer = munimap.cluster.getLayer(map);
  var markerLayer = munimap.marker.getLayer(map);
  map.forEachFeatureAtPixel(pixel, function(feature, layer) {
    if (layer === doors || layer === rooms) {
      return false;
    }
    if (layer === markerLayer) {
      mainFeatureCtx = {
        feature: feature,
        layer: layer
      };
      return true;
    }
    if (layer === markerClusterLayer) {
      mainFeatureCtx = {
        feature: feature,
        layer: layer
      };
      return true;
    }
    featureCtxs.push({
      feature: feature,
      layer: layer
    });
  });
  if (!mainFeatureCtx && featureCtxs.length) {
    mainFeatureCtx = featureCtxs[0];
  }
  return mainFeatureCtx;
};


/**
 * @param {ol.Map} map
 * @param {ol.Pixel} pixel
 */
munimap.handleClickOnPixel = function(map, pixel) {
  var getMainFeatureAtPixel = munimap.getProps(map).getMainFeatureAtPixel;
  var layeredFeature = getMainFeatureAtPixel(map, pixel);
  if (layeredFeature) {
    var layer = layeredFeature.layer;
    var isClickable = layer.get(munimap.layer.propName.IS_CLICKABLE);
    if (isClickable) {
      goog.asserts.assertFunction(isClickable);

      var handlerOpts = {
        feature: layeredFeature.feature,
        layer: layer,
        map: map,
        pixel: pixel,
        resolution: map.getView().getResolution()
      };
      if (isClickable(handlerOpts)) {
        var featureClickHandler =
            layer.get(munimap.layer.propName.CLICK_HANDLER);
        if (featureClickHandler) {
          goog.asserts.assertFunction(featureClickHandler);
          featureClickHandler(handlerOpts);
        }
      }
    }
  }
};
