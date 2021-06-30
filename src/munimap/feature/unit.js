/**
 * @module feature/unit
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from './building.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_load from '../load.js';
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {MUNIMAP_URL} from '../conf.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../load.js").ProcessorOptions} ProcessorOptions
 */

/**
 * @type {string}
 * @protected
 */
const PRIORITY_FIELD_NAME = 'priorita';

/**
 * @type {ol.source.Vector}
 * @const
 */
const STORE = new VectorSource();

/**
 * @type {TypeOptions}
 * @const
 */
const TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: MUNIMAP_URL,
  layerId: 6,
  name: 'unit',
};

/**
 * @param {ol.Feature} unit unit
 * @return {number} priority
 */
const getPriority = (unit) => {
  const result = unit.get(PRIORITY_FIELD_NAME);
  munimap_assert.assertNumber(result);
  return result;
};

/**
 * @param {string} where where
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const load = async (where) => {
  return munimap_load.features({
    source: STORE,
    type: TYPE,
    method: 'POST',
    returnGeometry: false,
    where: where,
  });
};

/**
 * @param {Array<number>} buildingIds ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadByHeadquartersIds = async (buildingIds) => {
  const where = 'budova_sidelni_id IN (' + buildingIds.join() + ')';
  return load(where);
};

/**
 * @param {Array<number>} complexIds complex ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadByHeadquartersComplexIds = async (complexIds) => {
  const where = 'areal_sidelni_id IN (' + complexIds.join() + ')';
  return load(where);
};

/**
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} opts
 */
const loadProcessor = async (options) => {
  const newBuildings = options.new;
  const buildingIdsToLoad = newBuildings.map((building) => {
    return building.get('inetId');
  });

  if (buildingIdsToLoad.length) {
    const units = await loadByHeadquartersIds(buildingIdsToLoad);
    newBuildings.forEach((building) => {
      const buildingUnits = units.filter((unit) => {
        return unit.get('budova_sidelni_id') === building.get('inetId');
      });
      building.set(munimap_building.UNITS_FIELD_NAME, buildingUnits);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {ol.Feature} unit unit
 * @param {string} lang lang
 * @return {?string} abbr
 */
const getAbbr = (unit, lang) => {
  const result = unit.get(
    munimap_lang.getMsg(munimap_lang.Translations.UNIT_ABBR_FIELD_NAME, lang)
  );
  munimap_assert.assert(result === null || munimap_utils.isString(result));
  return /** @type {?string}*/ (result);
};

/**
 * @param {ol.Feature} unit unit
 * @param {string} lang lang
 * @return {?string} title
 * @protected
 */
const getTitle = (unit, lang) => {
  const result = unit.get(
    munimap_lang.getMsg(munimap_lang.Translations.UNIT_TITLE_FIELD_NAME, lang)
  );
  munimap_assert.assert(result === null || munimap_utils.isString(result));
  return /** @type {?string}*/ (result);
};

/**
 * @param {Array.<ol.Feature>} buildings bldgs
 * @return {Array.<ol.Feature>} units
 */
const getUnitsOfBuildings = (buildings) => {
  return buildings.reduce((prev, building) => {
    const units = munimap_building.getUnits(building);
    prev.push(...units);
    return prev;
  }, []);
};

/**
 * @param {Array.<ol.Feature>} buildings bldgs
 * @return {Array.<ol.Feature>} faculties
 */
const getFacultiesOfBuildings = (buildings) => {
  return buildings.reduce((prev, building) => {
    const units = munimap_building.getFaculties(building);
    prev.push(...units);
    return prev;
  }, []);
};

/**
 * @param {Array.<ol.Feature>} units units
 * @param {string} lang lang
 * @return {Array.<string>} title parts
 */
const getTitleParts = (units, lang) => {
  const titleParts = [];
  units.sort((unit1, unit2) => {
    const priority1 = getPriority(unit1);
    const priority2 = getPriority(unit2);
    const result = priority2 - priority1;
    if (result === 0) {
      const title1 = getTitle(unit1, lang);
      const title2 = getTitle(unit2, lang);
      return title1.localeCompare(title2);
    } else {
      return result;
    }
  });
  if (units.length > 3) {
    const unitAbbrs = [];
    units.forEach((unit) => {
      const priority = getPriority(unit);
      switch (priority) {
        case 0:
          const abbr = getAbbr(unit, lang);
          if (abbr) {
            unitAbbrs.push(abbr);
          }
          break;
        case 1:
        case 2:
          titleParts.push(getTitle(unit, lang));
          break;
        default:
          break;
      }
    });
    titleParts.push(unitAbbrs.join(', '));
  } else {
    units.forEach((unit) => {
      titleParts.push(getTitle(unit, lang));
    });
  }
  return titleParts;
};

export {
  getPriority,
  loadByHeadquartersIds,
  loadByHeadquartersComplexIds,
  loadProcessor,
  getAbbr,
  getTitle,
  getTitleParts,
  getFacultiesOfBuildings,
  getUnitsOfBuildings,
};
