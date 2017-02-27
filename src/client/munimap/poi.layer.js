goog.provide('munimap.poi.layer');

goog.require('munimap.poi');


/**
 * @return {ol.layer.Vector}
 */
munimap.poi.layer.create = function() {
  var styleFragments = {
    activeFloorFeature: {
      filter: munimap.poi.style.activeFloorFilter,
      style: munimap.poi.style.activeFloorFunction
    },
    outdoorFeature: {
      filter: munimap.poi.style.outdoorFilter,
      style: munimap.poi.style.outdoorFunction
    },
    defaultFloorFeature: {
      filter: munimap.poi.style.defaultFloorFilter,
      style: munimap.poi.style.defaultFunction
    }
  };

  return new ol.layer.Vector({
    id: munimap.poi.ACTIVE_LAYER_ID,
    'isFeatureClickable': munimap.poi.isClickable,
    'featureClickHandler': munimap.poi.featureClickHandler,
    'clearSourceOnFloorChange': true,
    'type': munimap.poi.TYPE,
    'refreshStyleOnFloorChange': true,
    'styleFragments': styleFragments,
    maxResolution: munimap.poi.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};
