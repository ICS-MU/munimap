/**
 * @module source/source
 */
import * as munimap_utils from '../utils/utils.js';
import * as srcs from './_constants.js';
import {GeoJSON} from 'ol/format';
import {MultiPolygon, Polygon} from 'ol/geom';
import {REQUIRED_CUSTOM_MARKERS} from '../create.constants.js';
import {featureExtentIntersect} from '../utils/geom.js';
import {getType as getBuildingType} from '../feature/building.constants.js';
import {getType as getDoorType} from '../feature/door.constants.js';
import {getOptPoiStore} from './_constants.js';
import {
  getType as getRoomType,
  isCode as isRoomCode,
  isCodeOrLikeExpr as isRoomCodeOrLikeExpr,
} from '../feature/room.constants.js';
import {getUid} from 'ol';
import {hasInnerGeometry} from '../feature/building.js';
import {
  isCode as isDoorCode,
  isCodeOrLikeExpr as isDoorCodeOrLikeExpr,
} from '../feature/door.constants.js';
import {isCtgUid as isOptPoiCtgUid} from '../feature/optpoi.constants.js';

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
  const buildingType = getBuildingType();
  const buildings = srcs.getBuildingStore(targetId).getFeatures();
  const roomType = getRoomType();
  const rooms = srcs.getRoomStore(targetId).getFeatures();
  const doorType = getDoorType();
  const doors = srcs.getDoorStore(targetId).getFeatures();
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
  const buildings = srcs.getBuildingStore(targetId).getFeatures();
  const roomType = getRoomType();
  const rooms = srcs.getRoomStore(targetId).getFeatures();
  const doorType = getDoorType();
  const doors = srcs.getDoorStore(targetId).getFeatures();
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
    srcs.getBuildingStore(targetId),
    srcs.getRoomStore(targetId),
    srcs.getDoorStore(targetId),
    srcs.getPubTranStore(targetId),
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
    if (hasInnerGeometry(f)) { //opravit
      const intersect = featureExtentIntersect(f, extent, format);
      const geom = intersect.getGeometry();
      if (geom instanceof Polygon || geom instanceof MultiPolygon) {
        const area = geom.getArea();
        if (!munimap_utils.isDef(maxArea) || area > maxArea) {
          maxArea = area;
          selectFeature = f;
        }
      }
    }
  });
  return selectFeature || null;
};

export {
  clearFloorBasedStores,
  getFeaturesByIds,
  getLargestInExtent,
  getPopupFeatureByUid,
  getZoomToFeatures,
  refreshFloorBasedStores,
};
