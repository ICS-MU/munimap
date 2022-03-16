/* eslint-disable no-console */
/**
 * @module redux/selector
 */
import * as mm_floor from '../feature/floor.js';
import * as mm_identify from '../identify/identify.js';
import * as mm_lang from '../lang/lang.js';
import * as mm_lyr from '../layer/_constants.js';
import * as mm_range from '../utils/range.js';
import * as mm_srcs from '../source/_constants.js';
import * as mm_utils from '../utils/utils.js';
import * as ol_extent from 'ol/extent';
import {BUILDING_RESOLUTION, ROOM_RESOLUTION} from '../cluster/cluster.js';
import {ENABLE_SELECTOR_LOGS, INITIAL_STATE} from '../conf.js';
import {
  FEATURE_TYPE_PROPERTY_NAME,
  FLOOR_RESOLUTION,
  MARKER_RESOLUTION,
  PUBTRAN_RESOLUTION,
  PUBTRAN_TYPE,
} from '../feature/_constants.js';
import {IDENTIFY_CALLBACK_STORE, MARKER_LABEL_STORE} from '../constants.js';
import {MultiPolygon, Polygon} from 'ol/geom';
import {calculateBubbleOffsets} from '../style/icon.js';
import {defaults as control_defaults} from 'ol/control';
import {createLayer as createBasemapLayer, getId} from '../layer/basemap.js';
import {create as createMapView} from '../view/mapview.js';
import {createSelector as createReselectSelector} from 'reselect';
import {
  filterInvalidCodes,
  getLocationCodeFromFeature,
  getSelectedFloorCode as getSelectedFloorCodeBySelectedFeature,
} from '../feature/feature.js';
import {getActiveStyleFunction as getActivePoiStyleFunction} from '../style/poi.js';
import {
  getActiveStyleFunction as getActiveRoomStyleFunction,
  getDefaultStyleFunction as getDefaultRoomStyleFunction,
  getLabelFunction as getRoomLabelFunction,
} from '../style/room.js';
import {getAnimationDuration} from '../utils/animation.js';
import {getBetterInteriorPoint} from '../utils/geom.js';
import {
  getLabelStyleFunction as getBldgLabelStyleFunction,
  getPartialLabelFunction as getBldgPartialLabelFunction,
  getStyleFunction as getBldgStyleFunction,
} from '../style/building.js';
import {getTitle as getBldgTitle, isInExtent} from '../feature/building.js';
import {getBufferValue} from '../utils/extent.js';
import {getStyleFunction as getClusterStyleFunction} from '../style/cluster.js';
import {getStyleFunction as getCmplxStyleFunction} from '../style/complex.js';
import {getDetailHtml} from '../feature/pubtran.stop.js';
import {
  getFeaturesByIds,
  getLargestInExtent as getLargestBldgInExtent,
  getPopupFeatureByUid,
  getZoomToFeatures,
} from '../source/source.js';
import {getStyleFunction as getIdentifyStyleFunction} from '../style/identify.js';
import {getInExtent as getMarkerInExtent} from '../source/marker.js';
import {getStyleFunction as getMarkerStyleFunction} from '../style/marker.js';
import {getSelectedFloorCodesWithMarkers} from '../feature/marker.js';
import {isBuildingCode} from '../feature/_constants.functions.js';
import {
  isDoor,
  isFloorCode,
  isOptPoiCtgUid,
  isRoom,
} from '../feature/_constants.functions.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").RequiredOptions} RequiredOptions
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../conf.js").ErrorMessageState} ErrorMessageState
 * @typedef {import("../conf.js").PopupState} PopupState
 * @typedef {import("../conf.js").TooltipState} TooltipState
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/View").default} ol.View
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
 * @typedef {import("../cluster/cluster.js").ClusterOptions} ClusterOptions
 * @typedef {import("../style/icon.js").IconOptions} IconOptions
 */

/**
 * @typedef {Object<string, StyleFunction>} AllStyleFunctionsResult
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
  state.requiredOpts.cluster && state.requiredOpts.cluster.facultyAbbr;

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

/**
 * @param {State} state state
 * @return {number} timestamp
 */
export const getResetTimestamp = (state) => state.resetTimestamp;

/**
 * @param {State} state state
 * @return {ClusterOptions} cluster options
 */
