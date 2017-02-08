goog.provide('munimap.complex.layer');

goog.require('munimap.complex');


/**
 * @return {ol.layer.Vector}
 */
munimap.complex.layer.create = function() {
  return new ol.layer.Vector({
    id: munimap.complex.LAYER_ID,
    'isFeatureClickable': munimap.complex.isClickable,
    'featureClickHandler': munimap.complex.featureClickHandler,
    'type': munimap.complex.TYPE,
    source: munimap.complex.STORE,
    minResolution: munimap.complex.RESOLUTION.min,
    maxResolution: munimap.complex.RESOLUTION.max,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};
