/**
 * @module source/_constants
 *
 * It must be in separate file because of multiple imports in munimap and
 * circular dependency.
 */

/**
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("./cluster.js").EnhancedClusterSource} EnhancedClusterSource
 */

/**
 * @type {Object<string, ol.source.Vector>}
 */
const BUILDING_STORES = {};

/**
 * @type {Object<string, EnhancedClusterSource>}
 */
const CLUSTER_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const MARKER_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const DOOR_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const ACTIVE_DOOR_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const POI_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const ACTIVE_POI_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const PUBTRAN_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const ROOM_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const DEFAULT_ROOM_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const ACTIVE_ROOM_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const COMPLEX_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const FLOOR_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const IDENTIFY_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const OPT_POI_STORES = {};

/**
 * @type {Object<string, ol.source.Vector>}
 */
const UNIT_STORES = {};

/**
 * Get building store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getBuildingStore = (targetId) => {
  return BUILDING_STORES[targetId];
};

/**
 * Set building store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setBuildingStore = (targetId, store) => {
  BUILDING_STORES[targetId] = store;
};

/**
 * Get cluster source.
 * @param {string} targetId targetId
 * @return {EnhancedClusterSource} store
 */
const getClusterStore = (targetId) => {
  return CLUSTER_STORES[targetId];
};

/**
 * Get vector source from cluster. ClusterSource/EnhancedClusterSource has
 * this.source_ where VectorSource and features are stored.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getClusterVectorStore = (targetId) => {
  return CLUSTER_STORES[targetId].getSource();
};

/**
 * Set cluster source.
 * @param {string} targetId targetId
 * @param {EnhancedClusterSource} store store
 */
const setClusterStore = (targetId, store) => {
  CLUSTER_STORES[targetId] = store;
};

/**
 * Get markers source.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getMarkerStore = (targetId) => {
  return MARKER_STORES[targetId];
};

/**
 * Set markers source.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setMarkerStore = (targetId, store) => {
  MARKER_STORES[targetId] = store;
};

/**
 * Get door store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getDoorStore = (targetId) => {
  return DOOR_STORES[targetId];
};

/**
 * Get active door store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getActiveDoorStore = (targetId) => {
  return ACTIVE_DOOR_STORES[targetId];
};

/**
 * Set door store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setDoorStore = (targetId, store) => {
  DOOR_STORES[targetId] = store;
};

/**
 * Set active door store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setActiveDoorStore = (targetId, store) => {
  ACTIVE_DOOR_STORES[targetId] = store;
};

/**
 * Get poi store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getPoiStore = (targetId) => {
  return POI_STORES[targetId];
};

/**
 * Get active poi store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getActivePoiStore = (targetId) => {
  return ACTIVE_POI_STORES[targetId];
};

/**
 * Set poi store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setPoiStore = (targetId, store) => {
  POI_STORES[targetId] = store;
};

/**
 * Set active poi store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setActivePoiStore = (targetId, store) => {
  ACTIVE_POI_STORES[targetId] = store;
};

/**
 * Get pubtran store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getPubTranStore = (targetId) => {
  return PUBTRAN_STORES[targetId];
};

/**
 * Set pubtran store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setPubTranStore = (targetId, store) => {
  PUBTRAN_STORES[targetId] = store;
};

/**
 * Get room store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getRoomStore = (targetId) => {
  return ROOM_STORES[targetId];
};

/**
 * Get default room store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getDefaultRoomStore = (targetId) => {
  return DEFAULT_ROOM_STORES[targetId];
};

/**
 * Get active room store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getActiveRoomStore = (targetId) => {
  return ACTIVE_ROOM_STORES[targetId];
};

/**
 * Set room store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setRoomStore = (targetId, store) => {
  ROOM_STORES[targetId] = store;
};

/**
 * Set default room store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setDefaultRoomStore = (targetId, store) => {
  DEFAULT_ROOM_STORES[targetId] = store;
};

/**
 * Set active room store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setActiveRoomStore = (targetId, store) => {
  ACTIVE_ROOM_STORES[targetId] = store;
};

/**
 * Get complex store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getComplexStore = (targetId) => {
  return COMPLEX_STORES[targetId];
};

/**
 * Set complex store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setComplexStore = (targetId, store) => {
  COMPLEX_STORES[targetId] = store;
};

/**
 * Get floor store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getFloorStore = (targetId) => {
  return FLOOR_STORES[targetId];
};

/**
 * Set floor store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setFloorStore = (targetId, store) => {
  FLOOR_STORES[targetId] = store;
};

/**
 * Get identify store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getIdentifyStore = (targetId) => {
  return IDENTIFY_STORES[targetId];
};

/**
 * Set identify store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setIdentifyStore = (targetId, store) => {
  IDENTIFY_STORES[targetId] = store;
};

/**
 * Get opt_poi store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getOptPoiStore = (targetId) => {
  return OPT_POI_STORES[targetId];
};

/**
 * Set opt_poi store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setOptPoiStore = (targetId, store) => {
  OPT_POI_STORES[targetId] = store;
};

/**
 * Get unit store.
 * @param {string} targetId targetId
 * @return {ol.source.Vector} store
 */
const getUnitStore = (targetId) => {
  return UNIT_STORES[targetId];
};

/**
 * Set unit store.
 * @param {string} targetId targetId
 * @param {ol.source.Vector} store store
 */
const setUnitStore = (targetId, store) => {
  UNIT_STORES[targetId] = store;
};

export {
  getActiveDoorStore,
  getActivePoiStore,
  getActiveRoomStore,
  getBuildingStore,
  getClusterStore,
  getClusterVectorStore,
  getComplexStore,
  getDefaultRoomStore,
  getDoorStore,
  getFloorStore,
  getIdentifyStore,
  getMarkerStore,
  getOptPoiStore,
  getPoiStore,
  getPubTranStore,
  getRoomStore,
  getUnitStore,
  setActiveDoorStore,
  setActivePoiStore,
  setActiveRoomStore,
  setBuildingStore,
  setClusterStore,
  setComplexStore,
  setDefaultRoomStore,
  setDoorStore,
  setFloorStore,
  setIdentifyStore,
  setMarkerStore,
  setOptPoiStore,
  setPoiStore,
  setPubTranStore,
  setRoomStore,
  setUnitStore,
};
