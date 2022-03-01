/* eslint-disable no-console */
/**
 * @module redux/selector
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_floor from '../feature/floor.js';
import * as munimap_identify from '../identify/identify.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import View from 'ol/View';
import {
  LABEL_LAYER_ID as BUILDING_LABEL_LAYER_ID,
  LAYER_ID as BUILDING_LAYER_ID,
} from '../layer/building.js';
import {BUILDING_RESOLUTION, ROOM_RESOLUTION} from '../cluster/cluster.js';
import {LAYER_ID as CLUSTER_LAYER_ID} from '../layer/cluster.js';
import {LAYER_ID as COMPLEX_LAYER_ID} from '../layer/complex.js';
import {ENABLE_SELECTOR_LOGS, INITIAL_STATE} from '../conf.js';
import {FEATURE_TYPE_PROPERTY_NAME} from '../feature/feature.js';
import {GeoJSON} from 'ol/format';
import {
  IDENTIFY_CALLBACK_STORE,
  MARKER_LABEL_STORE,
  REQUIRED_CUSTOM_MARKERS,
  TARGET_ELEMENTS_STORE,
} from '../create.js';
import {LAYER_ID as IDENTIFY_LAYER_ID} from '../layer/identify.js';
import {LAYER_ID as MARKER_LAYER_ID} from '../layer/marker.js';
import {RESOLUTION as MARKER_RESOLUTION} from '../feature/marker.js';
import {MultiPolygon, Polygon} from 'ol/geom';
import {
  Ids as OptPoiIds,
  isCtgUid as isOptPoiCtgUid,
} from '../feature/optpoi.js';
import {ACTIVE_LAYER_ID as POI_ACTIVE_LAYER_ID} from '../layer/poi.js';
import {PURPOSE as POI_PURPOSE} from '../feature/poi.js';
import {
  RESOLUTION as PUBTRAN_RESOLUTION,
  getDetailHtml,
  getType as getPubtranType,
} from '../feature/pubtran.stop.js';
import {Resolutions as PoiResolutions} from '../style/poi.js';
import {
  ACTIVE_LAYER_ID as ROOM_ACTIVE_LAYER_ID,
  LABEL_LAYER_ID as ROOM_LABEL_LAYER_ID,
  DEFAULT_LAYER_ID as ROOM_LAYER_ID,
} from '../layer/room.js';
import {
  STAIRCASE_ICON,
  defaultStyleFunction as defaultRoomStyleFunction,
  getStaircase,
  labelFunction as roomLabelStyleFunction,
} from '../style/room.js';
import {
  activeStyleFunction as activePoiStyleFunction,
  defaultStyleFunction as defaultPoiStyleFunction,
  outdoorStyleFunction as outdoorPoiStyleFunction,
} from '../style/poi.js';
import {styleFunction as clusterStyleFunction} from '../style/cluster.js';
import {styleFunction as complexStyleFunction} from '../style/complex.js';
import {defaults as control_defaults} from 'ol/control';
import {createLayer as createBasemapLayer} from '../layer/basemap.js';
import {createSelector as createReselectSelector} from 'reselect';
import {
  ofFeatures as extentOfFeatures,
  getBufferValue,
} from '../utils/extent.js';
import {featureExtentIntersect, getBetterInteriorPoint} from '../utils/geom.js';
import {getAnimationDuration} from '../utils/animation.js';
import {
  getByCode as getBuildingByCode,
  getNamePart as getBuildingNamePart,
  getTitleWithoutOrgUnit as getBuildingTitleWithoutOrgUnit,
  getType as getBuildingType,
  getComplex,
  getSelectedFloorCode as getSelectedFloorCodeForBuilding,
  hasInnerGeometry,
  isBuilding,
  isCode as isBuildingCode,
  isSelected,
} from '../feature/building.js';
import {getBuildingCount} from '../feature/complex.js';
import {getStore as getBuildingStore} from '../source/building.js';
import {getStore as getDoorStore} from '../source/door.js';
import {
  getType as getDoorType,
  isDoor,
  isCode as isDoorCode,
  isCodeOrLikeExpr as isDoorCodeOrLikeExpr,
} from '../feature/door.js';
import {getStore as getFloorStore} from '../source/floor.js';
import {getStore as getIdentifyStore} from '../source/identify.js';
import {getStore as getMarkerStore} from '../source/marker.js';
import {getStore as getOptPoiStore} from '../source/optpoi.js';
import {getPairedBasemap, isArcGISBasemap} from '../layer/basemap.js';
import {getStore as getPubtranStore} from '../source/pubtran.stop.js';
import {getStore as getRoomStore} from '../source/room.js';
import {
  getType as getRoomType,
  isRoom,
  isCode as isRoomCode,
  isCodeOrLikeExpr as isRoomCodeOrLikeExpr,
} from '../feature/room.js';
import {getUid} from 'ol';
import {styleFunction as identifyStyleFunction} from '../style/identify.js';
import {isCustom as isCustomMarker} from '../feature/marker.custom.js';
import {labelFunction, styleFunction} from '../style/building.js';
import {styleFunction as markerStyleFunction} from '../style/marker.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").RequiredOptions} RequiredOptions
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../conf.js").ErrorMessageState} ErrorMessageState
 * @typedef {import("../conf.js").PopupState} PopupState
 * @typedef {import("../conf.js").TooltipState} TooltipState
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("../feature/floor.js").Options} FloorOptions
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("ol/control/Control").default} ol.control.Control
 * @typedef {import("ol/layer/Tile").default} ol.layer.Tile
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("ol/style/Style").default} ol.style.Style
 * @typedef {import("ol/style/Style").StyleFunction} StyleFunction
 * @typedef {import("../view/info.js").BuildingTitleOptions} BuildingTitleOptions
 * @typedef {import("../utils/range.js").RangeInterface} RangeInterface
 * @typedef {import("../feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("../identify/identify.js").CallbackFunction} IdentifyCallbackFunction
 * @typedef {import("../conf.js").PopupContentOptions} PopupContentOptions
 */

/**
 * @typedef {Object<string, StyleFunction>} AllStyleFunctionsResult
 */

