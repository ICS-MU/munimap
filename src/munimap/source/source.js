/**
 * @module source/source
 */

import {getActiveStore as getActiveDoorStore} from './door.js';
import {getActiveStore as getActiveRoomStore} from './room.js';

/**
 * Refresh means clear and reload data.
 */
const refreshFloorBasedStores = () => {
  getActiveRoomStore().refresh();
  getActiveDoorStore().refresh();
};

/**
 * Clear make source empty - but no reload is started.
 */
const clearFloorBasedStores = () => {
  getActiveRoomStore().clear();
  getActiveDoorStore().clear();
};

export {refreshFloorBasedStores, clearFloorBasedStores};
