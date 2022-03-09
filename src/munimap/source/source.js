/**
 * @module source/source
 */
import * as munimap_utils from '../utils/utils.js';
import {REQUIRED_CUSTOM_MARKERS} from '../create.js';
import {
  getActiveStore as getActiveDoorStore,
  getStore as getDoorStore,
} from './door.js';
import {getActiveStore as getActivePoiStore} from './poi.js';
import {
  getActiveStore as getActiveRoomStore,
  getStore as getRoomStore,
} from './room.js';
import {getStore as getBuildingStore} from './building.js';
import {getType as getBuildingType} from '../feature/building.constants.js';
import {getType as getDoorType} from '../feature/door.constants.js';
import {getStore as getOptPoiStore} from './optpoi.js';
import {getStore as getPubTranStore} from './pubtran.stop.js';
import {
  getType as getRoomType,
  isCode as isRoomCode,
  isCodeOrLikeExpr as isRoomCodeOrLikeExpr,
} from '../feature/room.constants.js';
import {getUid} from 'ol';
import {
  isCode as isDoorCode,
  isCodeOrLikeExpr as isDoorCodeOrLikeExpr,
} from '../feature/door.constants.js';
import {isCtgUid as isOptPoiCtgUid} from '../feature/optpoi.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 */

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

/**
 * @param {string} targetId targetId
 * @param {Array<string>} requiredMarkerIds ids
 * @return {Array<ol.Feature>} features
 */
const getFeaturesByIds = (targetId, requiredMarkerIds) => {
  const buildingType = getBuildingType();
  const buildings = getBuildingStore(targetId).getFeatures();
  const roomType = getRoomType();
  const rooms = getRoomStore(targetId).getFeatures();
  const doorType = getDoorType();
  const doors = getDoorStore(targetId).getFeatures();
  const optPois = getOptPoiStore(targetId).getFeatures();
  const result = requiredMarkerIds.map((initMarkerId) => {
    if (REQUIRED_CUSTOM_MARKERS[initMarkerId]) {
      return REQUIRED_CUSTOM_MARKERS[initMarkerId];
    } else if (isRoomCodeOrLikeExpr(initMarkerId)) {
      return rooms.find((room) => {
        return room.get(roomType.primaryKey) === initMarkerId;
      });
    } else if (isDoorCodeOrLikeExpr(initMarkerId)) {
      return doors.find((door) => {
        return door.get(doorType.primaryKey) === initMarkerId;
      });
    } else if (isOptPoiCtgUid(initMarkerId)) {
      return optPois.map((optPoi) => {
        const roomCode = optPoi.get('polohKodLokace');
        if (roomCode) {
          return rooms.find((room) => {
            const isValid = !room.get('detailsMoved');
            return isValid && room.get(roomType.primaryKey) === roomCode;
          });
        }
        return;
      });
    } else {
      return buildings.find((building) => {
        return building.get(buildingType.primaryKey) === initMarkerId;
      });
    }
  });
  //remove undefined (= invalid codes)
  return munimap_utils.flat(result).filter((item) => item);
};

/**
 * @param {string} targetId targetId
 * @param {Array<string>} initZoomTos ids
 * @return {Array<ol.Feature>} features
 */
const getZoomToFeatures = (targetId, initZoomTos) => {
  const buildingType = getBuildingType();
  const buildings = getBuildingStore(targetId).getFeatures();
  const roomType = getRoomType();
  const rooms = getRoomStore(targetId).getFeatures();
  const doorType = getDoorType();
  const doors = getDoorStore(targetId).getFeatures();
  return /**@type {Array<string>}*/ (initZoomTos).map((initZoomTo) => {
    if (isRoomCode(initZoomTo)) {
      return rooms.find((room) => {
        return room.get(roomType.primaryKey) === initZoomTo;
      });
    } else if (isDoorCode(initZoomTo)) {
      return doors.find((door) => {
        return door.get(doorType.primaryKey) === initZoomTo;
      });
    } else {
      return buildings.find((building) => {
        return building.get(buildingType.primaryKey) === initZoomTo;
      });
    }
  });
};

/**
 * @param {string} targetId targetId
 * @param {string} uid ol uid
 * @return {ol.Feature} feature
 */
const getPopupFeatureByUid = (targetId, uid) => {
  const suitableStores = [
    getBuildingStore(targetId),
    getRoomStore(targetId),
    getDoorStore(targetId),
    getPubTranStore(targetId),
  ];

  let feature = null;
  suitableStores.every((store) => {
    feature = store ? store.getFeatureByUid(uid) : null;
    return !munimap_utils.isDefAndNotNull(feature);
  });

  //check custom markers
  if (feature === null) {
    const k = `CUSTOM_MARKER_${targetId}`;
    Object.entries(REQUIRED_CUSTOM_MARKERS).every(([key, feat]) => {
      feature = key.startsWith(k) && getUid(feat) === uid ? feat : null;
      return !munimap_utils.isDefAndNotNull(feature);
    });
  }
  return feature;
};

export {
  clearFloorBasedStores,
  getFeaturesByIds,
  getPopupFeatureByUid,
  getZoomToFeatures,
  refreshFloorBasedStores,
};
