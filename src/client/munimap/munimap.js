goog.provide('munimap');

goog.require('munimap.marker');
goog.require('munimap.move');


/**
 * @typedef {{
 *   info: Element,
 *   floorSelect: goog.ui.Select,
 *   activeBuilding:? (string),
 *   activeFloor:? (munimap.floor.Options),
 *   currentResolution: (number)
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
munimap.FeatureContext;


/**
 *
 * @typedef {
 *  function(munimap.featureClickHandlerOptions)
 * }
 */
munimap.featureClickHandlerFunction;


/**
 * @typedef {{
 *   feature: ol.Feature,
 *   layer: ol.layer.Vector,
 *   map: ol.Map,
 *   pixel: ol.Pixel,
 *   resolution: number
 * }}
 */
munimap.featureClickHandlerOptions;


/**
 * @typedef {
 *    function(munimap.featureClickHandlerOptions): boolean
 * }
 */
munimap.isFeatureClickableFunction;


/**
 * @param {ol.Map} map
 * @param {ol.Feature|string|null} featureOrCode
 */
munimap.changeFloor = function(map, featureOrCode) {
  var feature;
  var floorCode;
  var building = null;
  if (featureOrCode instanceof ol.Feature) {
    feature = featureOrCode;
    if (munimap.building.isBuilding(feature)) {
      if (munimap.building.hasInnerGeometry(feature)) {
        building = feature;
        floorCode = munimap.getActiveFloorCodeForBuilding(map, building);
      }
    } else if (munimap.room.isRoom(feature)) {
      var locCode = /**@type (string)*/ (feature.get('polohKod'));
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
    var locCode = munimap.building.getLocationCode(building);
    if (mapProps.activeBuilding !== locCode) {
      mapProps.activeBuilding = locCode;
      building.changed();
      munimap.info.setBuildingTitle(map, building);
    }
    munimap.info.refreshElementPosition(map);
  }

  var activeFloor = mapProps.activeFloor;
  if (floorCode) {
    if (!activeFloor || activeFloor.locationCode !== floorCode) {
      munimap.setActiveFloor(map, building, floorCode);
    }
  } else {
    if (goog.isDefAndNotNull(activeFloor)) {
      mapProps.activeFloor = null;
      munimap.floor.refreshFloorBasedLayers(map);
    }
    if (building) {
      var buildingCode = munimap.building.getLocationCode(building);
      var where = 'polohKod LIKE \'' + buildingCode + '%\'';
      munimap.floor.loadFloors(where).then(function(floors) {
        munimap.info.refreshFloorSelect(map, floors);
      });
    } else {
      if (mapProps.activeBuilding) {
        building = munimap.building.getByCode(mapProps.activeBuilding);
        mapProps.activeBuilding = null;
        building.changed();
      }
      munimap.info.refreshFloorSelect(map, null);
      munimap.info.setBuildingTitle(map, null);
    }
  }
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} building
 * @return {string}
 * @protected
 */
munimap.getActiveFloorCodeForBuilding = function(map, building) {
  var activeFloors = munimap.floor.getActiveFloors(map);
  var floorCode = activeFloors.find(function(code) {
    return code.substr(0, 5) === munimap.building.getLocationCode(building);
  });
  if (!floorCode) {
    var markerSource = munimap.marker.getStore(map);
    var markedFeatures = markerSource.getFeatures();
    if (markedFeatures.length > 0) {
      var firstMarked = markedFeatures.find(function(marked) {
        if (munimap.room.isRoom(marked)) {
          var buildingLocCode = munimap.building.getLocationCode(building);
          var roomLocCode =
              /**@type {string}*/ (marked.get('polohKod'));
          return roomLocCode.substr(0, 5) === buildingLocCode;
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
munimap.setActiveFloor = function(map, building, floorCode) {
  var buildingCode = munimap.building.getLocationCode(building);
  var where = 'polohKod LIKE \'' + buildingCode + '%\'';
  munimap.floor.loadFloors(where).then(function(floors) {
    var newActiveFloor = floors.find(function(floor) {
      return floorCode ===
          /**@type {string}*/ (floor.get('polohKod'));
    });
    var atSameLayerAsActive =
        munimap.floor.getActiveFloors(map).some(function(code) {
          return code === floorCode;
        });
    var mapProps = munimap.getProps(map);
    mapProps.activeFloor = munimap.floor.getFloorObject(newActiveFloor || null);
    munimap.info.refreshFloorSelect(map, floors);
    if (atSameLayerAsActive) {
      return null;
    } else {
      return munimap.floor.loadFloors(
          'vrstvaId = ' + mapProps.activeFloor.floorLayerId);
    }
  }).then(function(floors) {
    if (!!floors) {
      munimap.floor.refreshFloorBasedLayers(map);
    }
    var roomLabels = munimap.room.label.getLayer(map);
    if (roomLabels) {
      roomLabels.changed();
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
  return - ((1 - munimap.EXTENT_RATIO) * shorterSide);
};


/**
 *
 * @param {ol.Map} map
 * @param {ol.Pixel} pixel
 * @return {munimap.FeatureContext}
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
  var featureCtx = munimap.getMainFeatureAtPixel(map, pixel);
  if (featureCtx) {
    var layer = featureCtx.layer;
    var isClickable = layer.get('isFeatureClickable');
    if (isClickable) {
      goog.asserts.assertFunction(isClickable);

      var handlerOpts = {
        feature: featureCtx.feature,
        layer: layer,
        map: map,
        pixel: pixel,
        resolution: map.getView().getResolution()
      };
      if (isClickable(handlerOpts)) {
        var featureClickHandler = layer.get('featureClickHandler');
        if (featureClickHandler) {
          goog.asserts.assertFunction(featureClickHandler);
          featureClickHandler(handlerOpts);
        }
      }
    }
  }
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} feature
 * @param {ol.Pixel} pixel
 * @return {ol.Coordinate}
 */
munimap.getClosestPointToPixel = function(map, feature, pixel) {
  var coordinate = map.getCoordinateFromPixel(pixel);
  var point = new ol.Feature(new ol.geom.Point(coordinate));
  var format = new ol.format.GeoJSON();
  var turfPoint =
      /**@type {GeoJSONFeature}*/(format.writeFeatureObject(point));
  var turfFeature =
      /**@type {GeoJSONFeature}*/(format.writeFeatureObject(feature));
  if (turf.inside(turfPoint, turfFeature)) {
    return coordinate;
  } else {
    var viewExtent = map.getView().calculateExtent(map.getSize() || null);
    var intersect =
        munimap.geom.featureExtentIntersect(feature, viewExtent, format);
    var closestPoint;
    if (goog.isDefAndNotNull(intersect)) {
      closestPoint = intersect.getGeometry().getClosestPoint(coordinate);
    }
    return closestPoint || null;
  }
};
