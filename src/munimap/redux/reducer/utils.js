/**
 * @module redux/reducer/utils
 */
import * as slctr from '../selector.js';
import {Feature} from 'ol';
import {
  isBuilding,
  isDoor,
  isOptPoiCtgUid,
  isRoom,
} from '../../feature/utils.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("../action.js").LoadedTypes} LoadedTypes
 * @typedef {import("../../utils/animation.js").ViewOptions} ViewOptions
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
 * @return {ViewOptions} result
 */
const getViewOptions = (state) => {
  return {
    rotation: slctr.getRotation(state),
    size: slctr.getSize(state),
    extent: slctr.getExtent(state),
    resolution: slctr.getResolution(state),
  };
};

export {getLoadedTypes, getViewOptions};
