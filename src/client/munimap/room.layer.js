goog.provide('munimap.room.layer');

goog.require('munimap.room');


/**
 * @return {ol.layer.Vector}
 */
munimap.room.layer.create = function() {
  return new ol.layer.Vector({
    id: munimap.room.DEFAULT_LAYER_ID,
    'redrawOnFloorChange': true,
    'type': munimap.room.TYPE,
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
  return new ol.layer.Vector({
    id: munimap.room.ACTIVE_LAYER_ID,
    'isFeatureClickable': munimap.room.isClickable,
    'featureClickHandler': munimap.room.featureClickHandler,
    'type': munimap.room.TYPE,
    'clearSourceOnFloorChange': true,
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
  return new ol.layer.Vector({
    id: munimap.room.label.LAYER_ID,
    'clearSourceOnFloorChange': true,
    'type': munimap.room.TYPE,
    maxResolution: munimap.floor.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};
