/* eslint-disable no-console */
/**
 * @module
 */

import * as ss from './simple.js';
import {ENABLE_SELECTOR_LOGS} from '../../conf.js';
import {createLayer as createBasemapLayer, getId} from '../../layer/basemap.js';
import {createSelector} from './reselect.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("ol/layer/Tile").default} ol.layer.Tile
 */

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    string,
 *    function(ol.Coordinate, number, string): string
 * >}
 */
const getBasemapLayerId = createSelector(
  [ss.getCenter, ss.getResolution, ss.getRequiredBaseMap],
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
const getBasemapLayer = createSelector(
  [getBasemapLayerId, ss.getLang, ss.getTargetId],
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

export {getBasemapLayer, getBasemapLayerId};
