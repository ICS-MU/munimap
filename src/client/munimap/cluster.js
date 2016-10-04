goog.provide('munimap.cluster');
goog.provide('munimap.cluster.style');

goog.require('goog.array');
goog.require('goog.object');
goog.require('munimap.marker.style');
goog.require('munimap.range');
goog.require('ol.Feature');


/**
 * @type {string}
 * @protected
 * @const
 */
munimap.cluster.style.MU_LABEL = 'Masarykova univerzita';


/**
 * @type {munimap.Range}
 * @const
 */
munimap.cluster.ROOM_RESOLUTION =
    munimap.range.createResolution(1.19, Number.POSITIVE_INFINITY);


/**
 * @type {munimap.Range}
 * @const
 */
munimap.cluster.BUILDING_RESOLUTION =
    munimap.range.createResolution(2.39, Number.POSITIVE_INFINITY);


/**
 * @type {string}
 * @const
 */
munimap.cluster.LAYER_ID = 'markercluster';


/**
 * @enum {munimap.Range}
 * @const
 * @protected
 */
munimap.cluster.Resolutions = {
  MARKERS_ONLY: munimap.range.createResolution(0, 2.39),
  MARKERS_AND_UNITS: munimap.range.createResolution(2.39, 9),
  MARKERS_AND_FACULTIES:
      munimap.range.createResolution(9, Number.POSITIVE_INFINITY)
};


/**
 * @param {ol.Map} map
 * @param {number|munimap.Range} resolution
 * @return {Array<ol.Feature>}
 * @protected
 */
munimap.cluster.getClusteredFeatures = function(map, resolution) {
  var range = goog.isNumber(resolution) ?
      munimap.cluster.getResolutionRange(resolution) : resolution;
  var ranges = munimap.cluster.Resolutions;
  var result;
  var markers = munimap.marker.getFeatures(map).concat();
  var bldgs = munimap.building.STORE.getFeatures();
  switch (range) {
    case ranges.MARKERS_ONLY:
      result = markers;
      break;
    case ranges.MARKERS_AND_UNITS:
      result = markers.concat(munimap.building.filterHeadquaters(bldgs));
      break;
    case ranges.MARKERS_AND_FACULTIES:
      result = markers.concat(
          munimap.building.filterFacultyHeadquaters(bldgs)
          );
      break;
  }
  result = result || [];
  goog.array.removeDuplicates(result);
  return result;
};


/**
 * @param {number} resolution
 * @return {munimap.Range}
 * @protected
 */
