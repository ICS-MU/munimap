/**
 * @module
 */
import * as slctr from '../../redux/selector/selector.js';
import {DOOR_TYPE} from '../../feature/constants.js';
import {featuresByCode, featuresForMap} from '../load.js';
import {getActiveDoorStore, getDoorStore} from '../../source/constants.js';
import {getNotYetAddedFeatures} from '../../utils/store.js';

/**
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @typedef {object} DoorsByCodeOptions
 * @property {Array<string>} codes codes
 * @property {Array<string>} likeExprs like expressions
 */

/**
 * @param {string} targetId targetId
 * @param {DoorsByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const doorsByCode = async (targetId, options) => {
  return featuresByCode({
    codes: options.codes,
    likeExprs: options.likeExprs,
    type: DOOR_TYPE,
    source: getDoorStore(targetId),
  });
};

/**
 * @param {redux.Store} store store
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 */
const loadActiveDoors = async (store, extent, resolution, projection) => {
  const activeFloorCodes = slctr.getActiveFloorCodes(store.getState());
  const targetId = slctr.getTargetId(store.getState());
  let where;
  if (activeFloorCodes.length > 0) {
    const conditions = [];
    activeFloorCodes.forEach((floor) =>
      conditions.push(`polohKodPodlazi LIKE '${floor}%'`)
    );
    where = conditions.join(' OR ');
    const opts = {
      source: getDoorStore(targetId),
      type: DOOR_TYPE,
      where: where,
      method: 'POST',
    };
    const doors = await featuresForMap(opts, extent, resolution, projection);
    const activeStore = getActiveDoorStore(targetId);
    const doorsFromActiveFloor = doors.filter((door) =>
      activeFloorCodes.includes(door.get('polohKodPodlazi'))
    );
    const doorsToAdd = getNotYetAddedFeatures(
      activeStore,
      doorsFromActiveFloor
    );
    activeStore.addFeatures(doorsToAdd);
  }
};

export {doorsByCode, loadActiveDoors};
