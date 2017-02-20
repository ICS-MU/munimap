goog.provide('munimap.room.layer');

goog.require('munimap.room');


/**
 * @return {ol.layer.Vector}
 */
munimap.room.layer.create = function() {
  var styleFragments = {
    'defaultFloorFeature': {
      filter: munimap.room.style.defaultFloorFilter,
      style: munimap.room.style.function
    }
  };

  return new ol.layer.Vector({
    id: munimap.room.DEFAULT_LAYER_ID,
    'redrawOnFloorChange': true,
    'type': munimap.room.TYPE,
    'refreshStyleOnFloorChange': true,
    'styleFragments': styleFragments,
    maxResolution: munimap.floor.RESOLUTION.max,
    opacity: 0.4,
    source: munimap.room.DEFAULT_STORE,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};


/**
 * @return {ol.layer.Vector}
 */
munimap.room.layer.createActive = function() {
  var styleFragments = {
    'selectedFloorFeature': {
      filter: munimap.room.style.selectedFloorFilter,
      style: munimap.room.style.function
    },
    'activeFloorFeature': {
      filter: munimap.room.style.activeFloorFilter,
      style: munimap.room.style.function
    }
  };

  return new ol.layer.Vector({
    id: munimap.room.ACTIVE_LAYER_ID,
    'isFeatureClickable': munimap.room.isClickable,
    'featureClickHandler': munimap.room.featureClickHandler,
    'type': munimap.room.TYPE,
    'clearSourceOnFloorChange': true,
    'refreshStyleOnFloorChange': true,
    'styleFragments': styleFragments,
    maxResolution: munimap.floor.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};


/**
 * @return {ol.layer.Vector}
 */
munimap.room.layer.createLabel = function() {
  var styleFragments = {
    'selectedFloorFeature': {
      filter: munimap.room.style.selectedFloorFilter,
      style: munimap.room.style.labelFunction
    }
  };

  return new ol.layer.Vector({
    id: munimap.room.label.LAYER_ID,
    'clearSourceOnFloorChange': true,
    'type': munimap.room.TYPE,
    'refreshStyleOnFloorChange': true,
    'styleFragments': styleFragments,
    maxResolution: munimap.floor.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};
