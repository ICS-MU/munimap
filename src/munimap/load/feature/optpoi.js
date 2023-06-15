/**
 * @module
 */
import * as mm_utils from '../../utils/utils.js';
import {
  OPT_POI_TYPE,
  OptPoiIds,
  OptPoiLabels,
} from '../../feature/constants.js';
import {features} from '../load.js';
import {getOptPoiStore} from '../../source/constants.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @typedef {object} OptPoiLoadOptions
 * @property {Array<string>} [ids] ids
 * @property {Array<string>} [labels] labels
 * @property {Array<string>} [workplaces] workplaces
 * @property {Array<string>} [poiFilter] poiFilter
 */

/**
 * @param {string} targetId targetId
 * @param {OptPoiLoadOptions} options options
 * @return {Promise<Array<ol.Feature>>} load function
 */
const loadOptPois = (targetId, options) => {
  let labels = options.labels || [];
  const workplaces = options.workplaces || [];
  const poiFilter = options.poiFilter || [];
  const ids = options.ids || [];
  const idLabels = ids.map((id) => {
    const key = Object.keys(OptPoiIds).find((k) => OptPoiIds[k] === id);
    return OptPoiLabels[key];
  });
  labels = [...labels, ...idLabels];
  mm_utils.removeArrayDuplicates(labels);
  let where = `typ IN ('${labels.join("', '")}')`;
  where += ' AND volitelny=1';
  if (workplaces.length > 0) {
    where += ` AND pracoviste IN ('${workplaces.join("', '")}')`;
  }
  if (poiFilter.length > 0) {
    where += ` AND poznamka IN ('${poiFilter.join("', '")}')`;
  }
  const opts = {
    source: getOptPoiStore(targetId),
    type: OPT_POI_TYPE,
    where: where,
    method: 'POST',
    returnGeometry: false,
  };
  return features(opts);
};

export {loadOptPois};
