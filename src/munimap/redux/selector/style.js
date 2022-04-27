/* eslint-disable no-console */
/**
 * @module redux/selector/selector.style
 */

import * as mm_lyr from '../../layer/constants.js';
import * as sf from './feature/feature.js';
import * as sfl from './feature/floor.js';
import * as ss from './simple.js';
import * as sv from './view.js';
import {ENABLE_SELECTOR_LOGS} from '../../conf.js';
import {MARKER_LABEL_STORE} from '../../constants.js';
import {createSelector} from './reselect.js';
import {getActiveStyleFunction as getActivePoiStyleFunction} from '../../style/poi.js';
import {
  getActiveStyleFunction as getActiveRoomStyleFunction,
  getDefaultStyleFunction as getDefaultRoomStyleFunction,
  getLabelFunction as getRoomLabelFunction,
} from '../../style/room.js';
import {
  getLabelStyleFunction as getBldgLabelStyleFunction,
  getPartialLabelFunction as getBldgPartialLabelFunction,
  getStyleFunction as getBldgStyleFunction,
} from '../../style/building.js';
import {getStyleFunction as getClusterStyleFunction} from '../../style/cluster.js';
import {getStyleFunction as getCmplxStyleFunction} from '../../style/complex.js';
import {getStyleFunction as getIdentifyStyleFunction} from '../../style/identify.js';
import {getStyleFunction as getMarkerStyleFunction} from '../../style/marker.js';
import {isOptPoiCtgUid} from '../../feature/utils.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("ol/style/Style").StyleFunction} StyleFunction
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../../feature/marker.js").LabelFunction} MarkerLabelFunction
 */

/**
 * @typedef {Object<string, StyleFunction>} AllStyleFunctionsResult
 */

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(boolean, string): StyleFunction
 * >}
 */
const getStyleForBuildingLayer = createSelector(
  [sfl.isInFloorResolutionRange, sfl.getSelectedFloorCode, ss.getTargetId],
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
const getBuildingLabelFunction = createSelector(
  [sv.getExtent, ss.getLang, ss.getRequiredLabels, ss.getTargetId],
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
const getStyleForBuildingLabelLayer = createSelector(
  [
    sfl.isInFloorResolutionRange,
    sfl.getSelectedFloorCode,
    getBuildingLabelFunction,
  ],
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
const getStyleForComplexLayer = createSelector(
  [ss.getLang, ss.getTargetId],
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
const getMarkerLabel = createSelector(
  [
    ss.getTargetId,
    ss.getRequiredMarkerIds,
    ss.getRequiredMarkerLabelId,
    sf.areOptPoiLoaded,
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
const getStyleForMarkerLayer = createSelector(
  [
    ss.getLang,
    sf.getInitMarkersWithGeometry,
    getMarkerLabel,
    sv.getExtent,
    ss.getRequiredLocationCodes,
    sfl.isInFloorResolutionRange,
    ss.getSelectedFeature,
    sfl.getActiveFloorCodes,
    ss.getTargetId,
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
const getStyleForClusterLayer = createSelector(
  [
    ss.getLang,
    ss.getRequiredLocationCodes,
    getMarkerLabel,
    ss.getRequiredClusterFacultyAbbr,
    ss.getTargetId,
    ss.getRequiredClusterOptions,
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
const getStyleForRoomLabelLayer = createSelector(
  [
    ss.getLang,
    ss.getRequiredLocationCodes,
    sfl.getSelectedFloorCode,
    ss.getTargetId,
  ],
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
const getStyleForRoomLayer = createSelector(
  [sfl.getActiveFloorCodes, ss.getTargetId],
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
const getStyleForActiveRoomLayer = createSelector(
  [sfl.getActiveFloorCodes, ss.getTargetId],
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
const getStyleForActivePoiLayer = createSelector(
  [sfl.getActiveFloorCodes, ss.getSelectedFeature, ss.getTargetId],
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
const getStyleForIdentifyLayer = createSelector(
  [
    ss.getLang,
    getMarkerLabel,
    ss.getRequiredLocationCodes,
    sv.getExtent,
    ss.getTargetId,
  ],
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
const getAllStyleFunctions = createSelector(
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

export {getAllStyleFunctions};