/**
 * @typedef {Object} InitExtentOptions
 * @property {ol.Extent|undefined} extent extent
 * @property {ol.Size} size size
 * @property {ol.Coordinate|undefined} center center
 * @property {number|undefined} zoom zoom
 * @property {number|undefined} resolution resolution
 */

/**
 * @param {State} state state
 * @return {boolean} whether is initialized
 */
export const isMapInitialized = (state) => state.mapInitialized;

/**
 * @param {State} state state
 * @return {RequiredOptions} opts
 */
export const getRequiredOpts = (state) => state.requiredOpts;

/**
 * @param {State} state state
 * @return {boolean} msg
 */
const getRequiredLoadingMessage = (state) => state.requiredOpts.loadingMessage;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getMarkersTimestamp = (state) => state.markersTimestamp;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getZoomToTimestamp = (state) => state.zoomToTimestamp;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getBuildingsTimestamp = (state) => state.buildingsTimestamp;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getFloorsTimestamp = (state) => state.floorsTimestamp;

/**
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getOptPoisTimestamp = (state) => state.optPoisTimestamp;

/**
 * @type {import("reselect").Selector<State, Array<string>>}
 * @param {State} state state
 * @return {Array<string>} required markers
 */
const getRequiredMarkerIds = (state) => state.requiredOpts.markerIds;

/**
 * @param {State} state state
 * @return {string|Array<string>} zoomTo
 */
const getRequiredZoomTo = (state) => state.requiredOpts.zoomTo;

/**
 * @param {State} state state
 * @return {string} basemap
 */
const getRequiredBaseMap = (state) => state.requiredOpts.baseMap;

/**
 * @param {State} state state
 * @return {boolean} basemap
 */
export const getRequiredLabels = (state) => state.requiredOpts.labels;

/**
 * @param {State} state state
 * @return {boolean} basemap
 */
export const getRequiredMapLinks = (state) => state.requiredOpts.mapLinks;

/**
 * @param {State} state state
 * @return {string} lang
 */
export const getLang = (state) => state.requiredOpts.lang;

/**
 * @param {State} state state
 * @return {string} target
 */
export const getTargetId = (state) => state.requiredOpts.targetId;

/**
 * @param {State} state state
 * @return {ol.Coordinate} center
 */
export const getCenter = (state) => state.center;

/**
 * @param {State} state state
 * @return {number} rotation
 */
export const getRotation = (state) => state.rotation;

/**
 * @param {State} state state
 * @return {ol.Size} map size
 */
export const getSize = (state) => state.mapSize;

/**
 * @param {State} state state
 * @return {ol.Coordinate} center
 */
const getRequiredCenter = (state) => state.requiredOpts.center;

/**
 * @param {State} state state
 * @return {number} center
 */
const getRequiredZoom = (state) => state.requiredOpts.zoom;

/**
 * @param {State} state state
 * @return {number} res
 */
export const getResolution = (state) => state.resolution;

/**
 * @param {State} state state
 * @return {string} selected floor
 */
export const getSelectedFeature = (state) => state.selectedFeature;

/**
 * @param {State} state state
 * @return {string} marker label function id
 */
const getRequiredMarkerLabelId = (state) => state.requiredOpts.markerLabelId;

/**
 * @param {State} state state
 * @return {boolean} whether to show only location codes
 */
const getRequiredLocationCodes = (state) => state.requiredOpts.locationCodes;

/**
 * @param {State} state state
 * @return {boolean} whether to cluster faculty abbreviations
 */
export const getRequiredClusterFacultyAbbr = (state) =>
  state.requiredOpts.clusterFacultyAbbr;

/**
 * @param {State} state state
 * @return {AnimationRequestState} animation request state
 */
export const getAnimationRequest = (state) => state.animationRequest;

/**
 * @param {State} state state
 * @return {boolean} whether to simple scroll
 */
export const getRequiredSimpleScroll = (state) =>
  state.requiredOpts.simpleScroll;

/**
 * @param {State} state state
 * @return {ErrorMessageState} error message state
 */
export const getErrorMessageState = (state) => state.errorMessage;

/**
 * @param {State} state state
 * @return {string} id
 */
export const getRequiredIdentifyCallbackId = (state) =>
  state.requiredOpts.identifyCallbackId;

/**
 * @param {State} state state
 * @return {string} uid
 */
export const getPopupFeatureUid = (state) => state.popup.uid;

/**
 * @param {State} state state
 * @return {number} timestamp
 */
export const getIdentifyTimestamp = (state) => state.identifyTimestamp;

// Create selector with memoize options.
const createSelector = (selectors, fn) => {
  const slctr = createReselectSelector(...selectors, fn, {
    memoizeOptions: {
      maxSize: 2,
    },
  });
  return slctr;
};

/**
 * createSelector return type Reselect.OutputSelector<S, T, (res: R1) => T>
 *    S: State (for Selector functions above)
 *    T: Returned type (must be same as returned type below)
 *    arg2: Function where arguments are returned types from Selector and
 *          return type is the same as T.
 * @type {import("reselect").OutputSelector<
 *    import("reselect").SelectorArray,
 *    Array<ol.Feature>,
 *    function(Array<string>, number, string): Array<ol.Feature>
 * >}
 */
export const getInitMarkers = createSelector(
  [getRequiredMarkerIds, getMarkersTimestamp, getTargetId],
  (requiredMarkerIds, markersTimestamp, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing init markers');
    }
    if (requiredMarkerIds.length === 0 || markersTimestamp <= 0) {
      return [];
    }

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
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    Array<ol.Feature>,
 *    function(Array<string>|string, number): Array<ol.Feature>
 * >}
 */
