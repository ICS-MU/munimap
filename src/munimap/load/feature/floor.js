/**
 * @module
 */

import * as actions from '../../redux/action.js';
import * as slctr from '../../redux/selector/selector.js';
import {FLOOR_TYPE} from '../../feature/constants.js';
import {features} from '../load.js';
import {getFloorLayerIdByCode} from '../../feature/floor.js';
import {getFloorStore} from '../../source/constants.js';
import {refreshFloorBasedStores} from '../../source/source.js';

/**
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../../conf.js").State} State
 */

/**
 * @typedef {object} LoadFloorsOptions
 * @property {string} targetId targetId
 * @property {string} floorCode floorCode
 * @property {boolean} newSelectedIsActive whether is already active
 */

/**
 * @param {string} targetId targetId
 * @param {string} where where
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadFloors = (targetId, where) => {
  return features({
    source: getFloorStore(targetId),
    type: FLOOR_TYPE,
    returnGeometry: false,
    where: where,
  });
};

/**
 * @param {LoadFloorsOptions} options opts
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const loadFloorsByFloorLayer = (options, asyncDispatch) => {
  const {targetId, floorCode, newSelectedIsActive} = options;
  const flId = getFloorLayerIdByCode(targetId, floorCode);
  if (!newSelectedIsActive) {
    const where = 'vrstvaId = ' + flId;
    loadFloors(targetId, where).then((floors) => {
      if (floors) {
        refreshFloorBasedStores(targetId);
      }
      asyncDispatch(actions.floors_loaded(true));
    });
  }
};

/**
 * @param {string} locationCode location code
 * @param {State} state state
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const loadFloorsForMarker = (locationCode, state, asyncDispatch) => {
  const targetId = slctr.getTargetId(state);
  const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
  const activeFloorCodes = slctr.getActiveFloorCodes(state);
  loadFloors(targetId, where).then((floors) =>
    asyncDispatch(
      actions.floors_loaded(activeFloorCodes.includes(locationCode))
    )
  );
};

/**
 * @param {string} locationCode location code
 * @param {State} state state
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const loadFloorsForRoom = (locationCode, state, asyncDispatch) => {
  const targetId = slctr.getTargetId(state);
  const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
  loadFloors(targetId, where).then((floors) =>
    asyncDispatch(actions.floors_loaded(true))
  );
};

/**
 * @param {string} locationCode location code
 * @param {State} state state
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const loadFloorsForBuilding = (locationCode, state, asyncDispatch) => {
  const targetId = slctr.getTargetId(state);
  const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
  loadFloors(targetId, where).then((floors) =>
    asyncDispatch(actions.floors_loaded(false))
  );
};

export {
  loadFloors,
  loadFloorsByFloorLayer,
  loadFloorsForBuilding,
  loadFloorsForMarker,
  loadFloorsForRoom,
};
