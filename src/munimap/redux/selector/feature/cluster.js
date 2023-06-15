/* eslint-disable no-console */
/**
 * @module
 */

import * as sf from './feature.js';
import * as ss from '../simple.js';
import {
  BUILDING_RESOLUTION,
  ROOM_RESOLUTION,
} from '../../../feature/cluster.js';
import {ENABLE_SELECTOR_LOGS} from '../../../conf.js';
import {createSelector} from '../reselect.js';
import {isDoor, isRoom} from '../../../feature/utils.js';

/**
 * @typedef {import("../../../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    import("../../../utils/range.js").RangeInterface,
 *    function(number, Array<ol.Feature>): import("../../../utils/range.js").RangeInterface
 * >}
 */
const getClusterResolution = createSelector(
  [ss.getMarkersTimestamp, sf.getInitMarkersWithGeometry],
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

export {getClusterResolution};
