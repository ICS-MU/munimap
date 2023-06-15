/**
 * @module source/source
 */
import * as mm_utils from '../utils/utils.js';
import * as srcs from './constants.js';
import {BUILDING_TYPE, DOOR_TYPE, ROOM_TYPE} from '../feature/constants.js';
import {GeoJSON} from 'ol/format.js';
import {MultiPolygon, Point, Polygon} from 'ol/geom.js';
import {REQUIRED_CUSTOM_MARKERS} from '../constants.js';
import {assertExists} from '../assert/assert.js';
import {featureExtentIntersect} from '../utils/geom.js';
import {
  getByCode as getBuildingByCode,
  hasInnerGeometry,
} from '../feature/building.js';
import {getOptPoiStore} from './constants.js';
import {getUid} from 'ol';
import {
  isBuilding,
  isDoorCodeOrLikeExpr,
  isOptPoiCtgUid,
  isRoom,
  isRoomCodeOrLikeExpr,
} from '../feature/utils.js';
import {testCodeOrLikeExpr} from '../utils/regex.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/source").Vector} ol.source.Vector
 */

/**
 * Refresh means clear and reload data.
 * @param {string} targetId targetId
 */
const refreshFloorBasedStores = (targetId) => {
  srcs.getActiveRoomStore(targetId).refresh();
  srcs.getActiveDoorStore(targetId).refresh();
  srcs.getActivePoiStore(targetId).refresh();
};

/**
 * Clear make source empty - but no reload is started.
 * @param {string} targetId targetId
 */
const clearFloorBasedStores = (targetId) => {
  srcs.getActiveRoomStore(targetId).clear();
  srcs.getActiveDoorStore(targetId).clear();
};

/**
 * @param {string} targetId targetId
 * @param {Array<string>} requiredMarkerIds ids
 * @return {Array<ol.Feature>} features
 */
const getFeaturesByIds = (targetId, requiredMarkerIds) => {
  const buildings = srcs.getBuildingStore(targetId).getFeatures();
  const rooms = srcs.getRoomStore(targetId).getFeatures();
  // const doorType = DOOR_TYPE;
  const doors = srcs.getDoorStore(targetId).getFeatures();
  const optPois = getOptPoiStore(targetId).getFeatures();
  const result = [];
  requiredMarkerIds.forEach((initMarkerId) => {
    if (REQUIRED_CUSTOM_MARKERS[initMarkerId]) {
      result.push(REQUIRED_CUSTOM_MARKERS[initMarkerId]);
    } else if (isRoomCodeOrLikeExpr(initMarkerId)) {
      result.push(
        ...rooms.filter((room) => {
          return testCodeOrLikeExpr(
            initMarkerId,
            room.get(ROOM_TYPE.primaryKey)
          );
        })
      );
    } else if (isDoorCodeOrLikeExpr(initMarkerId)) {
      result.push(
        ...doors.filter((door) => {
          return testCodeOrLikeExpr(
            initMarkerId,
            door.get(DOOR_TYPE.primaryKey)
          );
        })
      );
    } else if (isOptPoiCtgUid(initMarkerId)) {
      result.push(
        ...optPois.map((optPoi) => {
          const roomCode = optPoi.get('polohKodLokace');
          if (roomCode) {
            return rooms.find((room) => {
              const isValid = !room.get('detailsMoved');
              return isValid && room.get(ROOM_TYPE.primaryKey) === roomCode;
            });
          }
          return;
        })
      );
    } else {
      result.push(
        ...buildings.filter((building) => {
          return testCodeOrLikeExpr(
            initMarkerId,
            building.get(BUILDING_TYPE.primaryKey)
          );
        })
      );
    }
  });
  //remove undefined (= invalid codes)
  return mm_utils.flat(result).filter((item) => item);
};

/**
 * @param {string} targetId targetId
 * @param {Array<string>} initZoomTos ids
 * @return {Array<ol.Feature>} features
 */
const getZoomToFeatures = (targetId, initZoomTos) => {
  const buildings = srcs.getBuildingStore(targetId).getFeatures();
  const rooms = srcs.getRoomStore(targetId).getFeatures();
  const doors = srcs.getDoorStore(targetId).getFeatures();
  const result = [];
  /**@type {Array<string>}*/ (initZoomTos).forEach((initZoomTo) => {
    if (isRoomCodeOrLikeExpr(initZoomTo)) {
      result.push(
        ...rooms.filter((room) => {
          return testCodeOrLikeExpr(initZoomTo, room.get(ROOM_TYPE.primaryKey));
        })
      );
    } else if (isDoorCodeOrLikeExpr(initZoomTo)) {
      result.push(
        ...doors.filter((door) => {
          return testCodeOrLikeExpr(initZoomTo, door.get(DOOR_TYPE.primaryKey));
        })
      );
    } else {
      result.push(
        ...buildings.filter((building) => {
          return testCodeOrLikeExpr(
            initZoomTo,
            building.get(BUILDING_TYPE.primaryKey)
          );
        })
      );
    }
  });
  return mm_utils.flat(result).filter((item) => item);
};

/**
 * @param {string} targetId targetId
 * @param {string} uid ol uid
 * @return {ol.Feature} feature
 */
const getPopupFeatureByUid = (targetId, uid) => {
  const suitableStores = [
    srcs.getBuildingStore(targetId),
    srcs.getRoomStore(targetId),
    srcs.getDoorStore(targetId),
    srcs.getPubTranStore(targetId),
  ];

  let feature = null;
  suitableStores.every((store) => {
    feature = store ? store.getFeatureByUid(uid) : null;
    return !mm_utils.isDefAndNotNull(feature);
  });

  //check custom markers
  if (feature === null) {
    const k = `CUSTOM_MARKER_${targetId}`;
    Object.entries(REQUIRED_CUSTOM_MARKERS).every(([key, feat]) => {
      feature = key.startsWith(k) && getUid(feat) === uid ? feat : null;
      return !mm_utils.isDefAndNotNull(feature);
    });
  }
  return feature;
};

/**
 * @param {ol.source.Vector} store store
 * @param {ol.extent.Extent} extent extent
 * @return {ol.Feature} marker
 */
const getLargestInExtent = (store, extent) => {
  let selectFeature;
  let maxArea;
  const format = new GeoJSON();
  store.forEachFeatureIntersectingExtent(extent, (f) => {
    if (isBuilding(f) && hasInnerGeometry(f)) {
      const intersect = featureExtentIntersect(f, extent, format);
      const geom = intersect.getGeometry();
      if (geom instanceof Polygon || geom instanceof MultiPolygon) {
        const area = geom.getArea();
        if (!mm_utils.isDef(maxArea) || area > maxArea) {
          maxArea = area;
          selectFeature = f;
        }
      }
    }
  });
  return selectFeature || null;
};

/**
 * @param {ol.Feature} feature feature
 * @param {string} targetId targetId
 * @return {ol.Feature} result bldg
 */
const getBuildingForFictive = (feature, targetId) => {
  assertExists(targetId, 'TargetId must be defined.');
  let result = null;
  if (isRoom(feature) && feature.getGeometry() instanceof Point) {
    //fictive room
    const locCode = /**@type {string}*/ (feature.get('polohKod'));
    result = getBuildingByCode(targetId, locCode);
  }
  return result;
};

export {
  clearFloorBasedStores,
  getBuildingForFictive,
  getFeaturesByIds,
  getLargestInExtent,
  getPopupFeatureByUid,
  getZoomToFeatures,
  refreshFloorBasedStores,
};
