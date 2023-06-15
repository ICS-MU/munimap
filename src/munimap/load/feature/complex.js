/**
 * @module
 */
import * as mm_assert from '../../assert/assert.js';
import * as mm_complex from '../../feature/complex.js';
import * as mm_utils from '../../utils/utils.js';
import {
  BUILDING_COMPLEX_FIELD_NAME,
  BUILDING_COMPLEX_ID_FIELD_NAME,
  COMPLEX_ID_FIELD_NAME,
  COMPLEX_TYPE,
  COMPLEX_UNITS_FIELD_NAME,
} from '../../feature/constants.js';
import {features} from '../load.js';
import {getComplexStore} from '../../source/constants.js';
import {loadUnitsByHeadquartersComplexIds} from './unit.js';

/**
 * @typedef {import("../load.js").Processor} Processor
 * @typedef {import("../load.js").ProcessorOptions} ProcessorOptions
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @typedef {object} ComplexByIdsOptions
 * @property {Array<number>} ids ids
 * @property {Processor} [processor] processor
 */

/**
 * @param {string} targetId targetId
 * @param {ComplexByIdsOptions} options opts
 * @return {Promise<Array<ol.Feature>>} complexes
 * @protected
 */
const complexByIds = async (targetId, options) => {
  return features({
    source: getComplexStore(targetId),
    type: COMPLEX_TYPE,
    method: 'POST',
    returnGeometry: true,
    where: 'inetId IN (' + options.ids.join() + ')',
    processor: options.processor,
  });
};

/**
 * @param {string} targetId targetId
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} promise
 * @protected
 */
const complexLoadProcessorWithUnits = async (targetId, options) => {
  const newComplexes = options.new;
  const complexIdsToLoad = newComplexes.map((complex) => {
    return complex.get(COMPLEX_ID_FIELD_NAME);
  });

  if (complexIdsToLoad.length) {
    const units = await loadUnitsByHeadquartersComplexIds(
      targetId,
      complexIdsToLoad
    );
    newComplexes.forEach((complex) => {
      const complexUnits = units.filter((unit) => {
        return (
          unit.get('areal_sidelni_id') === complex.get(COMPLEX_ID_FIELD_NAME)
        );
      });
      complex.set(COMPLEX_UNITS_FIELD_NAME, complexUnits);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {string} targetId targetId
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} processor
 * @protected
 */
const complexLoadProcessor = async (targetId, options) => {
  const newBuildings = options.new;
  let complexIdsToLoad = [];
  const buildingsToLoadComplex = [];
  newBuildings.forEach((building) => {
    const complexId = building.get(BUILDING_COMPLEX_ID_FIELD_NAME);
    if (mm_utils.isNumber(complexId)) {
      mm_assert.assertNumber(complexId);
      const complex = mm_complex.getById(targetId, complexId);
      if (complex) {
        building.set(BUILDING_COMPLEX_FIELD_NAME, complex);
      } else {
        complexIdsToLoad.push(complexId);
        buildingsToLoadComplex.push(building);
      }
    } else {
      building.set(BUILDING_COMPLEX_FIELD_NAME, null);
    }
  });

  complexIdsToLoad = [...new Set(complexIdsToLoad)];
  if (complexIdsToLoad.length) {
    const complexes = await complexByIds(targetId, {
      ids: complexIdsToLoad,
      processor: mm_utils.partial(complexLoadProcessorWithUnits, targetId),
    });
    buildingsToLoadComplex.forEach((building) => {
      const complexId = building.get(BUILDING_COMPLEX_ID_FIELD_NAME);
      const complex = mm_complex.getById(targetId, complexId, complexes);
      if (!complex) {
        throw new Error('Complex ' + complexId + ' not found.');
      }
      building.set(BUILDING_COMPLEX_FIELD_NAME, complex || null);
    });
    return options;
  } else {
    return options;
  }
};

export {complexByIds, complexLoadProcessor, complexLoadProcessorWithUnits};
