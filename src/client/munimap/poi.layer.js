goog.provide('munimap.poi.layer');

goog.require('munimap.poi');
goog.require('munimap.poi.style');


/**
 * @return {ol.layer.Vector}
 */
munimap.poi.layer.create = function() {
  var styleFragments = {
    activeFloorFeature: {
      filter: munimap.poi.style.activeFloorFilter,
      style: munimap.poi.style.activeFloorFunction
    },
    defaultFloorFeature: {
      filter: munimap.poi.style.defaultFloorFilter,
      style: munimap.poi.style.ENTRANCE
    },
    outdoorFeature: {
      filter: munimap.poi.style.outdoorFilter,
      style: munimap.poi.style.outdoorFunction
    }
  };

  return new ol.layer.Vector({
    id: munimap.poi.ACTIVE_LAYER_ID,
    isFeatureClickable: munimap.poi.isClickable,
    featureClickHandler: munimap.poi.featureClickHandler,
    clearSourceOnFloorChange: true,
    type: munimap.poi.TYPE,
    refreshStyleOnFloorChange: true,
    styleFragments: styleFragments,
    maxResolution: munimap.poi.RESOLUTION.max,
    source: null,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: null
  });
};