export const getRequiredClusterOptions = (state) => state.requiredOpts.cluster;

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
    return getFeaturesByIds(targetId, requiredMarkerIds);
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    import("reselect").SelectorArray,
 *    Array<ol.Feature>,
 *    function(Array<string>, number, string): Array<ol.Feature>
 * >}
 */
export const getInitMarkersWithGeometry = createSelector(
  [getInitMarkers],
  (initMarkers) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing init markers with geometry');
    }
    if (initMarkers.length === 0) {
      return [];
    }
    return initMarkers.filter((item) => !!item.getGeometry());
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
    } else if (mm_utils.isString(initZoomTo)) {
      initZoomTo = [/**@type {string}*/ (initZoomTo)];
    }
    return getZoomToFeatures(targetId, initZoomTo);
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
    return getId(center, resolution, requiredBasemap);
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
    return filterInvalidCodes(requiredMarkerIds, initMarkers);
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    Array<string>,
 *    function(Array<ol.Feature>, Array<ol.Feature>): Array<string>
 * >}
 */
export const getNoGeomCodes = createSelector(
  [getInitMarkers, getInitMarkersWithGeometry],
  (initMarkersAll, initMarkersWithGeom) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing no geom codes');
    }
    const result = initMarkersAll.filter(
      (initMarker) => !initMarkersWithGeom.includes(initMarker)
    );

    return mm_utils.flat(result.map((item) => item.get('polohKod')));
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
 *    function(boolean, boolean): boolean
 * >}
 */
export const areMarkersAndZoomToLoaded = createSelector(
  [areMarkersLoaded, areZoomToLoaded],
  (markersLoaded, zoomToLoaded) => {
    return markersLoaded && zoomToLoaded;
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
  const munimapAttr = mm_lang.getMsg(
    mm_lang.Translations.MUNIMAP_ATTRIBUTION_HTML,
    lang
  );
  const muAttr = mm_lang.getMsg(mm_lang.Translations.MU_ATTRIBUTION_HTML, lang);
  return [munimapAttr, muAttr];
});

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.View,
 *    function(string, ol.Coordinate, number, Array<ol.Feature>, Array<ol.Feature>): ol.View
 * >}
 */
