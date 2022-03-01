/**
 * @module source/source
 */

import {getActiveStore as getActiveDoorStore} from './door.js';
import {getActiveStore as getActivePoiStore} from './poi.js';
import {getActiveStore as getActiveRoomStore} from './room.js';

/**
 * Refresh means clear and reload data.
 * @param {string} targetId targetId
 */
const refreshFloorBasedStores = (targetId) => {
  getActiveRoomStore(targetId).refresh();
  getActiveDoorStore(targetId).refresh();
  getActivePoiStore(targetId).refresh();
};

/**
 * Clear make source empty - but no reload is started.
 * @param {string} targetId targetId
 */
const clearFloorBasedStores = (targetId) => {
  getActiveRoomStore(targetId).clear();
  getActiveDoorStore(targetId).clear();
};

export {refreshFloorBasedStores, clearFloorBasedStores};
