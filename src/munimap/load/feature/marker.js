/**
 * @module
 */

import * as actions from '../../redux/action.js';
import * as mm_assert from '../../assert/assert.js';
import * as mm_utils from '../../utils/utils.js';
import * as srcs from '../../source/constants.js';
import {MARKER_LABEL_STORE, REQUIRED_CUSTOM_MARKERS} from '../../constants.js';
import {addPoiDetail} from '../../feature/room.js';
import {
  createMarkerStringsArray,
  createZoomToStringsArray,
} from '../../utils/param.js';
import {decorate as decorateCustomMarker} from '../../feature/marker.custom.js';
import {featuresFromParam} from './feature.js';
import {getLoadedTypes} from '../../redux/reducer/utils.js';
import {
  isCustomMarker,
  isOptPoiCtgUid,
  isRoomCode,
} from '../../feature/utils.js';
import {loadOptPois} from './optpoi.js';
import {markerLabel as optPoiMarkerLabel} from '../../style/optpoi.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("../../conf.js").RequiredOptions} RequiredOptions
 * @typedef {import("../../conf.js").State} State
 */

/**
 * @typedef {Object} LoadOrDecorateMarkersOptions
 * @property {Array<string>} [poiFilter] poi filter
 * @property {Array<string>} [markerFilter] marker filter
 * @property {string} [lang] language
 * @property {string} targetId target
 */

/**
 * Load features by location codes or decorate custom markers.
 * @param {Array<string>|Array<ol.Feature>|undefined} featuresLike featuresLike
 * @param {LoadOrDecorateMarkersOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise resolving with markers
 */
export const loadOrDecorateMarkers = async (featuresLike, options) => {
  const lang = options.lang;
  const targetId = options.targetId;
  const arrPromises = []; // array of promises of features

  if (!Array.isArray(featuresLike)) {
    return [];
  } else {
    featuresLike.forEach((el) => {
      if (!isOptPoiCtgUid(el)) {
        arrPromises.push(
          new Promise((resolve, reject) => {
            if (REQUIRED_CUSTOM_MARKERS[el]) {
              decorateCustomMarker(REQUIRED_CUSTOM_MARKERS[el]);
              resolve(REQUIRED_CUSTOM_MARKERS[el]);
            } else if (mm_utils.isString(el)) {
              featuresFromParam(targetId, el).then((results) => {
                resolve(results);
              });
            }
          })
        );
      } else {
        const workplaces = //HS
          options.markerFilter !== null ? [...options.markerFilter] : [];
        const ctgIds = [el.split(':')[1]];

        arrPromises.push(
          loadOptPois(targetId, {
            ids: ctgIds,
            workplaces: workplaces,
            poiFilter: options.poiFilter,
          }).then((features) => {
            const roomOptPois = features.filter((f) => {
              const lc = /**@type {string}*/ (f.get('polohKodLokace'));
              mm_assert.assertString(lc);
              return isRoomCode(lc);
            });
            const roomCodes = roomOptPois.map((f) => f.get('polohKodLokace'));
            MARKER_LABEL_STORE[`OPT_POI_MARKER_LABEL_${options.targetId}`] =
              optPoiMarkerLabel(ctgIds[0], roomCodes, lang);

            return new Promise((resolve, reject) => {
              featuresFromParam(targetId, roomCodes).then((rooms) => {
                resolve(addPoiDetail(rooms, features, lang));
              });
            });
          })
        );
      }
    });

    let markers = await Promise.all(arrPromises);
    // reduce array of arrays to 1 array
    markers = markers.reduce((a, b) => {
      a = a.concat(b);
      mm_utils.removeArrayDuplicates(a);
      return a;
    }, []);
    return markers;
  }
};

/**
 * @param {RequiredOptions} requiredOpts required options
 * @param {redux.Dispatch} asyncDispatch asynchronous dispatch method
 */
const loadMarkers = (requiredOpts, asyncDispatch) => {
  const requiredMarkers = requiredOpts.markerIds;
  const markerStrings = createMarkerStringsArray(requiredMarkers);
  loadOrDecorateMarkers(markerStrings, requiredOpts).then((res) => {
    mm_assert.assertMarkerFeatures(res);
    const loadedTypes = getLoadedTypes(res, requiredMarkers);
    const hasCustom = res.length && res.some((el) => isCustomMarker(el));
    asyncDispatch(actions.markers_loaded(hasCustom, loadedTypes));
  });
};

/**
 * @param {string} targetId targetId
 * @param {State} newState new state
 * @param {Array<string>} requiredMarkers requred markers
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const clearAndLoadMarkers = (
  targetId,
  newState,
  requiredMarkers,
  asyncDispatch
) => {
  srcs.getMarkerStore(targetId).clear();
  srcs.getOptPoiStore(targetId).clear();
  srcs.getClusterStore(targetId).clear();

  const markerStrings = createMarkerStringsArray(requiredMarkers);
  loadOrDecorateMarkers(markerStrings, newState.requiredOpts).then((res) => {
    mm_assert.assertMarkerFeatures(res);
    const loadedTypes = getLoadedTypes(res, requiredMarkers);
    srcs.getMarkerStore(targetId).addFeatures(res);
    const hasCustom = res.length && res.some((el) => isCustomMarker(el));
    asyncDispatch(actions.markers_loaded(hasCustom, loadedTypes));
  });
};

/**
 * @param {string} targetId targetId
 * @param {Array<string>|string} requiredZoomTo required zoom to
 * @param {redux.Dispatch} asyncDispatch asynchronous dispatch method
 */
const loadZoomTo = (targetId, requiredZoomTo, asyncDispatch) => {
  const zoomToStrings = createZoomToStringsArray(requiredZoomTo);
  featuresFromParam(targetId, zoomToStrings).then((res) => {
    const loadedTypes = getLoadedTypes(res);
    asyncDispatch(actions.zoomTo_loaded(loadedTypes));
  });
};

export {clearAndLoadMarkers, loadMarkers, loadZoomTo};