export const getInitZoomTo = createSelector(
  [getRequiredZoomTo, getZoomToTimestamp, getTargetId],
  (initZoomTo, zoomToTimestamp, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing init zoomTo');
    }
    if (initZoomTo.length === 0 || zoomToTimestamp <= 0) {
      return [];
    } else if (munimap_utils.isString(initZoomTo)) {
      initZoomTo = [/**@type {string}*/ (initZoomTo)];
    }
    const buildingType = getBuildingType();
    const buildings = getBuildingStore(targetId).getFeatures();
    const roomType = getRoomType();
    const rooms = getRoomStore(targetId).getFeatures();
    const doorType = getDoorType();
    const doors = getDoorStore(targetId).getFeatures();
    return /**@type {Array<string>}*/ (initZoomTo).map((initZoomTo) => {
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
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    string,
 *    function(ol.Coordinate, number, string): string
 * >}
 */
export const getBasemapLayerId = createSelector(
  [getCenter, getResolution, getRequiredBaseMap],
  (center, resolution, requiredBasemap) => {
    if (!center) {
      return requiredBasemap;
    }

    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing baseMapLayerId');
    }
    const isSafeLatLon = munimap_utils.inRange(
      center[1],
      -8399737.89, //60° N
      8399737.89 //60° S
    );
    const isSafeResolution = munimap_utils.inRange(
      resolution,
      38.21851414258813,
      Infinity
    );
    const basemapLayerId =
      !isSafeLatLon && !isSafeResolution && isArcGISBasemap(requiredBasemap)
        ? getPairedBasemap(requiredBasemap)
        : requiredBasemap;
    return basemapLayerId;
  }
);

/**
 * Get basemap layer. There must be target param, otherwise
 * multiple maps would share a single tile layer.
 *
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.layer.Tile,
 *    function(string, string, string): ol.layer.Tile
 * >}
 */
export const getBasemapLayer = createSelector(
  [getBasemapLayerId, getLang, getTargetId],
  (basemapLayerId, lang, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing baseMapLayer');
    }
    // targetId is important for multiple maps on screen
    if (!targetId) {
      return null;
    }
    return createBasemapLayer(basemapLayerId, lang);
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    Array<string>,
 *    function(Array<string>, Array<ol.Feature>): Array<string>
 * >}
 */
export const getInvalidCodes = createSelector(
  [getRequiredMarkerIds, getInitMarkers],
  (requiredMarkerIds, initMarkers) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing invalid codes');
    }
    if (requiredMarkerIds.length === 0) {
      return [];
    }

    let type;
    const initMarkersCodes = [];
    initMarkers.forEach((marker) => {
      if (!isCustomMarker(marker)) {
        if (isRoom(marker)) {
          type = getRoomType();
        } else if (isDoor(marker)) {
          type = getDoorType();
        } else {
          type = getBuildingType();
        }
        initMarkersCodes.push(marker.get(type.primaryKey));
      }
    });

    const difference = /**@type {Array}*/ (requiredMarkerIds).filter(
      (markerString) => {
        if (isOptPoiCtgUid(markerString)) {
          return !Object.values(OptPoiIds).includes(markerString.split(':')[1]);
        }

        return munimap_utils.isString(markerString) &&
          !REQUIRED_CUSTOM_MARKERS[markerString]
          ? !initMarkersCodes.includes(markerString)
          : false;
      }
    );
    return difference;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>, number?): boolean
 * >}
 */
export const loadMarkers = createSelector(
  [getRequiredMarkerIds, getMarkersTimestamp],
  (requiredMarkerIds, markersTimestamp) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether load markers');
    }
    return requiredMarkerIds.length > 0 && markersTimestamp === null;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>|string, number?): boolean
 * >}
 */
export const loadZoomTo = createSelector(
  [getRequiredZoomTo, getZoomToTimestamp],
  (requiredZoomTo, zoomToTimestamp) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether load zoomto');
    }
    return requiredZoomTo.length > 0 && zoomToTimestamp === null;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>, number?): boolean
 * >}
 */
export const areMarkersLoaded = createSelector(
  [getRequiredMarkerIds, getMarkersTimestamp],
  (requiredMarkerIds, markersTimestamp) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing if markers are loaded');
    }
    return (
      (requiredMarkerIds.length > 0 && markersTimestamp > 0) ||
      requiredMarkerIds.length === 0
    );
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>|string, number?): boolean
 * >}
 */
export const areZoomToLoaded = createSelector(
  [getRequiredZoomTo, getZoomToTimestamp],
  (requiredZoomTo, zoomToTimestamp) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing if zoomto are loaded');
    }
    return (
      (requiredZoomTo.length > 0 && zoomToTimestamp > 0) ||
      requiredZoomTo.length === 0
    );
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>, number?): boolean
 * >}
 */
export const areOptPoiLoaded = createSelector(
  [getRequiredMarkerIds, getOptPoisTimestamp],
  (requiredMarkerIds, optPoisTimestamp) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing if opt pois are loaded');
    }
    return (
      (requiredMarkerIds.some((el) => isOptPoiCtgUid(el)) &&
        optPoisTimestamp > 0) ||
      !requiredMarkerIds.some((el) => isOptPoiCtgUid(el))
    );
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean?,
 *    function(boolean?, boolean, boolean): boolean
 * >}
 */
export const toggleLoadingMessage = createSelector(
  [getRequiredLoadingMessage, areMarkersLoaded, areZoomToLoaded],
  (requireLoadingMessage, markersLoaded, zoomToLoaded) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing loading message');
    }
    if (!requireLoadingMessage) {
      return null;
    } else {
      if (markersLoaded && zoomToLoaded) {
        return false;
      } else {
        return true;
      }
    }
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.AttributionLike,
 *    function(string): ol.AttributionLike
 * >}
 */
export const getMuAttrs = createSelector([getLang], (lang) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing MU attrs');
  }
  const munimapAttr = munimap_lang.getMsg(
    munimap_lang.Translations.MUNIMAP_ATTRIBUTION_HTML,
    lang
  );
  const muAttr = munimap_lang.getMsg(
    munimap_lang.Translations.MU_ATTRIBUTION_HTML,
    lang
  );
  return [munimapAttr, muAttr];
});

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    View,
 *    function(string, ol.Coordinate, number, Array<ol.Feature>, Array<ol.Feature>): View
 * >}
 */
