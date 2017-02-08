goog.provide('munimap.door.layer');

goog.require('munimap.door');


/**
 * @return {ol.layer.Vector}
 */
munimap.door.layer.create = function() {
  return new ol.layer.Vector({
    id: munimap.door.ACTIVE_LAYER_ID,
    'clearSourceOnFloorChange': true,
    'type': munimap.door.TYPE,
    maxResolution: munimap.door.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};
