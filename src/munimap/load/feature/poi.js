/**
 * @module
 */

import * as slctr from '../../redux/selector/selector.js';
import {POI_TYPE, PoiPurpose} from '../../feature/constants.js';
import {featuresForMap} from '../load.js';
import {getActivePoiStore, getPoiStore} from '../../source/constants.js';
import {getNotYetAddedFeatures} from '../../utils/store.js';

/**
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @param {redux.Store} store store
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 */
const loadActivePois = async (store, extent, resolution, projection) => {
  const activeFloorCodes = slctr.getActiveFloorCodes(store.getState());
  const targetId = slctr.getTargetId(store.getState());

  const entrances = [
    PoiPurpose.BUILDING_ENTRANCE,
    PoiPurpose.BUILDING_COMPLEX_ENTRANCE,
    PoiPurpose.COMPLEX_ENTRANCE,
  ];
  let where = `typ IN ('${entrances.join("', '")}')`;
  if (activeFloorCodes.length > 0) {
    const conditions = [];
    activeFloorCodes.forEach((floor) => {
      conditions.push(`polohKodPodlazi LIKE '${floor}%'`);
    });
    where += ' OR ' + conditions.join(' OR ');
  }
  where = '(' + where + ') AND volitelny = 0';
  const opts = {
    type: POI_TYPE,
    source: getPoiStore(targetId),
    where: where,
    method: 'POST',
  };
  const pois = await featuresForMap(opts, extent, resolution, projection);
  const activeStore = getActivePoiStore(targetId);
  const poisToAdd = getNotYetAddedFeatures(activeStore, pois);
  activeStore.addFeatures(poisToAdd);
};

export {loadActivePois};
