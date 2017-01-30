goog.provide('munimap.getDefaultLayers');

goog.require('munimap.building');
goog.require('munimap.complex');
goog.require('munimap.door');
goog.require('munimap.poi');
goog.require('munimap.room');
goog.require('munimap.room.label');


/**
 * @return {Array.<ol.layer.Layer>}
 */
munimap.getDefaultLayers = function() {
  var buildings = new ol.layer.Vector({
    id: munimap.building.LAYER_ID,
    'isFeatureClickable': munimap.building.isClickable,
    'featureClickHandler': munimap.building.featureClickHandler,
    source: munimap.building.STORE,
    maxResolution: munimap.complex.RESOLUTION.max,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });

  var rooms = new ol.layer.Vector({
    id: munimap.room.DEFAULT_LAYER_ID,
    maxResolution: munimap.floor.RESOLUTION.max,
    opacity: 0.4,
    source: munimap.room.DEFAULT_STORE,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });

  var activeRooms = new ol.layer.Vector({
    id: munimap.room.ACTIVE_LAYER_ID,
    'isFeatureClickable': munimap.room.isClickable,
    'featureClickHandler': munimap.room.featureClickHandler,
    maxResolution: munimap.floor.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });

  var doors = new ol.layer.Vector({
    id: munimap.door.ACTIVE_LAYER_ID,
    maxResolution: munimap.door.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });

  var poi = new ol.layer.Vector({
    id: munimap.poi.ACTIVE_LAYER_ID,
    maxResolution: munimap.poi.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });

  var roomLabels = new ol.layer.Vector({
    id: munimap.room.label.LAYER_ID,
    maxResolution: munimap.floor.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });

  var complexes = new ol.layer.Vector({
    id: munimap.complex.LAYER_ID,
    source: munimap.complex.STORE,
    minResolution: munimap.complex.RESOLUTION.min,
    maxResolution: munimap.complex.RESOLUTION.max,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });

  var buildingLabels = new ol.layer.Vector({
    id: munimap.building.LABEL_LAYER_ID,
    'isFeatureClickable': munimap.building.isClickable,
    'featureClickHandler': munimap.building.featureClickHandler,
    source: munimap.building.STORE,
    updateWhileAnimating: true,
    updateWhileInteracting: false,
    renderOrder: null
  });

  return [
    buildings,
    rooms,
    activeRooms,
    doors,
    poi,
    roomLabels,
    complexes,
    buildingLabels
  ];
};
