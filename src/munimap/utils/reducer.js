/**
 * @module utils/reducer
 */
import {Feature} from 'ol';
import {
  isBuilding,
  isDoor,
  isOptPoiCtgUid,
  isRoom,
} from '../feature/_constants.functions.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../redux/action.js").LoadedTypes} LoadedTypes
 */

/**
 * @typedef {Object} FeatureTimestampOptions
 * @property {number} buildingsTimestamp timestamp
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
  };
};

export {getFeaturesTimestamps, getLoadedTypes};