export const calculateView = createSelector(
  [
    getTargetId,
    getRequiredCenter,
    getRequiredZoom,
    getInitMarkers,
    getInitZoomTo,
  ],
  (targetId, requiredCenter, requiredZoom, markers, zoomTo) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing view');
    }
    const target = TARGET_ELEMENTS_STORE[targetId];
    const center = ol_proj.transform(
      requiredCenter || [16.605390495656977, 49.1986567194723],
      ol_proj.get('EPSG:4326'),
      ol_proj.get('EPSG:3857')
    );
    const zoom = requiredZoom === null ? 13 : requiredZoom;
    const view = new View({
      center: center,
      maxZoom: 23,
      minZoom: 0,
      zoom: zoom,
      constrainResolution: true,
    });
    const initExtentOpts = /**@type {InitExtentOptions}*/ ({});
    if (zoomTo || markers) {
      zoomTo = zoomTo.length ? zoomTo : markers;
      if (zoomTo.length) {
        let res;
        const extent = extentOfFeatures(zoomTo, targetId);
        if (requiredZoom === null && requiredCenter === null) {
          if (target.offsetWidth === 0 || target.offsetHeight === 0) {
            view.fit(extent);
          } else {
            view.fit(extent, {
              size: [target.offsetWidth, target.offsetHeight],
            });
            res = view.getResolution();
            munimap_assert.assert(res);
            ol_extent.buffer(extent, res * 30, extent);
            view.fit(extent, {
              size: [target.offsetWidth, target.offsetHeight],
            });
            initExtentOpts.extent = extent;
            initExtentOpts.size = [target.offsetWidth, target.offsetHeight];
          }
          /** constrainResolution not exists in OL6, */
          /** use view.getConstrainedResolution(resolution), */
          /** https://github.com/openlayers/openlayers/pull/9137 */
          // if (munimap.marker.custom.isCustom(zoomTo[0])) {
          //   if (view.getResolution() < munimap.floor.RESOLUTION.max) {
          //     res = view.constrainResolution(
          //       munimap.floor.RESOLUTION.max,
          //       undefined,
          //       1
          //     );
          //     initExtentOpts.resolution = res;
          //     view.setResolution(res);
          //   }
          // }
        } else if (requiredCenter === null) {
          initExtentOpts.center = ol_extent.getCenter(extent);
          view.setCenter(ol_extent.getCenter(extent));
        }
      } else {
        initExtentOpts.center = center;
        initExtentOpts.zoom = zoom;
      }
    }
    view.set('initExtentOpts', initExtentOpts, true);
    return view;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    import("ol/Collection").default<ol.control.Control>,
 *    function(string): import("ol/Collection").default<ol.control.Control>
 * >}
 */
export const getDefaultControls = createSelector(
  [getLang, getTargetId],
  (lang, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing default controls');
    }

    //targetId is important for multiple maps
    //each of them must have their own controls
    if (!targetId) {
      return null;
    }
    return control_defaults({
      attributionOptions: {
        tipLabel: munimap_lang.getMsg(
          munimap_lang.Translations.ATTRIBUTIONS,
          lang
        ),
      },
      rotate: false,
      zoomOptions: {
        zoomInTipLabel: munimap_lang.getMsg(
          munimap_lang.Translations.ZOOM_IN,
          lang
        ),
        zoomOutTipLabel: munimap_lang.getMsg(
          munimap_lang.Translations.ZOOM_OUT,
          lang
        ),
      },
    });
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    number,
 *    function(number): number
 * >}
 */
export const getLoadedBuildingsCount = createSelector(
  [getBuildingsTimestamp, getTargetId],
  (buildingsTimestamp, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('calculate buildings count');
    }

    if (buildingsTimestamp === null) {
      return 0;
    }
    return getBuildingStore(targetId).getFeatures().length;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    string,
 *    function(string): string
 * >}
 */
export const getSelectedFloorCode = createSelector(
  [getSelectedFeature],
  (selectedFeature) => {
    if (!selectedFeature) {
      return null;
    } else {
      return munimap_floor.isCode(selectedFeature) ? selectedFeature : null;
    }
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    Array<string>,
 *    function(string, number): Array<string>
 * >}
 */
export const getActiveFloorCodes = createSelector(
  [getSelectedFeature, getFloorsTimestamp, getTargetId],
  (selectedFeature, floorsTimestamp, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing active floors');
    }
    if (
      !selectedFeature ||
      isBuildingCode(selectedFeature) ||
      floorsTimestamp === null
    ) {
      return [];
    }

    const floors = getFloorStore(targetId).getFeatures();
    const activeFloorLayerId = munimap_floor.getFloorLayerIdByCode(
      targetId,
      selectedFeature
    );
    const active = floors.filter(
      (floor) => floor.get('vrstvaId') === activeFloorLayerId
    );
    const codes = active.map((floor) => {
      return /**@type {string}*/ (floor.get('polohKod'));
    });
    return codes;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(number): boolean
 * >}
 */
const isInFloorResolutionRange = createSelector(
  [getResolution],
  (resolution) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether is resolution in floor resolution. range');
    }
    return (
      munimap_utils.isDef(resolution) &&
      munimap_range.contains(munimap_floor.RESOLUTION, resolution)
    );
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(boolean, string): StyleFunction
 * >}
 */
export const getStyleForBuildingLayer = createSelector(
  [isInFloorResolutionRange, getSelectedFloorCode, getTargetId],
  (inFloorResolutionRange, selectedFloorCode, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for building');
    }

    const selectedFloor = inFloorResolutionRange ? selectedFloorCode : null;
    const styleFce = (feature, res) => {
      const showSelected =
        inFloorResolutionRange && isSelected(feature, selectedFloor);
      const style = styleFunction(feature, res, targetId, showSelected);
      return style;
    };

    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Extent,
 *    function(number, ol.Coordinate, number, ol.Size): ol.Extent
 * >}
 */
export const getExtent = createSelector(
  [getResolution, getCenter, getRotation, getSize],
  (resolution, center, rotation, size) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing extent');
    }

    if (!size) {
      return;
    }
    return ol_extent.getForViewAndSize(center, resolution, rotation, size);
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(ol.Extent, string, boolean): StyleFunction
 * >}
 */
