/* eslint-disable no-console */
/**
 * @module redux/selector/reselect
 */

import * as mm_srcs from '../../source/constants.js';
import * as sfl from './feature/floor.js';
import * as ss from './simple.js';
import * as sv from './view.js';
import {ENABLE_SELECTOR_LOGS} from '../../conf.js';
import {createSelector} from './reselect.js';
import {getLargestInExtent as getLargestBldgInExtent} from '../../source/source.js';
import {getLocationCodeFromFeature} from '../../feature/feature.js';
import {getInExtent as getMarkerInExtent} from '../../source/marker.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/extent").Extent} ol.Extent
 */

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
  [
    sv.getReferenceExtent,
    ss.getBuildingsTimestamp,
    ss.getMarkersTimestamp,
    ss.getTargetId,
  ],
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
const getSelectedLocationCode = createSelector(
  [
    ss.getSize,
    ss.getSelectedFeature,
    getFeatureForComputingSelected,
    sfl.isInFloorResolutionRange,
    sv.isSelectedInExtent,
    sfl.getActiveFloorCodes,
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

export {getFeatureForComputingSelected, getSelectedLocationCode};

export * from './feature/building.js';
export * from './feature/cluster.js';
export * from './feature/feature.js';
export * from './feature/floor.js';
export * from './feature/identify.js';
export * from './layer.js';
export * from './popup.js';
export * from './simple.js';
export * from './style.js';
export * from './view.js';
