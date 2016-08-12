goog.provide('ics.map.unit');

goog.require('ics.map.load');
goog.require('ics.map.range');


/**
 * @type {string}
 */
ics.map.unit.ABBR_FIELD_NAME = 'zkratka_cs';


/**
 * @type {string}
 */
ics.map.unit.TITLE_CS_FIELD_NAME = 'nazevk_cs';


/**
 * @type {ol.source.Vector}
 * @const
 */
ics.map.unit.STORE = new ol.source.Vector();


/**
 * @type {ics.map.type.Options}
 * @const
 */
ics.map.unit.TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: ics.map.load.MUNIMAP_URL,
  store: ics.map.unit.STORE,
  layerId: 6,
  name: 'unit'
};


/**
 *
 * @param {string} where
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
ics.map.unit.load = function(where) {
  return ics.map.load.features({
    source: ics.map.unit.STORE,
    type: ics.map.unit.TYPE,
    returnGeometry: false,
    where: where
  });
};


/**
 *
 * @param {Array<number>} buildingIds
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
ics.map.unit.loadByHeadquartersIds = function(buildingIds) {
  var where = 'budova_sidelni_id IN (' + buildingIds.join() + ')';
  return ics.map.unit.load(where);
};


/**
 * @param {Array<number>} complexIds
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
ics.map.unit.loadByHeadquartersComplexIds = function(complexIds) {
  var where = 'areal_sidelni_id IN (' + complexIds.join() + ')';
  return ics.map.unit.load(where);
};