export const getBuildingLabelFunction = createSelector(
  [getExtent, getLang, getRequiredLabels, getTargetId],
  (extent, lang, requiredLabels, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing building label function');
    }
    return munimap_utils.partial(labelFunction, {
      lang,
      requiredLabels,
      extent,
      targetId,
    });
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(boolean, string, StyleFunction): StyleFunction
 * >}
 */
export const getStyleForBuildingLabelLayer = createSelector(
  [isInFloorResolutionRange, getSelectedFloorCode, getBuildingLabelFunction],
  (inFloorResolutionRange, selectedFloorCode, buildingLabelFunction) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for building label');
    }
    const selectedFloor = inFloorResolutionRange ? selectedFloorCode : null;
    const styleFce = (feature, res) => {
      const showSelected =
        inFloorResolutionRange && isSelected(feature, selectedFloor);
      if (showSelected) {
        return null;
      } else {
        const style = buildingLabelFunction(feature, res);
        return style;
      }
    };

    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(string): StyleFunction
 * >}
 */
export const getStyleForComplexLayer = createSelector(
  [getLang, getTargetId],
  (lang, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for complexes');
    }

    //asi nemusi byt selector, protoze se bere z funkce
    const markers = getMarkerStore(targetId).getFeatures();
    const styleFce = (feature, res) => {
      const style = complexStyleFunction(feature, res, markers, lang);
      return style;
    };

    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Extent,
 *    function(ol.Extent): ol.Extent
 * >}
 */
export const getReferenceExtent = createSelector([getExtent], (extent) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing reference extent');
  }
  return ol_extent.buffer(extent, getBufferValue(extent));
});

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(ol.Extent, string): boolean
 * >}
 */
export const isSelectedInExtent = createSelector(
  [getReferenceExtent, getSelectedFeature, getTargetId],
  (refExtent, selectedBuilding, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether is selected building in extent');
    }
    if (munimap_utils.isDefAndNotNull(selectedBuilding)) {
      munimap_assert.assertString(selectedBuilding);
      const building = getBuildingByCode(
        targetId,
        /**@type {string}*/ (/**@type {unknown}*/ (selectedBuilding))
      );
      const geom = building.getGeometry();
      return geom.intersectsExtent(refExtent);
    }
    return false;
  }
);

/**
 * Returns feature from which the selected feature will be computed to state.
 *
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Feature,
 *    function(ol.Extent, number, number): ol.Feature
 * >}
 */
const getFeatureForComputingSelected = createSelector(
  [getReferenceExtent, getBuildingsTimestamp, getMarkersTimestamp, getTargetId],
  (refExt, buildingsTimestamp, markersTimestamp, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing feature for creating selected');
    }
    let marker = null; //munimap.getProps(map).selectedMarker;
    if (!marker) {
      const markers = getMarkerStore(targetId).getFeatures();
      marker = markers.find((f) =>
        f.getGeometry() ? f.getGeometry().intersectsExtent(refExt) : null
      );
    }
    if (marker) {
      return marker;
    } else {
      let selectFeature;
      let maxArea;
      const format = new GeoJSON();
      const buildingStore = getBuildingStore(targetId);
      buildingStore.forEachFeatureIntersectingExtent(refExt, (building) => {
        if (hasInnerGeometry(building)) {
          const intersect = featureExtentIntersect(building, refExt, format);
          const geom = intersect.getGeometry();
          if (geom instanceof Polygon || geom instanceof MultiPolygon) {
            const area = geom.getArea();
            if (!munimap_utils.isDef(maxArea) || area > maxArea) {
              maxArea = area;
              selectFeature = building;
            }
          }
        }
      });
      return selectFeature || null;
    }
  }
);

/**
 * Get selected location code. Returns location code if some should be selected,
 * null if no one shloud be selected (deselect), undefined if nothing to change.
 *
 * @type {import("reselect").OutputSelector<
 *    State,
 *    (string|undefined),
 *    function(ol.Size, string, ol.Feature, boolean, boolean, Array<string>):
 *      (string|undefined)
 * >}
 */
export const getSelectedLocationCode = createSelector(
  [
    getSize,
    getSelectedFeature,
    getFeatureForComputingSelected,
    isInFloorResolutionRange,
    isSelectedInExtent,
    getActiveFloorCodes,
  ],
  (
    size,
    selectedFeature,
    featureForComputingSelected,
    inFloorResolutionRange,
    selectedInExtent,
    activeFloorCodes
  ) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing selected location code');
    }
    if (!size) {
      return;
    }

    if (!selectedFeature || !selectedInExtent) {
      if (inFloorResolutionRange) {
        let lc;
        if (featureForComputingSelected) {
          if (isBuilding(featureForComputingSelected)) {
            lc = featureForComputingSelected.get('polohKod') || null;
          } else if (
            isRoom(featureForComputingSelected) ||
            isDoor(featureForComputingSelected)
          ) {
            const locCode = /**@type {string}*/ (
              featureForComputingSelected.get('polohKod')
            );
            lc = locCode.substring(0, 5);
          } else {
            lc = featureForComputingSelected.get('polohKodPodlazi') || null;
          }
        }

        if (activeFloorCodes.length > 0 && lc) {
          const afc = activeFloorCodes.find((activeFloorCode) =>
            activeFloorCode.startsWith(lc)
          );
          //returns floor code or building location code
          return afc || lc;
        } else {
          return lc || null;
        }
      } else {
        return null;
      }
    } else {
      // munimap.info.refreshElementPosition(map);
      return;
    }
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    MarkerLabelFunction,
 *    function(string, Array<string>, string, boolean): MarkerLabelFunction
 * >}
 */
