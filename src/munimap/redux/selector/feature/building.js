/* eslint-disable no-console */
/**
 * @module
 */

import * as ss from '../simple.js';
import {ENABLE_SELECTOR_LOGS} from '../../../conf.js';
import {createSelector} from '../reselect.js';
import {getTitle as getBldgTitle} from '../../../feature/building.js';
import {getBuildingStore} from '../../../source/constants.js';

/**
 * @typedef {import("../../../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 */

/**
 * @typedef {object} BuildingTitleOptions
 * @property {string} bldgTitle bldgTitle
 * @property {string} complexTitle complex title
 */

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    number,
 *    function(number): number
 * >}
 */
const getLoadedBuildingsCount = createSelector(
  [ss.getBuildingsTimestamp, ss.getTargetId],
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
 *    BuildingTitleOptions,
 *    function(string, string): BuildingTitleOptions
 * >}
 */
const getBuildingTitle = createSelector(
  [ss.getSelectedFeature, ss.getLang, ss.getTargetId],
  (selectedFeature, lang, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing building title to info element');
    }
    return getBldgTitle({selectedFeature, targetId, lang});
  }
);

export {getBuildingTitle, getLoadedBuildingsCount};
