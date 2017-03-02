goog.provide('munimap.building.layer');

goog.require('munimap.building');


/**
 * @return {ol.layer.Vector}
 */
munimap.building.layer.create = function() {
  var styleFragments = {
    selectedFloorFeature: {
      filter: munimap.building.style.selectedFloorFilter,
      style: munimap.building.style.selectedFloorFunction
    },
    outdoorFeature: {
      filter: goog.functions.TRUE,
      style: munimap.building.style.function
    }
  };

  return new ol.layer.Vector({
    id: munimap.building.LAYER_ID,
    'isFeatureClickable': munimap.building.isClickable,
    'featureClickHandler': munimap.building.featureClickHandler,
    'type': munimap.building.TYPE,
    'refreshStyleOnFloorChange': true,
    'styleFragments': styleFragments,
    source: munimap.building.STORE,
    maxResolution: munimap.complex.RESOLUTION.max,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};


/**
 * @return {ol.layer.Vector}
 */
munimap.building.layer.createLabel = function() {
  var styleFragments = {
    selectedFloorFeature: {
      filter: munimap.building.style.selectedFloorFilter,
      style: goog.functions.NULL
    },
    outdoorFeature: {
      filter: goog.functions.TRUE,
      style: munimap.building.style.labelFunction
    }
  };

  return new ol.layer.Vector({
    id: munimap.building.LABEL_LAYER_ID,
    'isFeatureClickable': munimap.building.isClickable,
    'featureClickHandler': munimap.building.featureClickHandler,
    'type': munimap.building.TYPE,
    'refreshStyleOnFloorChange': true,
    'styleFragments': styleFragments,
    source: munimap.building.STORE,
    updateWhileAnimating: true,
    updateWhileInteracting: false,
    renderOrder: null
  });
};
