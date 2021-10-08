/**
 * @module source/source
 */

import {getActiveStore as getActiveRoomStore} from './room.js';

/**
 * Refresh means clear and reload data.
 */
const refreshFloorBasedStores = () => {
  getActiveRoomStore().refresh();
};

/**
 * Clear make source empty - but no reload is started.
 */
const clearFloorBasedStores = () => {
  getActiveRoomStore().clear();
};

export {refreshFloorBasedStores, clearFloorBasedStores};
