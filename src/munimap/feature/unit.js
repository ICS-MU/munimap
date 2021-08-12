/**
 * @module feature/unit
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from './building.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
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
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} Type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'OBJECTID',
      serviceUrl: MUNIMAP_URL,
      layerId: 6,
      name: 'unit',
    };
  }
  return TYPE;
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
  getAbbr,
  getTitle,
  getTitleParts,
  getFacultiesOfBuildings,
  getUnitsOfBuildings,
  getType,
};
