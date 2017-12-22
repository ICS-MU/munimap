goog.provide('munimap.unit');

goog.require('munimap.lang');
goog.require('munimap.load');
goog.require('munimap.range');


/**
 * @type {string}
 * @protected
 */
munimap.unit.PRIORITY_FIELD_NAME = 'priorita';


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
    method: 'POST',
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
  var result = unit.get(munimap.lang.getMsg(
    munimap.lang.Translations.UNIT_ABBR_FIELD_NAME));
  goog.asserts.assert(result === null || goog.isString(result));
  return result;
};


/**
 * @param {ol.Feature} unit
 * @return {?string}
 * @protected
 */
munimap.unit.getTitle = function(unit) {
  var result = unit.get(munimap.lang.getMsg(
    munimap.lang.Translations.UNIT_TITLE_FIELD_NAME));
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
  units.sort(function(unit1, unit2) {
    var priority1 = munimap.unit.getPriority(unit1);
    var priority2 = munimap.unit.getPriority(unit2);
    var result = priority2 - priority1;
    if (result === 0) {
      var title1 = munimap.unit.getTitle(unit1);
      var title2 = munimap.unit.getTitle(unit2);
      return title1.localeCompare(title2);
    } else {
      return result;
    }
  });
  if (units.length > 3) {
    var unitAbbrs = [];
    units.forEach(function(unit) {
      var priority = munimap.unit.getPriority(unit);
      switch (priority) {
        case 0:
          var abbr = munimap.unit.getAbbr(unit);
          if (abbr) {
            unitAbbrs.push(abbr);
          }
          break;
        case 1:
        case 2:
          titleParts.push(munimap.unit.getTitle(unit));
          break;
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