export const calculateView = createSelector(
  [
    getTargetId,
    getRequiredCenter,
    getRequiredZoom,
    getInitMarkersWithGeometry,
    getInitZoomTo,
  ],
  (targetId, requiredCenter, requiredZoom, markers, zoomTo) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing view');
    }
    return createMapView(
      targetId,
      requiredCenter,
      requiredZoom,
      markers,
      zoomTo
    );
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
        tipLabel: mm_lang.getMsg(mm_lang.Translations.ATTRIBUTIONS, lang),
      },
      rotate: false,
      zoomOptions: {
        zoomInTipLabel: mm_lang.getMsg(mm_lang.Translations.ZOOM_IN, lang),
        zoomOutTipLabel: mm_lang.getMsg(mm_lang.Translations.ZOOM_OUT, lang),
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
    return mm_srcs.getBuildingStore(targetId).getFeatures().length;
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
      return isFloorCode(selectedFeature) ? selectedFeature : null;
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

    return mm_floor.getActiveCodes(targetId, selectedFeature);
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
      mm_utils.isDef(resolution) &&
      mm_range.contains(FLOOR_RESOLUTION, resolution)
    );
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
  (refExtent, selectedFeature, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether is selected building in extent');
    }
    if (mm_utils.isDefAndNotNull(selectedFeature)) {
      return isInExtent(selectedFeature, targetId, refExtent);
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

    //buildingsTimestamp and markersTimestamp are important for recalculations
    return (
      getMarkerInExtent(targetId, refExt) ||
      getLargestBldgInExtent(mm_srcs.getBuildingStore(targetId), refExt)
    );
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
        const lc = getLocationCodeFromFeature(featureForComputingSelected);
        const afc = lc && activeFloorCodes.find((code) => code.startsWith(lc));
        return afc || lc || null;
      } else {
        return null;
      }
    } else {
      return;
    }
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

    const result = getSelectedFloorCodeBySelectedFeature({
      selectedFeature,
      activeFloorCodes,
      targetId,
    });
    return result;
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
    return getBldgTitle({selectedFeature, targetId, lang});
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
  [getMarkersTimestamp, getInitMarkersWithGeometry],
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
    return mm_floor.getFloorsByBuildingCode(targetId, selectedFeature);
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

    return getBldgStyleFunction({
      targetId,
      inFloorResolutionRange,
      selectedFloorCode,
    });
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
    return getBldgPartialLabelFunction({
      lang,
      showLabels: requiredLabels,
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

    return getBldgLabelStyleFunction(buildingLabelFunction, {
      inFloorResolutionRange,
      selectedFloorCode,
    });
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

    return getCmplxStyleFunction(targetId, lang);
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
    getInitMarkersWithGeometry,
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
    return getMarkerStyleFunction(
      inFloorResolutionRange,
      selectedFeature,
      options
    );
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
    getRequiredClusterOptions,
  ],
  (
    lang,
    locationCodes,
    markerLabel,
    clusterFacultyAbbr,
    targetId,
    clusterOptions
  ) => {
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
    return getClusterStyleFunction(options, clusterOptions);
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

    return getRoomLabelFunction({
      lang,
      requiredLocationCodes,
      selectedFloorCode,
      targetId,
    });
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
    return getDefaultRoomStyleFunction(activeFloorCodes, targetId);
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
    return getActiveRoomStyleFunction(targetId);
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

    return getActivePoiStyleFunction({
      selectedFeature,
      activeFloorCodes,
      targetId,
    });
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
    return getIdentifyStyleFunction({
      lang,
      markerLabel,
      locationCodes,
      extent,
      targetId,
    });
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
      [mm_lyr.BUILDING_LAYER_ID]: styleForBuildingLayer,
      [mm_lyr.BUILDING_LABEL_LAYER_ID]: styleForBuildingLabelLayer,
      [mm_lyr.COMPLEX_LAYER_ID]: styleForComplexLayer,
      [mm_lyr.MARKER_LAYER_ID]: styleForMarkerLayer,
      [mm_lyr.CLUSTER_LAYER_ID]: styleForClusterLayer,
      [mm_lyr.ROOM_LAYER_ID]: styleForRoomLayer,
      [mm_lyr.ROOM_LABEL_LAYER_ID]: styleForRoomLabelLayer,
      [mm_lyr.ACTIVE_ROOM_LAYER_ID]: styleForRoomActiveLayer,
      [mm_lyr.ACTIVE_POI_LAYER_ID]: styleForPoiActiveLayer,
      [mm_lyr.IDENTIFY_LAYER_ID]: styleForIdentifyLayer,
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
  [getInitMarkersWithGeometry, getSelectedFeature],
  (initMarkers, selectedFeature) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing floor codes with markers');
    }
    if (!initMarkers || !selectedFeature) {
      return [];
    }
    return getSelectedFloorCodesWithMarkers(initMarkers, selectedFeature);
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
    if (!mm_utils.isDefAndNotNull(identifyTimestamp)) {
      return false;
    }
    const features = mm_srcs.getIdentifyStore(targetId).getFeatures();
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
    if (!mm_utils.isDefAndNotNull(identifyTimestamp) || !identifyEnabled) {
      return false;
    }
    const inSameFloor = mm_identify.inSameFloorAsSelected(
      targetId,
      selectedFeature
    );
    return mm_utils.isDefAndNotNull(inSameFloor) ? inSameFloor : true;
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

    if (!mm_utils.isDefAndNotNull(uid)) {
      return null;
    }
    return getPopupFeatureByUid(targetId, uid);
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
    return ft && ft.layerId === PUBTRAN_TYPE.layerId
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

  return mm_utils.isDefAndNotNull(uid);
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
    return ft && ft.layerId === PUBTRAN_TYPE.layerId
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
    const icon = /** @type {IconOptions|undefined}*/ (feature.get('icon'));
    if (ft && ft.layerId === PUBTRAN_TYPE.layerId) {
      return [0, 0];
    } else if (icon && icon.size) {
      const {offsetX, offsetY} = calculateBubbleOffsets(icon);
      return [offsetX, offsetY];
    } else {
      return defaultOffset;
    }
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    AnimationRequestState,
 *    function(ol.Size, ol.Extent, ol.View): AnimationRequestState
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