export const getMarkerLabel = createSelector(
  [
    getTargetId,
    getRequiredMarkerIds,
    getRequiredMarkerLabelId,
    areOptPoiLoaded,
  ],
  (targetId, requiredMarkerIds, requiredMarkerLabelId, optPoiLoaded) => {
    const optPoiFnId = `OPT_POI_MARKER_LABEL_${targetId}`;
    if (requiredMarkerIds) {
      if (requiredMarkerIds.some((el) => isOptPoiCtgUid(el)) && optPoiLoaded) {
        return MARKER_LABEL_STORE[optPoiFnId];
      } else {
        return MARKER_LABEL_STORE[requiredMarkerLabelId];
      }
    }
    return;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(string, Array<ol.Feature>, MarkerLabelFunction, ol.Extent,
 *      boolean, boolean, string, Array<string>): StyleFunction
 * >}
 */
export const getStyleForMarkerLayer = createSelector(
  [
    getLang,
    getInitMarkers,
    getMarkerLabel,
    getExtent,
    getRequiredLocationCodes,
    isInFloorResolutionRange,
    getSelectedFeature,
    getActiveFloorCodes,
    getTargetId,
  ],
  (
    lang,
    initMarkers,
    markerLabel,
    extent,
    locationCodes,
    inFloorResolutionRange,
    selectedFeature, //redrawOnFloorChange
    activeFloorCodes,
    targetId
  ) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for markers');
    }

    const options = {
      markers: initMarkers,
      markerLabel,
      lang,
      extent,
      locationCodes,
      activeFloorCodes,
      targetId,
    };
    const styleFce = (feature, res) => {
      if (
        inFloorResolutionRange &&
        isBuilding(feature) &&
        isSelected(feature, selectedFeature)
      ) {
        return null;
      }
      const style = markerStyleFunction(feature, res, options);
      return style;
    };

    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(string, boolean, MarkerLabelFunction, boolean):
 *      StyleFunction
 * >}
 */
export const getStyleForClusterLayer = createSelector(
  [
    getLang,
    getRequiredLocationCodes,
    getMarkerLabel,
    getRequiredClusterFacultyAbbr,
    getTargetId,
  ],
  (lang, locationCodes, markerLabel, clusterFacultyAbbr, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for clusters');
    }

    const options = {
      lang,
      locationCodes,
      markerLabel,
      clusterFacultyAbbr,
      targetId,
    };
    const styleFce = (feature, res) => {
      const style = clusterStyleFunction(feature, res, options);
      return style;
    };

    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    string,
 *    function(string, Array<string>): string
 * >}
 */
export const calculateSelectedFloor = createSelector(
  [getSelectedFeature, getActiveFloorCodes, getTargetId],
  (selectedFeature, activeFloorCodes, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing selected floor');
    }

    if (!selectedFeature) {
      return;
    } else if (munimap_floor.isCode(selectedFeature)) {
      return selectedFeature;
    }

    let floorCode;
    if (isBuildingCode(selectedFeature)) {
      const building = getBuildingByCode(targetId, selectedFeature);
      if (hasInnerGeometry(building)) {
        floorCode = activeFloorCodes.find(
          (code) => code.substring(0, 5) === selectedFeature
        );

        if (floorCode) {
          return floorCode;
        } else {
          return getSelectedFloorCodeForBuilding(targetId, building);
        }
      }
    }
    return;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(string, boolean, string):
 *      StyleFunction
 * >}
 */
export const getStyleForRoomLabelLayer = createSelector(
  [getLang, getRequiredLocationCodes, getSelectedFloorCode, getTargetId],
  (lang, requiredLocationCodes, selectedFloorCode, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for room labels');
    }

    const styleFce = (feature, res) => {
      const locCode = feature.get('polohKod');
      const isSelected =
        selectedFloorCode && locCode.startsWith(selectedFloorCode);
      if (isSelected) {
        return roomLabelStyleFunction(
          feature,
          res,
          targetId,
          lang,
          requiredLocationCodes
        );
      }
      return null;
    };
    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(Array<string>): StyleFunction
 * >}
 */
export const getStyleForRoomLayer = createSelector(
  [getActiveFloorCodes, getTargetId],
  (activeFloorCodes, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for rooms');
    }

    const styleFce = (feature, res) => {
      const locCode = feature.get('polohKod');
      const isDefault = !activeFloorCodes.some((code) =>
        locCode.startsWith(code.substring(0, 5))
      );
      if (isDefault) {
        return defaultRoomStyleFunction(feature, res, targetId);
      }
      return null;
    };
    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(Array<string>): StyleFunction
 * >}
 */
export const getStyleForActiveRoomLayer = createSelector(
  [getActiveFloorCodes, getTargetId],
  (activeFloorCodes, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for active rooms');
    }

    const styleFce = (feature, res) => {
      let result = defaultRoomStyleFunction(feature, res, targetId);
      if (
        munimap_range.contains(PoiResolutions.STAIRS, res) &&
        result === getStaircase()
      ) {
        result = [...result, ...STAIRCASE_ICON];
      }
      return result;
    };
    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    BuildingTitleOptions,
 *    function(string, string): BuildingTitleOptions
 * >}
 */
export const getBuildingTitle = createSelector(
  [getSelectedFeature, getLang, getTargetId],
  (selectedFeature, lang, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing building title to info element');
    }
    if (!selectedFeature) {
      return {bldgTitle: '', complexTitle: ''};
    }

    let bldgTitle = '';
    let complexTitle = '';
    const building = getBuildingByCode(targetId, selectedFeature);
    if (building) {
      bldgTitle = /**@type {string}*/ (
        building.get(
          munimap_lang.getMsg(
            munimap_lang.Translations.BUILDING_TITLE_FIELD_NAME,
            lang
          )
        )
      );
      const complex = getComplex(building);
      if (munimap_utils.isDefAndNotNull(complex)) {
        complexTitle = /**@type {string}*/ (
          complex.get(
            munimap_lang.getMsg(
              munimap_lang.Translations.COMPLEX_TITLE_FIELD_NAME,
              lang
            )
          )
        );
        const buildingType = /**@type {string}*/ (
          building.get(
            munimap_lang.getMsg(
              munimap_lang.Translations.BUILDING_TYPE_FIELD_NAME,
              lang
            )
          )
        );
        const buildingTitle = /**@type {string}*/ (
          building.get(
            munimap_lang.getMsg(
              munimap_lang.Translations.BUILDING_ABBR_FIELD_NAME,
              lang
            )
          )
        );
        if (
          munimap_utils.isDefAndNotNull(buildingType) &&
          munimap_utils.isDefAndNotNull(buildingTitle)
        ) {
          bldgTitle = buildingType + ' ' + buildingTitle;
        } else {
          if (getBuildingCount(complex) === 1) {
            bldgTitle = getBuildingNamePart(building, lang);
          } else {
            bldgTitle = getBuildingTitleWithoutOrgUnit(building, lang);
          }
        }
      } else {
        bldgTitle = getBuildingTitleWithoutOrgUnit(building, lang);
      }
    }
    return {bldgTitle, complexTitle};
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(string, boolean): boolean
 * >}
 */
