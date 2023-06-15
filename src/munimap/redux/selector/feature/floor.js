/* eslint-disable no-console */
/**
 * @module
 */

import * as mm_floor from '../../../feature/floor.js';
import * as mm_range from '../../../utils/range.js';
import * as mm_utils from '../../../utils/utils.js';
import * as sf from './feature.js';
import * as ss from '../simple.js';
import {ENABLE_SELECTOR_LOGS} from '../../../conf.js';
import {FLOOR_RESOLUTION} from '../../../feature/constants.js';
import {createSelector} from '../reselect.js';
import {getSelectedFloorCode as getSelectedFloorCodeBySelectedFeature} from '../../../feature/feature.js';
import {getSelectedFloorCodesWithMarkers} from '../../../feature/marker.js';
import {isBuildingCode, isFloorCode} from '../../../feature/utils.js';

/**
 * @typedef {import("../../../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    string,
 *    function(string): string
 * >}
 */
const getSelectedFloorCode = createSelector(
  [ss.getSelectedFeature],
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
const getActiveFloorCodes = createSelector(
  [ss.getSelectedFeature, ss.getFloorsTimestamp, ss.getTargetId],
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
  [ss.getResolution],
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
 *    string,
 *    function(string, Array<string>): string
 * >}
 */
const calculateSelectedFloor = createSelector(
  [ss.getSelectedFeature, getActiveFloorCodes, ss.getTargetId],
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
 *    Array<ol.Feature>,
 *    function(number, string): Array<ol.Feature>
 * >}
 */
const getFloorsByBuildingCode = createSelector(
  [ss.getFloorsTimestamp, ss.getSelectedFeature, ss.getTargetId],
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
 *    Array<string>,
 *    function(Array<ol.Feature>, string): Array<string>
 * >}
 */
const getFloorCodesWithMarkers = createSelector(
  [sf.getInitMarkersWithGeometry, ss.getSelectedFeature],
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

export {
  calculateSelectedFloor,
  getActiveFloorCodes,
  getFloorCodesWithMarkers,
  getFloorsByBuildingCode,
  getSelectedFloorCode,
  isInFloorResolutionRange,
};
