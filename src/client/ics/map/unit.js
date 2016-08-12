goog.provide('ics.map.unit');

goog.require('ics.map.load');
goog.require('ics.map.range');


/**
 * @type {string}
 * @protected
 */
ics.map.unit.ABBR_FIELD_NAME = 'zkratka_cs';


/**
 * @type {string}
 * @protected
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


/**
 * @param {Array.<ol.Feature>} units
 * @return {Array.<string>}
 */
ics.map.unit.getTitleParts = function(units) {
  var titleParts = [];
  if (units.length > 0) {
    if (units.length > 3) {
      var unitAbbrs = [];
      units.forEach(function(unit) {
        unitAbbrs.push(
            /**@type {string}*/(unit.get(ics.map.unit.ABBR_FIELD_NAME)));
      });
      titleParts.push(unitAbbrs.join(', '));
    } else {
      units.forEach(function(unit) {
        titleParts.push(/**@type {string}*/
            (unit.get(ics.map.unit.TITLE_CS_FIELD_NAME)));
      });
    }
  }
  return titleParts;
};
