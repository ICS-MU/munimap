/**
 * @module
 */
import * as mm_assert from '../../assert/assert.js';
import * as slctr from '../../redux/selector/selector.js';
import VectorSource from 'ol/source/Vector';
import {ROOM_TYPE} from '../../feature/constants.js';
import {featuresByCode, featuresForMap} from '../load.js';
import {
  getActiveRoomStore,
  getDefaultRoomStore,
  getRoomStore,
} from '../../source/constants.js';
import {getNotYetAddedFeatures} from '../../utils/store.js';

/**
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../load.js").FeaturesForMapOptions} FeaturesForMapOptions
 * @typedef {import("../load.js").FeatureLoaderParams} FeatureLoaderParams
 */

/**
 * @typedef {object} RoomsByCodeOptions
 * @property {Array<string>} codes codes
 * @property {Array<string>} likeExprs like expressions
 */

/**
 * @param {string} targetId targetId
 * @param {RoomsByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const roomsByCode = async (targetId, options) => {
  return featuresByCode({
    codes: options.codes,
    type: ROOM_TYPE,
    source: getRoomStore(targetId),
    likeExprs: options.likeExprs,
  });
};

/**
 * @param {string} targetId targetId
 * @param {FeaturesForMapOptions} options options
 * @param {FeatureLoaderParams} featureLoaderParams feature loader params
 */
const loadDefaultRooms = async (targetId, options, ...featureLoaderParams) => {
  const rooms = await featuresForMap(options, featureLoaderParams);
  const defaultRoomStore = getDefaultRoomStore(targetId);
  const roomsToAdd = getNotYetAddedFeatures(defaultRoomStore, rooms);
  defaultRoomStore.addFeatures(roomsToAdd);

  const onSuccess = featureLoaderParams[3];
  onSuccess && onSuccess(roomsToAdd);
};

/**
 *
 * @param {redux.Store} store store
 * @param {FeatureLoaderParams} featureLoaderParams feature loader params
 */
const loadActiveRooms = async (store, ...featureLoaderParams) => {
  const activeFloorCodes = slctr.getActiveFloorCodes(store.getState());
  const targetId = slctr.getTargetId(store.getState());

  let where;
  if (activeFloorCodes.length > 0) {
    const conditions = [];
    activeFloorCodes.forEach((floorCode) =>
      conditions.push(`polohKod LIKE '${floorCode}%'`)
    );
    where = conditions.join(' OR ');
    const opts = {
      source: getRoomStore(targetId),
      type: ROOM_TYPE,
      where: where,
      method: 'POST',
    };
    const rooms = await featuresForMap(opts, featureLoaderParams);
    const activeStore = getActiveRoomStore(targetId);
    mm_assert.assertInstanceof(activeStore, VectorSource);
    const roomsFromActiveFloor = rooms.filter((room) =>
      activeFloorCodes.includes(room.get('polohKod').substring(0, 8))
    );
    const roomsToAdd = getNotYetAddedFeatures(
      activeStore,
      roomsFromActiveFloor
    );
    activeStore.addFeatures(roomsToAdd);

    const onSuccess = featureLoaderParams[3];
    onSuccess && onSuccess(roomsToAdd);
  }
};

export {loadActiveRooms, loadDefaultRooms, roomsByCode};
