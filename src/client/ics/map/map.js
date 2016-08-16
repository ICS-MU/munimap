goog.provide('ics.map');

goog.require('ics.map.marker');
goog.require('ics.map.move');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.extent');


/**
 * @typedef {{
 *   info: Element,
 *   floorSelect: goog.ui.Select,
 *   activeFloor:? (ics.map.floor.Options)
 * }}
 */
ics.map.Vars;


/**
 * @type {string}
 * @const
 */
ics.map.VARS_NAME = 'munimapVars';


/**
 * @param {ol.Map} map
 * @return {ics.map.Vars|undefined}
 */
ics.map.getVars = function(map) {
  var vars = map.get(ics.map.VARS_NAME);
  if (goog.isDef(vars)) {
    return /**@type {ics.map.Vars}*/(vars);
  } else {
    return undefined;
  }
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature|string|null} featureOrCode
 */
ics.map.changeFloor = function(map, featureOrCode) {
  var feature;
  var floorCode;
  var building = null;
  if (featureOrCode instanceof ol.Feature) {
    feature = featureOrCode;
    if (ics.map.building.isBuilding(feature)) {
      if (ics.map.building.hasInnerGeometry(feature)) {
        building = feature;
        floorCode = ics.map.getActiveFloorCodeForBuilding(map, building);
      }
    } else if (ics.map.room.isRoom(feature)) {
      var locCode = /**@type (string)*/ (feature.get('polohKod'));
      building = ics.map.building.getByCode(locCode);
      floorCode = locCode.substr(0, 8);
    } else {
      floorCode = /**@type (string)*/ (feature.get('polohKodPodlazi'));
      building = ics.map.building.getByCode(floorCode);
    }
  } else if (goog.isString(featureOrCode)) {
    floorCode = featureOrCode;
    building = ics.map.building.getByCode(floorCode);
  }

  if (building) {
    var locCode = /**@type {string}*/ (building.get('polohKod'));
    if (ics.map.building.active !== locCode) {
      ics.map.building.active = locCode;
      building.changed();
      ics.map.info.setBuildingTitle(map, building);
    }
    ics.map.info.refreshElementPosition(map);
  }

  var activeFloor = ics.map.getVars(map).activeFloor;
  if (floorCode) {
    if (!activeFloor || activeFloor.locationCode !== floorCode) {
      ics.map.setActiveFloor(map, building, floorCode);
    }
  } else {
    if (goog.isDefAndNotNull(activeFloor)) {
      var mapVars = ics.map.getVars(map);
      mapVars.activeFloor = null;
      ics.map.floor.refreshFloorBasedLayers(map);
    }
    if (building) {
      var buildingCode = /**@type {string}*/ (building.get('polohKod'));
      var where = 'polohKod LIKE \'' + buildingCode + '%\'';
      ics.map.floor.loadFloors(where).then(function(floors) {
        ics.map.info.refreshFloorSelect(map, floors);
      });
    } else {
      if (ics.map.building.active) {
        building = ics.map.building.getByCode(ics.map.building.active);
        ics.map.building.active = null;
        building.changed();
      }
      ics.map.info.refreshFloorSelect(map, null);
      ics.map.info.setBuildingTitle(map, null);
    }
  }
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} building
 * @return {string}
 * @protected
 */
