/**
 * @module utils/reducer
 */
import {Feature} from 'ol';
import {isBuilding} from '../feature/building.js';
import {isDoor} from '../feature/door.constants.js';
import {isCtgUid as isOptPoiCtgUid} from '../feature/optpoi.constants.js';
import {isRoom} from '../feature/room.constants.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../redux/action.js").LoadedTypes} LoadedTypes
 */

/**
 * @typedef {Object} FeatureTimestampOptions
 * @property {number} buildingsTimestamp timestamp
 * @property {number} defaultRoomsTimestamp timestamp
 * @property {number} doorsTimestamp timestamp
 */

const getLoadedTypes = (features, opt_requiredMarkers) => {
  const result = {
    building: features.some((f) => f instanceof Feature && isBuilding(f)),
    room: features.some((f) => f instanceof Feature && isRoom(f)),
    door: features.some((f) => f instanceof Feature && isDoor(f)),
  };
  if (opt_requiredMarkers) {
    result.optPoi = opt_requiredMarkers.some((el) => isOptPoiCtgUid(el));
  }
  return result;
};

/**
 * @param {State} state state
 * @param {LoadedTypes} loadedTypes loaded types
 * @return {FeatureTimestampOptions} timestamps
 */
const getFeaturesTimestamps = (state, loadedTypes) => {
  return {
    buildingsTimestamp: Object.values(loadedTypes).some((t) => t)
      ? Date.now()
      : state.buildingsTimestamp,
    defaultRoomsTimestamp: loadedTypes.room
      ? Date.now()
      : state.defaultRoomsTimestamp,
    doorsTimestamp: loadedTypes.door ? Date.now() : state.doorsTimestamp,
  };
};

export {getFeaturesTimestamps, getLoadedTypes};
