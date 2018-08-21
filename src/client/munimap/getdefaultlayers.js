goog.provide('munimap.getDefaultLayers');

goog.require('munimap.building.layer');
goog.require('munimap.complex.layer');
goog.require('munimap.door.layer');
goog.require('munimap.poi.layer');
goog.require('munimap.room.layer');


/**
 * @param {ol.Map} map
 *
 * @return {Array.<ol.layer.Layer>}
 */
munimap.getDefaultLayers = function(map) {
  var result = [];
  var buildings = munimap.building.layer.create();
  var rooms = munimap.room.layer.create();
  var activeRooms = munimap.room.layer.createActive();
  var doors = munimap.door.layer.create();
  var poi = munimap.poi.layer.create();
  var roomLabels = munimap.room.layer.createLabel(map);
  var buildingLabels = munimap.building.layer.createLabel();
  result.push(
    buildings,
    rooms,
    activeRooms,
    doors,
    poi,
    roomLabels,
    buildingLabels
  );
  if (goog.isDefAndNotNull(munimap.getProps(map).options.labels) &&
    !munimap.getProps(map).options.labels) {
    return result;
  }
  var complexes = munimap.complex.layer.create();
  result.push(complexes);
  return result;
};