ics.map.getActiveFloorCodeForBuilding = function(map, building) {
  var activeFloors = ics.map.floor.getActiveFloors(map);
  var floorCode = activeFloors.find(function(code) {
    return code.substr(0, 5) === building.get('polohKod');
  });
  if (!floorCode) {
    var markerSource = ics.map.marker.getStore(map);
    var markedFeatures = markerSource.getFeatures();
    if (markedFeatures.length > 0) {
      var firstMarked = markedFeatures.find(function(marked) {
        if (ics.map.room.isRoom(marked)) {
          var buildingLocCode =
              /**@type {string}*/ (building.get('polohKod'));
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
ics.map.setActiveFloor = function(map, building, floorCode) {
  var buildingCode = /**@type {string}*/ (building.get('polohKod'));
  var where = 'polohKod LIKE \'' + buildingCode + '%\'';
  ics.map.floor.loadFloors(where).then(function(floors) {
    var newActiveFloor = floors.find(function(floor) {
      return floorCode ===
          /**@type {string}*/ (floor.get('polohKod'));
    });
    var atSameLayerAsActive =
        ics.map.floor.getActiveFloors(map).some(function(code) {
          return code === floorCode;
        });
    var mapVars = ics.map.getVars(map);
    mapVars.activeFloor = ics.map.floor.getFloorObject(newActiveFloor || null);
    ics.map.info.refreshFloorSelect(map, floors);
    if (atSameLayerAsActive) {
      return null;
    } else {
      return ics.map.floor.loadFloors(
          'vrstvaId = ' + mapVars.activeFloor.floorLayerId);
    }
  }).then(function(floors) {
    if (!!floors) {
      ics.map.floor.refreshFloorBasedLayers(map);
    }
    var roomLabels = ics.map.room.label.getLayer(map);
    roomLabels.changed();
  });
};


/**
 * @type {number}
 * @const
 * @protected
 */
ics.map.EXTENT_RATIO = 0.8;


/**
 * @param {ol.Extent} extent
 * @return {number}
 */
ics.map.getBufferValue = function(extent) {
  var width = ol.extent.getWidth(extent);
  var height = ol.extent.getHeight(extent);
  var shorterSide = width <= height ? width : height;
  return - ((1 - ics.map.EXTENT_RATIO) * shorterSide);
};


/**
 *
 * @param {ol.Map} map
 * @param {ol.Pixel} pixel
 * @return {ol.Feature}
 * @protected
 */
ics.map.getMainFeatureAtPixel = function(map, pixel) {
  var mainFeature;
  var features = [];
  var rooms = ics.map.room.getDefaultLayer(map);
  var doors = ics.map.door.getActiveLayer(map);
  var markerClusterLayer = ics.map.marker.cluster.getLayer(map);
  var markerLayer = ics.map.marker.getLayer(map);
  map.forEachFeatureAtPixel(pixel, function(feature, layer) {
    if (layer === doors || layer === rooms) {
      return false;
    }
    if (layer === markerLayer) {
      mainFeature = feature;
      return true;
    }
    if (layer === markerClusterLayer) {
      mainFeature = feature;
      return true;
    }
    features.push(feature);
  });
  if (!mainFeature && features.length) {
    mainFeature = features[0];
  }
  return mainFeature;
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} feature
 * @param {number} resolution
 */
ics.map.isFeatureClickable = function(map, feature, resolution) {
  if (ics.map.range.contains(ics.map.floor.RESOLUTION, resolution)) {
    if (ics.map.building.isBuilding(feature)) {
      return !ics.map.building.isActive(feature) &&
          ics.map.building.hasInnerGeometry(feature);
    } else if (ics.map.room.isRoom(feature)) {
      return !ics.map.room.isInActiveFloor(feature, map);
    } else {
      return false;
    }
  } else {
    var markers = ics.map.marker.getStore(map).getFeatures();
    var buildingWithGeometry = ics.map.building.isBuilding(feature) &&
            ics.map.building.hasInnerGeometry(feature);
    if ((markers.indexOf(feature) >= 0 && buildingWithGeometry) ||
        ics.map.cluster.isCluster(feature)) {
      return true;
    }
    if (ics.map.poi.isPoi(feature)) {
      var poiType = feature.get('typ');
      return poiType === ics.map.poi.Purpose.BUILDING_ENTRANCE ||
          poiType === ics.map.poi.Purpose.BUILDING_COMPLEX_ENTRANCE;
    }
    if (ics.map.range.contains(ics.map.range.createResolution(
        ics.map.floor.RESOLUTION.max, ics.map.complex.RESOLUTION.min),
        resolution)) {
      return ics.map.building.isBuilding(feature) &&
          ics.map.building.hasInnerGeometry(feature);
    } else if (ics.map.range.contains(ics.map.complex.RESOLUTION, resolution)) {
      return ics.map.complex.isComplex(feature) ||
          (ics.map.building.isBuilding(feature) &&
          ics.map.building.hasInnerGeometry(feature));
    }
  }
  return false;
};


/**
 * @param {ol.Map} map
 * @param {ol.Pixel} pixel
 */
ics.map.handleClickOnPixel = function(map, pixel) {
  var clickedFeature = ics.map.getMainFeatureAtPixel(map, pixel);
  if (clickedFeature) {
    var view = map.getView();
    var resolution = view.getResolution();
    var size = map.getSize() || null;
    var viewExtent = view.calculateExtent(size);
    goog.asserts.assertNumber(resolution);
    if (ics.map.range.contains(
        ics.map.marker.cluster.BUILDING_RESOLUTION, resolution) &&
        !ics.map.cluster.isCluster(clickedFeature)) {
      return;
    }
    var zoomTo;
    if (ics.map.cluster.isCluster(clickedFeature)) {
      zoomTo = ics.map.handleClickOnCluster(map, clickedFeature);
    } else if (ics.map.complex.isComplex(clickedFeature)) {
      ics.map.handleClickOnComplex(map, clickedFeature);
    } else if ((ics.map.building.isBuilding(clickedFeature) &&
        ics.map.building.hasInnerGeometry(clickedFeature)) ||
        ics.map.room.isRoom(clickedFeature)) {
      zoomTo = clickedFeature;
    } else if (ics.map.poi.isPoi(clickedFeature)) {
      var poiType = clickedFeature.get('typ');
      if (poiType === ics.map.poi.Purpose.BUILDING_ENTRANCE ||
          poiType === ics.map.poi.Purpose.BUILDING_COMPLEX_ENTRANCE) {
        zoomTo = clickedFeature;
      }
    }
    if (zoomTo) {
      if ((ics.map.building.isBuilding(zoomTo) &&
          ics.map.building.hasInnerGeometry(zoomTo)) ||
          ics.map.room.isRoom(zoomTo) || ics.map.poi.isPoi(zoomTo)) {
        var wasInnerGeomShown =
            ics.map.range.contains(ics.map.floor.RESOLUTION, resolution);
        if (!wasInnerGeomShown) {
          var newResolution = view.constrainResolution(
              ics.map.floor.RESOLUTION.max);
          if (goog.isDef(newResolution)) {
            var center;
            if (ics.map.cluster.isCluster(clickedFeature) ||
                ics.map.room.isRoom(zoomTo)) {
              var extent = ics.map.extent.ofFeature(zoomTo);
              center = ol.extent.getCenter(extent);
            } else if (ics.map.poi.isPoi(zoomTo)) {
              var point = /**@type {ol.geom.Point}*/ (zoomTo.getGeometry());
              center = point.getCoordinates();
            } else {
              center =
                  ics.map.getClosestPointToPixel(map, clickedFeature, pixel);
            }
            var futureExtent = ol.extent.getForViewAndSize(center,
                newResolution, view.getRotation(), size);
            ics.map.move.setAnimation(map, viewExtent, futureExtent);
            view.setCenter(center);
            view.setResolution(newResolution);
          }
        }
        ics.map.changeFloor(map, zoomTo);
        if (wasInnerGeomShown) {
          ics.map.info.refreshVisibility(map);
        }
      } else {
        var extent = ics.map.extent.ofFeature(zoomTo);
        ics.map.move.setAnimation(map, viewExtent, extent);
        view.fit(extent, size);
      }
      map.renderSync();
    } else if (!ics.map.cluster.isCluster(clickedFeature) &&
        !ics.map.building.isBuilding(clickedFeature) &&
        !ics.map.complex.isComplex(clickedFeature) &&
        (!ics.map.poi.isPoi(clickedFeature) ||
        ics.map.range.contains(ics.map.floor.RESOLUTION, resolution))) {
      ics.map.changeFloor(map, clickedFeature);
      ics.map.info.refreshVisibility(map);
    }
  }
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} cluster
 * @return {ol.Feature|undefined}
 * @prototype
 */
ics.map.handleClickOnCluster = function(map, cluster) {
  var zoomTo;
  var clusteredFeatures = ics.map.cluster.getFeatures(cluster);
  var areMarkersRooms = ics.map.room.isRoom(clusteredFeatures[0]);
  if (clusteredFeatures.length === 1) {
    if (ics.map.building.isBuilding(clusteredFeatures[0])) {
      zoomTo = clusteredFeatures[0];
    } else if (areMarkersRooms) {
      var room = clusteredFeatures[0];
      var locCode = /**@type {string}*/(room.get('polohKod'));
      zoomTo = ics.map.building.getByCode(locCode);
    }
  } else {
    var showOneBuilding = false;
    if (areMarkersRooms) {
      var locCode = /**@type {string}*/(clusteredFeatures[0].get('polohKod'));
      var bldgCode = locCode.substr(0, 5);
      var floorCode = locCode.substr(0, 8);
      showOneBuilding = clusteredFeatures.every(function(room) {
        var locCode = /**@type {string}*/(room.get('polohKod'));
        return bldgCode === locCode.substr(0, 5);
      }) && clusteredFeatures.some(function(room) {
        var locCode = /**@type {string}*/(room.get('polohKod'));
        return floorCode !== locCode.substr(0, 8);
      });
    }
    var view = map.getView();
    var size = map.getSize() || null;
    var viewExtent = view.calculateExtent(size);
    if (showOneBuilding) {
      var extent = ics.map.extent.ofFeatures(clusteredFeatures);
      goog.asserts.assertArray(size);
      var bldgExtent = ol.extent.getForViewAndSize(
          ol.extent.getCenter(extent), ics.map.floor.RESOLUTION.max,
          view.getRotation(), size);
      if (ol.extent.containsExtent(bldgExtent, extent)) {
        extent = bldgExtent;
      }
      ics.map.move.setAnimation(map, viewExtent, extent);
      view.fit(extent, size);
    } else {
      var extent = ics.map.extent.ofFeatures(clusteredFeatures);
      goog.asserts.assertArray(size);
      ics.map.move.setAnimation(map, viewExtent, extent);
      view.fit(extent, size);
    }
  }
  map.renderSync();
  return zoomTo;
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} complex
 * @prototype
 */
ics.map.handleClickOnComplex = function(map, complex) {
  var complexId = /**@type {number}*/ (
      complex.get(ics.map.complex.ID_FIELD_NAME)
      );
  var complexBldgs = ics.map.building.STORE.getFeatures().filter(
      function(bldg) {
        var cId = bldg.get('arealId');
        if (goog.isDefAndNotNull(cId)) {
          goog.asserts.assertNumber(cId);
          if (complexId === cId) {
            return true;
          }
        }
        return false;
      });
  var extent = ics.map.extent.ofFeatures(complexBldgs);
  var view = map.getView();
  var size = map.getSize() || null;
  var futureRes;
  if (complexBldgs.length === 1) {
    futureRes = ics.map.floor.RESOLUTION.max / 2;
  } else {
    futureRes = ics.map.complex.RESOLUTION.min / 2;
  }
  var futureExtent = ol.extent.getForViewAndSize(
      ol.extent.getCenter(extent), futureRes, view.getRotation(), size);
  ics.map.move.setAnimation(map, view.calculateExtent(size), futureExtent);
  view.fit(futureExtent, size);
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} feature
 * @param {ol.Pixel} pixel
 * @return {ol.Coordinate}
 * @protected
 */
ics.map.getClosestPointToPixel = function(map, feature, pixel) {
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
        ics.map.geom.featureExtentIntersect(feature, viewExtent, format);
    var closestPoint;
    if (goog.isDefAndNotNull(intersect)) {
      closestPoint = intersect.getGeometry().getClosestPoint(coordinate);
    }
    return closestPoint || null;
  }
};
