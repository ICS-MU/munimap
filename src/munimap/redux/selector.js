/* eslint-disable no-console */
/**
 * @module redux/selector
 */
import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {createSelector} from 'reselect';
import {createTileLayer} from '../view.js';
import {getStore as getBuildingStore} from '../layer/building.js';
import {getPairedBasemap, isArcGISBasemap} from '../layer/basemap.js';
import {getType} from '../feature/building.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("ol/layer/Tile").default} ol.layer.Tile
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 */

/**
 * @type {Reselect.Selector<State, boolean>}
 * @param {State} state state
 * @return {boolean} msg
 */
const getRequiredLoadingMessage = (state) => state.requiredOpts.loadingMessage;

/**
 * @type {Reselect.Selector<State, number?>}
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getMarkersTimestamp = (state) => state.markersTimestamp;

/**
 * @type {Reselect.Selector<State, number?>}
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getZoomToTimestamp = (state) => state.zoomToTimestamp;

/**
 * @type {Reselect.Selector<State, Array.<string>|Array.<Feature>>}
 * @param {State} state state
 * @return {Array.<string>|Array.<Feature>} required markers
 */
const getRequiredMarkers = (state) => state.requiredOpts.markers;

/**
 * @type {Reselect.Selector<State, string|Array<string>>}
 * @param {State} state state
 * @return {string|Array<string>} zoomTo
 */
const getRequiredZoomTo = (state) => state.requiredOpts.zoomTo;

/**
 * @type {Reselect.Selector<State, string>}
 * @param {State} state state
 * @return {string} basemap
 */
const getRequiredBaseMap = (state) => state.requiredOpts.baseMap;

/**
 * @type {Reselect.Selector<State, string>}
 * @param {State} state state
 * @return {string} lang
 */
const getLang = (state) => state.requiredOpts.lang;

/**
 * @type {Reselect.Selector<State, string>}
 * @param {State} state state
 * @return {string} target
 */
const getTarget = (state) => state.requiredOpts.target;

/**
 * @type {Reselect.Selector<State, ol.Coordinate>}
 * @param {State} state state
 * @return {ol.Coordinate} center
 */
const getCenter = (state) => state.center;

/**
 * @type {Reselect.Selector<State, number>}
 * @param {State} state state
 * @return {number} res
 */
const getResolution = (state) => state.resolution;

/**
 * createSelector return type Reselect.OutputSelector<S, T, (res: R1) => T>
 *    S: State (for Selector functions above)
 *    T: Returned type (must be same as returned type below)
 *    arg2: Function where arguments are returned types from Selector and
 *          return type is the same as T.
 * @type {Reselect.OutputSelector<
 *    State,
 *    Array<Feature>,
 *    function(Array<string>|Array<Feature>): Array<Feature>
 * >}
 */