munimap.cluster.getResolutionRange = function(resolution) {
  return goog.object.findValue(munimap.cluster.Resolutions, function(range) {
    return munimap.range.contains(range, resolution);
  });
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.cluster.isCluster = function(feature) {
  var clusteredFeatures = feature.get('features');
  return goog.isArray(clusteredFeatures) &&
      clusteredFeatures.every(function(f) {
        return f instanceof ol.Feature;
      });
};


/**
 * @param {ol.Feature} feature
 * @return {Array.<ol.Feature>}
 */
munimap.cluster.getFeatures = function(feature) {
  return munimap.cluster.isCluster(feature) ?
      /** @type {Array.<ol.Feature>} */(feature.get('features')) : [];
};


/**
 * @param {ol.Map} map
 * @return {ol.layer.Vector}
 */
munimap.cluster.getLayer = function(map) {
  var layers = map.getLayers().getArray();
  var result = layers.find(munimap.cluster.isLayer);
  goog.asserts.assertInstanceof(result, ol.layer.Vector);
  return result;
};


/**
 * @param {ol.layer.Base} layer
 * @return {boolean}
 */
munimap.cluster.isLayer = function(layer) {
  return layer.get('id') === munimap.cluster.LAYER_ID;
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
munimap.cluster.getStore = function(map) {
  var layer = munimap.cluster.getLayer(map);
  var result = layer.getSource();
  return result;
};


/**
 * @param {ol.Map} map
 * @return {ol.source.Vector}
 */
munimap.cluster.getSource = function(map) {
  var clusterStore = munimap.cluster.getStore(map);
  goog.asserts.assertInstanceof(clusterStore, munimap.source.Cluster);
  return clusterStore.getSource();
};


/**
 * @param {ol.Map} map
 * @return {Array.<ol.Feature>}
 * @protected
 */
munimap.cluster.getSourceFeatures = function(map) {
  var source = munimap.cluster.getSource(map);
  return source.getFeatures();
};


/**
 * @param {ol.Map} map
 * @param {ol.Feature} cluster
 * @return {boolean}
 */
munimap.cluster.containsMarker = function(map, cluster) {
  var markers = munimap.marker.getFeatures(map);
  var clusteredFeatures = cluster.get('features');
  return clusteredFeatures.some(function(feat) {
    return goog.array.contains(markers, feat);
  });
};


/**
 * @param {ol.render.Event} evt
 */
munimap.cluster.handleMapPrecomposeEvt = function(evt) {
  var map = /**@type {ol.Map}*/(evt.target);
  var mapVars = munimap.getVars(map);
  var viewState = evt.frameState.viewState;

  var oldRes = mapVars.currentResolution;
  var res = viewState.resolution;

  var oldRange = munimap.cluster.getResolutionRange(oldRes);
  var range = munimap.cluster.getResolutionRange(res);

  if (range !== oldRange) {
    munimap.cluster.updateClusteredFeatures(map, res);
  }

  mapVars.currentResolution = res;
};


/**
 * @param {ol.Map} map
 * @param {number} resolution
 */
munimap.cluster.updateClusteredFeatures = function(map, resolution) {
  var oldFeatures = munimap.cluster.getSourceFeatures(map);
  var features = munimap.cluster.getClusteredFeatures(map, resolution);
  var allFeatures = oldFeatures.concat(features);
  goog.array.removeDuplicates(allFeatures);

  var bucket = goog.array.bucket(allFeatures, function(feature) {
    if (oldFeatures.indexOf(feature) >= 0 &&
        features.indexOf(feature) < 0) {
      return 'remove';
    } else if (oldFeatures.indexOf(feature) < 0 &&
        features.indexOf(feature) >= 0) {
      return 'add';
    } else {
      return undefined;
    }
  });

  var featuresToRemove = bucket['remove'] || [];
  var featuresToAdd = bucket['add'] || [];

  var source = munimap.cluster.getSource(map);
  featuresToRemove.forEach(function(feature) {
    source.removeFeature(feature);
  });
  source.addFeatures(featuresToAdd);
};


/**
 * @type {number}
 * @protected
 * @const
 */
munimap.cluster.style.RADIUS = 12;


/**
 * @type {ol.style.Style}
 * @protected
 * @const
 */
munimap.cluster.style.MULTIPLE = new ol.style.Style({
  image: new ol.style.Circle({
    radius: munimap.cluster.style.RADIUS,
    fill: munimap.style.TEXT_FILL,
    stroke: new ol.style.Stroke({
      color: '#ffffff',
      width: 2
    })
  })
});


/**
 * @type {ol.style.Style}
 * @protected
 * @const
 */
munimap.cluster.style.MULTIPLE_MARKED = new ol.style.Style({
  image: new ol.style.Circle({
    radius: munimap.cluster.style.RADIUS,
    fill: munimap.marker.style.FILL,
    stroke: new ol.style.Stroke({
      color: '#ffffff',
      width: 3
    })
  })
});


/**
 * @param {munimap.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style|Array.<ol.style.Style>}
 */
munimap.cluster.style.function = function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var features = munimap.cluster.getFeatures(feature);
  var result;
  var markedFeatures = features.filter(
      goog.partial(munimap.marker.isMarker, options.map)
      );
  if (features.length === 1) {
    result = munimap.cluster.style.pinFunction(
        options, feature, features[0], resolution);
  } else if (markedFeatures.length === 1) {
    result = munimap.cluster.style.pinFunction(
        options, feature, markedFeatures[0], resolution);
  } else {
    result = [];
    var circleStyle;
    var labelStyle = munimap.cluster.style.multipleLabelFunction(
        options, feature, resolution);
    if (goog.isDefAndNotNull(labelStyle)) {
      result.push(labelStyle);
    }
    if (markedFeatures.length) {
      circleStyle = new ol.style.Style({
        geometry: munimap.geom.getGeometryCenterOfFeatures(markedFeatures),
        image: new ol.style.Circle({
          radius: munimap.cluster.style.RADIUS,
          fill: munimap.marker.style.FILL,
          stroke: new ol.style.Stroke({
            color: '#ffffff',
            width: 3
          })
        }),
        zIndex: 7
      });
    } else {
      circleStyle = munimap.cluster.style.MULTIPLE;
    }
    result.push(circleStyle);
  }
  return result;
};


/**
 * @param {munimap.marker.style.labelFunction.Options} options
 * @param {ol.Feature} clusterFeature
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {Array.<ol.style.Style>}
 * @protected
 */
munimap.cluster.style.pinFunction =
    function(options, clusterFeature, feature, resolution) {
  var styleArray = [];
  var title;
  if (goog.isDef(options.markerLabel)) {
    title = options.markerLabel(clusterFeature, resolution);
  }
  var isMarked = munimap.marker.isMarker(options.map, feature);
  if (!goog.isDefAndNotNull(title)) {
    if (isMarked) {
      var allMarkers = options.markerSource.getFeatures();
      title = munimap.cluster.style.getMarkedDefaultLabel(allMarkers,
          clusterFeature, resolution);
    } else {
      title =
          munimap.cluster.style.getUnmarkedDefaultLabel(clusterFeature,
              resolution);
    }
  }

  var fill = isMarked ?
      munimap.marker.style.TEXT_FILL :
      munimap.style.TEXT_FILL;

  var fontSize = munimap.building.style.FONT_SIZE;

  var geometry = feature.getGeometry();
  goog.asserts.assert(!!geometry);

  var opts = {
    fill: fill,
    fontSize: fontSize,
    geometry: geometry,
    title: title,
    zIndex: 6
  };
  if (title) {
    var textStyle = munimap.style.getTextStyleWithOffsetY(opts);
    styleArray.push(textStyle);
  }
  var pin = isMarked ?
      munimap.marker.style.createPinFromGeometry(geometry) :
      munimap.style.PIN;
  styleArray.push(pin);
  return styleArray;
};


/**
 * @param {munimap.marker.style.labelFunction.Options} options
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * @return {ol.style.Style}
 * @protected
 */
munimap.cluster.style.multipleLabelFunction =
    function(options, feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var map = options.map;
  var containsMarker = munimap.cluster.containsMarker(map, feature);
  var markers;
  if (containsMarker) {
    var allMarkers = options.markerSource.getFeatures();
    var clusteredFeatures = munimap.cluster.getFeatures(feature);
    markers = clusteredFeatures.filter(function(feat) {
      return goog.array.contains(allMarkers, feat);
    });
  }

  var title;
  if (goog.isDef(options.markerLabel)) {
    title = options.markerLabel(feature, resolution);
  }
  if (!goog.isDefAndNotNull(title)) {
    if (containsMarker) {
      title = munimap.cluster.style.getMarkedDefaultLabel(allMarkers || [],
          feature, resolution);
    } else {
      title =
          munimap.cluster.style.getUnmarkedDefaultLabel(feature, resolution);
    }
  }

  if (title) {
    var fontSize = 13;
    var offsetY = munimap.style.getLabelHeight(title, fontSize) / 2 +
        munimap.cluster.style.RADIUS + 2;
    var fill = containsMarker ?
        munimap.marker.style.TEXT_FILL :
        munimap.style.TEXT_FILL;
    var geometry = containsMarker ?
        munimap.geom.getGeometryCenterOfFeatures(markers || []) :
        munimap.geom.CENTER_GEOMETRY_FUNCTION;
    var textStyle = new ol.style.Style({
      geometry: geometry,
      text: new ol.style.Text({
        font: 'bold ' + fontSize + 'px arial',
        fill: fill,
        offsetY: offsetY,
        stroke: munimap.style.TEXT_STROKE,
        text: title
      }),
      zIndex: containsMarker ? 7 : 4
    });
    return textStyle;
  } else {
    return null;
  }
};


/**
 * Clustered features are buildings only.
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {string}
 * @protected
 */
munimap.cluster.style.getUnmarkedDefaultLabel = function(feature, resolution) {
  goog.asserts.assertInstanceof(feature, ol.Feature);
  var title;

  var titleParts = [];
  var units;
  var clusteredBuildings = munimap.cluster.getFeatures(feature);

  var range = munimap.cluster.getResolutionRange(resolution);
  if (range === munimap.cluster.Resolutions.MARKERS_AND_FACULTIES) {
    units = munimap.unit.getFacultiesOfBuildings(clusteredBuildings);
    if (units.length >= 10) {
      return munimap.cluster.style.MU_LABEL;
    }
  } else {
    units = munimap.unit.getUnitsOfBuildings(clusteredBuildings);
  }
  titleParts = munimap.unit.getTitleParts(units);

  title = titleParts.join('\n');
  return title;
};


/**
 * Clustered features are buildings only.
 * @param {Array<ol.Feature>} allMarkers
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {string}
 * @protected
 */
munimap.cluster.style.getMarkedDefaultLabel =
    function(allMarkers, feature, resolution) {
  var clusteredFeatures = munimap.cluster.getFeatures(feature);
  var markers = clusteredFeatures.filter(function(feat) {
    return goog.array.contains(allMarkers, feat);
  });

  var title;
  var titleParts = [];

  if (markers.length > 3) {
    var markerType = munimap.building.isBuilding(markers[0]) ?
        'budova' :
        'místnost';
    titleParts.push(markers.length + 'x ' + markerType);
  } else {
    if (munimap.building.isBuilding(markers[0])) {
      var range = munimap.cluster.getResolutionRange(resolution);
      var units = [];
      var unitsFunc =
          range === munimap.cluster.Resolutions.MARKERS_AND_FACULTIES ?
              munimap.building.getFaculties :
              munimap.building.getUnits;
      var buildingsWithoutUnits = [];
      markers.forEach(function(markedBuilding) {
        var uns = unitsFunc(markedBuilding);
        if (uns.length) {
          goog.array.extend(units, uns);
        } else {
          buildingsWithoutUnits.push(markedBuilding);
        }
      });
      titleParts = munimap.unit.getTitleParts(units);
      buildingsWithoutUnits.forEach(function(building) {
        var buildingTitle;
        var bUnits = munimap.building.getUnits(building);
        if (bUnits.length) {
          buildingTitle = munimap.unit.getTitleParts(bUnits);
        } else {
          buildingTitle =
              munimap.building.getDefaultLabel(building, resolution);
        }
        titleParts.push(buildingTitle);
      });
    } else {
      markers.forEach(function(room) {
        var roomTitle = munimap.style.getDefaultLabel(room, resolution);
        if (goog.isDefAndNotNull(roomTitle)) {
          titleParts.push(roomTitle);
        }
      });
    }
  }

  title = titleParts.join('\n');
  return title;
};