export const showInfoEl = createSelector(
  [getSelectedFeature, isInFloorResolutionRange],
  (selectedFeature, inFloorResolutionRange) => {
    return !!selectedFeature && inFloorResolutionRange;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    RangeInterface,
 *    function(number, Array<ol.Feature>): RangeInterface
 * >}
 */
export const getClusterResolution = createSelector(
  [getMarkersTimestamp, getInitMarkers],
  (markersTimestamp, markers) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing cluster resolution');
    }
    if (!markersTimestamp || markersTimestamp === 0) {
      return BUILDING_RESOLUTION;
    }
    let clusterResolution = BUILDING_RESOLUTION;
    if (
      markers.length &&
      (markers.some((el) => isRoom(el)) || markers.some((el) => isDoor(el)))
    ) {
      clusterResolution = ROOM_RESOLUTION;
    }
    return clusterResolution;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(Array<string>, string): StyleFunction
 * >}
 */
export const getStyleForActivePoiLayer = createSelector(
  [getActiveFloorCodes, getSelectedFeature, getTargetId],
  (activeFloorCodes, selectedFeature, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for pois');
    }

    const styleFce = (feature, res) => {
      const locCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
      if (locCode && activeFloorCodes.includes(locCode)) {
        return activePoiStyleFunction(feature, res);
      }

      const poiType = feature.get('typ');
      const entranceTypes = [
        POI_PURPOSE.BUILDING_ENTRANCE,
        POI_PURPOSE.BUILDING_COMPLEX_ENTRANCE,
      ];
      if (entranceTypes.includes(poiType)) {
        const defaultFloor = feature.get('vychoziPodlazi');
        munimap_assert.assertNumber(defaultFloor);
        const locCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
        if (
          defaultFloor === 1 &&
          activeFloorCodes.every(
            (floor) => !locCode.startsWith(floor.substring(0, 5))
          )
        ) {
          return defaultPoiStyleFunction(feature, res);
        }
      }

      entranceTypes.push(POI_PURPOSE.COMPLEX_ENTRANCE);
      if (entranceTypes.includes(poiType)) {
        return outdoorPoiStyleFunction(feature, res, selectedFeature, targetId);
      }
      return null;
    };
    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    Array<ol.Feature>,
 *    function(number, string): Array<ol.Feature>
 * >}
 */
export const getFloorsByBuildingCode = createSelector(
  [getFloorsTimestamp, getSelectedFeature, getTargetId],
  (floorsTimestamp, selectedFeature, targetId) => {
    if (!floorsTimestamp || !selectedFeature) {
      return [];
    }
    const store = getFloorStore(targetId);
    if (store) {
      const features = store.getFeatures();
      const floors = features.filter((floor) => {
        const locationCode = floor.get('polohKod');
        return locationCode.startsWith(selectedFeature.substring(0, 5));
      });
      return floors || [];
    }
    return [];
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(string, MarkerLabelFunction, boolean, ol.Extent): StyleFunction
 * >}
 */
export const getStyleForIdentifyLayer = createSelector(
  [getLang, getMarkerLabel, getRequiredLocationCodes, getExtent, getTargetId],
  (lang, markerLabel, locationCodes, extent, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for identify');
    }

    const styleFce = (feature, res) => {
      const opts = {
        lang,
        markerLabel,
        locationCodes,
        extent,
        targetId,
      };
      const style = identifyStyleFunction(feature, res, opts);
      return style;
    };

    return styleFce;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    AllStyleFunctionsResult,
 *    function(
 *      StyleFunction,
 *      StyleFunction,
 *      StyleFunction,
 *      StyleFunction,
 *      StyleFunction,
 *      StyleFunction,
 *      StyleFunction,
 *      StyleFunction,
 *      StyleFunction,
 *      StyleFunction): AllStyleFunctionsResult
 * >}
 */
export const getAllStyleFunctions = createSelector(
  [
    getStyleForBuildingLayer,
    getStyleForBuildingLabelLayer,
    getStyleForComplexLayer,
    getStyleForMarkerLayer,
    getStyleForClusterLayer,
    getStyleForRoomLayer,
    getStyleForRoomLabelLayer,
    getStyleForActiveRoomLayer,
    getStyleForActivePoiLayer,
    getStyleForIdentifyLayer,
  ],
  (
    styleForBuildingLayer,
    styleForBuildingLabelLayer,
    styleForComplexLayer,
    styleForMarkerLayer,
    styleForClusterLayer,
    styleForRoomLayer,
    styleForRoomLabelLayer,
    styleForRoomActiveLayer,
    styleForPoiActiveLayer,
    styleForIdentifyLayer
  ) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - get all style functions');
    }
    return {
      [BUILDING_LAYER_ID]: styleForBuildingLayer,
      [BUILDING_LABEL_LAYER_ID]: styleForBuildingLabelLayer,
      [COMPLEX_LAYER_ID]: styleForComplexLayer,
      [MARKER_LAYER_ID]: styleForMarkerLayer,
      [CLUSTER_LAYER_ID]: styleForClusterLayer,
      [ROOM_LAYER_ID]: styleForRoomLayer,
      [ROOM_LABEL_LAYER_ID]: styleForRoomLabelLayer,
      [ROOM_ACTIVE_LAYER_ID]: styleForRoomActiveLayer,
      [POI_ACTIVE_LAYER_ID]: styleForPoiActiveLayer,
      [IDENTIFY_LAYER_ID]: styleForIdentifyLayer,
    };
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    Array<string>,
 *    function(Array<ol.Feature>, string): Array<string>
 * >}
 */
