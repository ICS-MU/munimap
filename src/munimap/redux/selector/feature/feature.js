/* eslint-disable no-console */
/**
 * @module
 */

import * as mm_utils from '../../../utils/utils.js';
import * as ss from '../simple.js';
import {ENABLE_SELECTOR_LOGS} from '../../../conf.js';
import {createSelector} from '../reselect.js';
import {filterInvalidCodes} from '../../../feature/feature.js';
import {getFeaturesByIds, getZoomToFeatures} from '../../../source/source.js';
import {isOptPoiCtgUid} from '../../../feature/utils.js';

/**
 * @typedef {import("../../../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * createSelector return type Reselect.OutputSelector<S, T, (res: R1) => T>
 *    S: State (for Selector functions above)
 *    T: Returned type (must be same as returned type below)
 *    arg2: Function where arguments are returned types from Selector and
 *          return type is the same as T.
 * @type {import("reselect").OutputSelector<
 *    import("reselect").SelectorArray,
 *    Array<ol.Feature>,
 *    function(Array<string>, number, number, string): Array<ol.Feature>
 * >}
 */
const getInitMarkers = createSelector(
  [
    ss.getRequiredMarkerIds,
    ss.getMarkersTimestamp,
    ss.getZoomToTimestamp,
    ss.getTargetId,
  ],
  // zoomToTimestamp needed in order to wait for both markers and zoomTos
  // during render
  (requiredMarkerIds, markersTimestamp, zoomToTimestamp, targetId) => {
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
const getInitMarkersWithGeometry = createSelector(
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
 *    function(Array<string>|string, number, number, string): Array<ol.Feature>
 * >}
 */
const getInitZoomTo = createSelector(
  [
    ss.getRequiredZoomTo,
    ss.getMarkersTimestamp,
    ss.getZoomToTimestamp,
    ss.getTargetId,
  ],
  // markerTimestamp needed to wait with animation for both markers and zoomTos
  (initZoomTo, markerTimestamp, zoomToTimestamp, targetId) => {
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
 *    Array<string>,
 *    function(Array<string>, Array<ol.Feature>): Array<string>
 * >}
 */
const getInvalidCodes = createSelector(
  [ss.getRequiredMarkerIds, getInitMarkers],
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
const getNoGeomCodes = createSelector(
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
const loadMarkers = createSelector(
  [ss.getRequiredMarkerIds, ss.getMarkersTimestamp],
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
const loadZoomTo = createSelector(
  [ss.getRequiredZoomTo, ss.getZoomToTimestamp],
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
const areMarkersLoaded = createSelector(
  [ss.getRequiredMarkerIds, ss.getMarkersTimestamp],
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
const areZoomToLoaded = createSelector(
  [ss.getRequiredZoomTo, ss.getZoomToTimestamp],
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
const areMarkersAndZoomToLoaded = createSelector(
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
const areOptPoiLoaded = createSelector(
  [ss.getRequiredMarkerIds, ss.getOptPoisTimestamp],
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

export {
  areMarkersAndZoomToLoaded,
  areMarkersLoaded,
  areOptPoiLoaded,
  areZoomToLoaded,
  getInitMarkers,
  getInitMarkersWithGeometry,
  getInitZoomTo,
  getInvalidCodes,
  getNoGeomCodes,
  loadMarkers,
  loadZoomTo,
};
