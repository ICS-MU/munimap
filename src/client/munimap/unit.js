goog.provide('munimap.unit');

goog.require('munimap.load');
goog.require('munimap.range');


/**
 * @type {string}
 * @protected
 */
munimap.unit.ABBR_FIELD_NAME = 'zkratka_cs';


/**
 * @type {string}
 * @protected
 */
munimap.unit.PRIORITY_FIELD_NAME = 'priorita';


/**
 * @type {string}
 * @protected
 */
munimap.unit.TITLE_CS_FIELD_NAME = 'nazevk_cs';


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.unit.STORE = new ol.source.Vector();


/**
 * @type {munimap.type.Options}
 * @const
 */
munimap.unit.TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: munimap.load.MUNIMAP_URL,
  store: munimap.unit.STORE,
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
munimap.unit.load = function(where) {
  return munimap.load.features({
    source: munimap.unit.STORE,
    type: munimap.unit.TYPE,
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
munimap.unit.loadByHeadquartersIds = function(buildingIds) {
  var where = 'budova_sidelni_id IN (' + buildingIds.join() + ')';
  return munimap.unit.load(where);
};


/**
 * @param {Array<number>} complexIds
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
munimap.unit.loadByHeadquartersComplexIds = function(complexIds) {
  var where = 'areal_sidelni_id IN (' + complexIds.join() + ')';
  return munimap.unit.load(where);
};


/**
 * @param {ol.Feature} unit
 * @return {?string}
 * @protected
 */
munimap.unit.getAbbr = function(unit) {
  var result = unit.get(munimap.unit.ABBR_FIELD_NAME);
  goog.asserts.assert(result === null || goog.isString(result));
  return result;
};


/**
 * @param {ol.Feature} unit
 * @return {?string}
 * @protected
 */
munimap.unit.getTitle = function(unit) {
  var result = unit.get(munimap.unit.TITLE_CS_FIELD_NAME);
  goog.asserts.assert(result === null || goog.isString(result));
  return result;
};


/**
 * @param {ol.Feature} unit
 * @return {number}
 */
munimap.unit.getPriority = function(unit) {
  var result = unit.get(munimap.unit.PRIORITY_FIELD_NAME);
  goog.asserts.assertNumber(result);
  return result;
};


/**
 * @param {Array.<ol.Feature>} buildings
 * @return {Array.<ol.Feature>}
 */
munimap.unit.getUnitsOfBuildings = function(buildings) {
  return buildings.reduce(function(prev, building) {
    var units = munimap.building.getUnits(building);
    goog.array.extend(prev, units);
    return prev;
  }, []);
};


/**
 * @param {Array.<ol.Feature>} buildings
 * @return {Array.<ol.Feature>}
 */
munimap.unit.getFacultiesOfBuildings = function(buildings) {
  return buildings.reduce(function(prev, building) {
    var units = munimap.building.getFaculties(building);
    goog.array.extend(prev, units);
    return prev;
  }, []);
};


/**
 * @param {Array.<ol.Feature>} units
 * @return {Array.<string>}
 */
munimap.unit.getTitleParts = function(units) {
  var titleParts = [];
  if (units.length > 3) {
    var unitAbbrs = [];
    units.forEach(function(unit) {
      if (munimap.unit.getPriority(unit) > 0) {
        titleParts.push(munimap.unit.getTitle(unit));
      } else {
        var abbr = munimap.unit.getAbbr(unit);
        if (abbr) {
          unitAbbrs.push(abbr);
        }
      }
    });
    titleParts.push(unitAbbrs.join(', '));
  } else {
    units.forEach(function(unit) {
      titleParts.push(munimap.unit.getTitle(unit));
    });
  }
  return titleParts;
};