export const getInitMarkers = createSelector(
  [getRequiredMarkers],
  (requiredMarkers) => {
    console.log('computing init markers');
    if (requiredMarkers.length === 0) {
      return [];
    }
    const type = getType();
    const buildings = getBuildingStore().getFeatures();
    const result = requiredMarkers.map((initMarker) => {
      if (initMarker instanceof Feature) {
        return initMarker;
      } else {
        return buildings.find((building) => {
          return building.get(type.primaryKey) === initMarker;
        });
      }
    });
    return result.filter((item) => item); //remove undefined (= invalid codes)
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    Array<Feature>,
 *    function(Array<string>|string): Array<Feature>
 * >}
 */
export const getInitZoomTo = createSelector(
  [getRequiredZoomTo],
  (initZoomTo) => {
    console.log('computing init zoomTo');
    if (initZoomTo.length === 0) {
      return [];
    } else if (munimap_utils.isString(initZoomTo)) {
      initZoomTo = [/**@type {string}*/ (initZoomTo)];
    }
    const type = getType();
    const buildings = getBuildingStore().getFeatures();
    return /**@type {Array<string>}*/ (initZoomTo).map((initZoomTo) => {
      return buildings.find((building) => {
        return building.get(type.primaryKey) === initZoomTo;
      });
    });
  }
);

/**
 * @type {Reselect.OutputSelector<
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

    console.log('computing baseMapLayerId');
    const isSafeLatLon = munimap_utils.inRange(
      center[1],
      -8399737.89, //60° N
      8399737.89 //60° S
    );
    const isSafeResolution = munimap_utils.inRange(
      resolution,
      38.21851414258813,
      Infinity
    );
    const basemapLayerId =
      !isSafeLatLon && !isSafeResolution && isArcGISBasemap(requiredBasemap)
        ? getPairedBasemap(requiredBasemap)
        : requiredBasemap;
    return basemapLayerId;
  }
);

/**
 * Get basemap layer. There must be target param, otherwise
 * multiple maps would share a single tile layer.
 *
 * @type {Reselect.OutputSelector<
 *    State,
 *    ol.layer.Tile,
 *    function(string, string, string): ol.layer.Tile
 * >}
 */
export const getBasemapLayer = createSelector(
  [getBasemapLayerId, getLang, getTarget],
  (basemapLayerId, lang, target) => {
    console.log('computing baseMapLayer');
    return createTileLayer(basemapLayerId, lang);
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    Array<string>,
 *    function(Array<string>|Array<Feature>, Array<Feature>): Array<string>
 * >}
 */
export const getInvalidCodes = createSelector(
  [getRequiredMarkers, getInitMarkers],
  (requiredMarkers, initMarkers) => {
    console.log('computing invalid codes');
    if (requiredMarkers.length === 0) {
      return [];
    }

    const type = getType();
    const initMarkersCodes = initMarkers.map((marker) =>
      marker.get(type.primaryKey)
    );

    const difference = /**@type {Array}*/ (requiredMarkers).filter(
      (markerString) => {
        return munimap_utils.isString(markerString)
          ? !initMarkersCodes.includes(markerString)
          : false;
      }
    );
    return difference;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>|Array<Feature>, number?): boolean
 * >}
 */
export const loadMarkers = createSelector(
  [getRequiredMarkers, getMarkersTimestamp],
  (requiredMarkers, markersTimestamp) => {
    console.log('computing whether load markers');
    return requiredMarkers.length > 0 && markersTimestamp === null;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>|string, number?): boolean
 * >}
 */
export const loadZoomTo = createSelector(
  [getRequiredZoomTo, getZoomToTimestamp],
  (requiredZoomTo, zoomToTimestamp) => {
    console.log('computing whether load zoomto');
    return requiredZoomTo.length > 0 && zoomToTimestamp === null;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>|Array<Feature>, number?): boolean
 * >}
 */
export const areMarkersLoaded = createSelector(
  [getRequiredMarkers, getMarkersTimestamp],
  (requiredMarkers, markersTimestamp) => {
    console.log('computing if markers are loaded');
    return (
      (requiredMarkers.length > 0 && markersTimestamp > 0) ||
      requiredMarkers.length === 0
    );
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>|string, number?): boolean
 * >}
 */
export const areZoomToLoaded = createSelector(
  [getRequiredZoomTo, getZoomToTimestamp],
  (requiredZoomTo, zoomToTimestamp) => {
    console.log('computing if zoomto are loaded');
    return (
      (requiredZoomTo.length > 0 && zoomToTimestamp > 0) ||
      requiredZoomTo.length === 0
    );
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean?,
 *    function(boolean?, boolean, boolean): boolean
 * >}
 */
export const toggleLoadingMessage = createSelector(
  [getRequiredLoadingMessage, areMarkersLoaded, areZoomToLoaded],
  (requireLoadingMessage, markersLoaded, zoomToLoaded) => {
    console.log('computing loading message');
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
 * @type {Reselect.OutputSelector<
 *    State,
 *    ol.AttributionLike,
 *    function(string): ol.AttributionLike
 * >}
 */
export const getMuAttrs = createSelector([getLang], (lang) => {
  console.log('computing MU attrs');
  const munimapAttr = munimap_lang.getMsg(
    munimap_lang.Translations.MUNIMAP_ATTRIBUTION_HTML,
    lang
  );
  const muAttr = munimap_lang.getMsg(
    munimap_lang.Translations.MU_ATTRIBUTION_HTML,
    lang
  );
  return [munimapAttr, muAttr];
});
