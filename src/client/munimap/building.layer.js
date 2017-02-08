goog.provide('munimap.building.layer');

goog.require('munimap.building');


/**
 * @return {ol.layer.Vector}
 */
munimap.building.layer.create = function() {
  return new ol.layer.Vector({
    id: munimap.building.LAYER_ID,
    'isFeatureClickable': munimap.building.isClickable,
    'featureClickHandler': munimap.building.featureClickHandler,
    'type': munimap.building.TYPE,
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
  return new ol.layer.Vector({
    id: munimap.building.LABEL_LAYER_ID,
    'isFeatureClickable': munimap.building.isClickable,
    'featureClickHandler': munimap.building.featureClickHandler,
    'type': munimap.building.TYPE,
    source: munimap.building.STORE,
    updateWhileAnimating: true,
    updateWhileInteracting: false,
    renderOrder: null
  });
};