export const getFloorCodesWithMarkers = createSelector(
  [getInitMarkers, getSelectedFeature],
  (initMarkers, selectedFeature) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing floor codes with markers');
    }
    if (!initMarkers || !selectedFeature) {
      return [];
    }
    const result = initMarkers.map((marker) => {
      const pk = /** @type {string}*/ (marker.get('polohKod'));
      const inSelectedBuilding =
        pk && pk.startsWith(selectedFeature.slice(0, 5));
      return pk && inSelectedBuilding && pk.length >= 8 && pk.slice(0, 8);
    });
    return result.filter((item) => item);
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(string): boolean
 * >}
 */
export const isIdentifyEnabled = createSelector(
  [getRequiredIdentifyCallbackId],
  (identifyCallbackId) => {
    return !!identifyCallbackId;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(number): boolean
 * >}
 */
export const isIdentifyControlEnabled = createSelector(
  [getIdentifyTimestamp, getTargetId],
  (identifyTimestamp, targetId) => {
    if (!munimap_utils.isDefAndNotNull(identifyTimestamp)) {
      return false;
    }
    const features = getIdentifyStore(targetId).getFeatures();
    return Array.isArray(features) ? features.length > 0 : !!features;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(boolean, number, string): boolean
 * >}
 */
export const isIdentifyLayerVisible = createSelector(
  [isIdentifyEnabled, getIdentifyTimestamp, getSelectedFeature, getTargetId],
  (identifyEnabled, identifyTimestamp, selectedFeature, targetId) => {
    if (!munimap_utils.isDefAndNotNull(identifyTimestamp) || !identifyEnabled) {
      return false;
    }

    const features = getIdentifyStore(targetId).getFeatures();
    if (features && features.length > 0) {
      const pointFeature = features[0];
      const code = munimap_identify.getLocationCode(pointFeature);
      if (code && code.length > 5) {
        return code.substring(5, 8) === selectedFeature.substring(5, 8);
      }
    }
    return true;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    IdentifyCallbackFunction,
 *    function(string): IdentifyCallbackFunction
 * >}
 */
export const getIdentifyCallback = createSelector(
  [getRequiredIdentifyCallbackId],
  (identifyCallbackId) => {
    if (!identifyCallbackId) {
      return null;
    }
    return IDENTIFY_CALLBACK_STORE[identifyCallbackId];
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Feature,
 *    function(string, string): ol.Feature
 * >}
 */
export const getFeatureForPopup = createSelector(
  [getPopupFeatureUid, getTargetId],
  (uid, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('get feature for popup');
    }

    if (!munimap_utils.isDefAndNotNull(uid)) {
      return null;
    }

    const suitableStores = [
      getBuildingStore(targetId),
      getRoomStore(targetId),
      getDoorStore(targetId),
      getPubtranStore(targetId),
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
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    RangeInterface,
 *    function(ol.Feature): RangeInterface
 * >}
 */
export const getHideResolutionForPopup = createSelector(
  [getFeatureForPopup],
  (feature) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('get hide resolution fo popup');
    }

    if (!feature) {
      return MARKER_RESOLUTION;
    }

    const ft = feature.get(FEATURE_TYPE_PROPERTY_NAME);
    return ft && ft.layerId === getPubtranType().layerId
      ? PUBTRAN_RESOLUTION
      : MARKER_RESOLUTION;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(string): boolean
 * >}
 */
export const isPopupVisible = createSelector([getPopupFeatureUid], (uid) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing whether popup is visible');
  }

  return munimap_utils.isDefAndNotNull(uid);
});

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    string,
 *    function(ol.Feature, string): string
 * >}
 */
export const getPopupContent = createSelector(
  [getFeatureForPopup, getLang],
  (feature, lang) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('get popup content');
    }

    if (!feature) {
      return null;
    }
    const ft = feature.get(FEATURE_TYPE_PROPERTY_NAME);
    return ft && ft.layerId === getPubtranType().layerId
      ? getDetailHtml(feature.get('nazev'), lang)
      : feature.get('detail');
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Coordinate,
 *    function(ol.Feature): ol.Coordinate
 * >}
 */
export const getPopupPositionInCoords = createSelector(
  [getFeatureForPopup],
  (feature) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing popup position');
    }

    if (!feature) {
      return null;
    }

    const geometry = feature.getGeometry();
    let centroid = ol_extent.getCenter(geometry.getExtent());
    if (
      !geometry.intersectsCoordinate(centroid) &&
      (geometry instanceof MultiPolygon || geometry instanceof Polygon)
    ) {
      centroid = getBetterInteriorPoint(geometry).getCoordinates();
    }

    return centroid;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    Array<number>,
 *    function(ol.Feature): Array<number>
 * >}
 */
export const getOffsetForPopup = createSelector(
  [getFeatureForPopup],
  (feature) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('get popup offset');
    }
    const defaultOffset = [0, 20];

    if (!feature) {
      return defaultOffset;
    }

    const ft = feature.get(FEATURE_TYPE_PROPERTY_NAME);
    return ft && ft.layerId === getPubtranType().layerId
      ? [0, 0]
      : defaultOffset;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    AnimationRequestState,
 *    function(ol.Size, ol.Extent, View): AnimationRequestState
 * >}
 */
export const calculateAnimationRequest = createSelector(
  [getSize, getExtent, calculateView],
  (size, extent, view) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('calculate animation request');
    }
    const newExt = view.calculateExtent(size);
    let duration = 0;

    if (extent && newExt) {
      if (ol_extent.intersects(extent, newExt)) {
        duration = getAnimationDuration(extent, newExt);
      }

      const animationRequest = {
        extent: newExt,
        duration,
      };
      return [
        {
          ...INITIAL_STATE.animationRequest[0],
          ...animationRequest,
        },
      ];
    } else {
      return null;
    }
  }
);
