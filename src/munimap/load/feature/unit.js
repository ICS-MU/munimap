/**
 * @module
 */

import {BUILDING_UNITS_FIELD_NAME, UNIT_TYPE} from '../../feature/constants.js';
import {features} from '../load.js';
import {getUnitStore} from '../../source/constants.js';

/**
 * @typedef {import("../load.js").Processor} Processor
 * @typedef {import("../load.js").ProcessorOptions} ProcessorOptions
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @param {string} targetId targetId
 * @param {string} where where
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const loadUnits = async (targetId, where) => {
  return features({
    source: getUnitStore(targetId),
    type: UNIT_TYPE,
    method: 'POST',
    returnGeometry: false,
    where: where,
  });
};

/**
 * @param {string} targetId targetId
 * @param {Array<number>} buildingIds ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadUnitsByHeadquartersIds = async (targetId, buildingIds) => {
  const where = 'budova_sidelni_id IN (' + buildingIds.join() + ')';
  return loadUnits(targetId, where);
};

/**
 * @param {string} targetId targetId
 * @param {Array<number>} complexIds complex ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadUnitsByHeadquartersComplexIds = async (targetId, complexIds) => {
  const where = 'areal_sidelni_id IN (' + complexIds.join() + ')';
  return loadUnits(targetId, where);
};

/**
 * @param {string} targetId targetId
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} opts
 */
const unitLoadProcessor = async (targetId, options) => {
  const newBuildings = options.new;
  const buildingIdsToLoad = newBuildings.map((building) => {
    return building.get('inetId');
  });

  if (buildingIdsToLoad.length) {
    const units = await loadUnitsByHeadquartersIds(targetId, buildingIdsToLoad);
    newBuildings.forEach((building) => {
      const buildingUnits = units.filter((unit) => {
        return unit.get('budova_sidelni_id') === building.get('inetId');
      });
      building.set(BUILDING_UNITS_FIELD_NAME, buildingUnits);
    });
    return options;
  } else {
    return options;
  }
};

export {
  loadUnits,
  loadUnitsByHeadquartersComplexIds,
  loadUnitsByHeadquartersIds,
  unitLoadProcessor,
};
