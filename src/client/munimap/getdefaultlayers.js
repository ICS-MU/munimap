goog.provide('munimap.getDefaultLayers');

goog.require('munimap.building.layer');
goog.require('munimap.complex.layer');
goog.require('munimap.door.layer');
goog.require('munimap.poi.layer');
goog.require('munimap.room.layer');


/**
 * @return {Array.<ol.layer.Layer>}
 */
munimap.getDefaultLayers = function() {
  var buildings = munimap.building.layer.create();
  var rooms = munimap.room.layer.create();
  var activeRooms = munimap.room.layer.createActive();
  var doors = munimap.door.layer.create();
  var poi = munimap.poi.layer.create();
  var roomLabels = munimap.room.layer.createLabel();
  var complexes = munimap.complex.layer.create();
  var buildingLabels = munimap.building.layer.createLabel();

  return [
    buildings,
    rooms,
    activeRooms,
    doors,
    poi,
    roomLabels,
    complexes,
    buildingLabels
  ];
};
