goog.provide('munimap.poi.layer');

goog.require('munimap.poi');


/**
 * @return {ol.layer.Vector}
 */
munimap.poi.layer.create = function() {
  return new ol.layer.Vector({
    id: munimap.poi.ACTIVE_LAYER_ID,
    'isFeatureClickable': munimap.poi.isClickable,
    'featureClickHandler': munimap.poi.featureClickHandler,
    'clearSourceOnFloorChange': true,
    'type': munimap.poi.TYPE,
    maxResolution: munimap.poi.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};
