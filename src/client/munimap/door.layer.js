goog.provide('munimap.door.layer');

goog.require('munimap.door');


/**
 * @return {ol.layer.Vector}
 */
munimap.door.layer.create = function() {
  var styleFragments = {
    'activeFloorFeature': {
      filter: goog.functions.TRUE,
      style: munimap.door.STYLE
    }
  };

  return new ol.layer.Vector({
    id: munimap.door.ACTIVE_LAYER_ID,
    'clearSourceOnFloorChange': true,
    'type': munimap.door.TYPE,
    'refreshStyleOnFloorChange': true,
    'styleFragments': styleFragments,
    maxResolution: munimap.door.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};
