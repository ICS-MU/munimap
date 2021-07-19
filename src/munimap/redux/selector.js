/* eslint-disable no-console */
/**
 * @module redux/selector
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import View from 'ol/View';
import {REQUIRED_CUSTOM_MARKERS} from '../create.js';
import {defaults as control_defaults} from 'ol/control';
import {createSelector} from 'reselect';
import {createTileLayer} from '../view.js';
import {ofFeatures as extentOfFeatures} from '../utils/extent.js';
import {getStore as getBuildingStore} from '../layer/building.js';
import {getPairedBasemap, isArcGISBasemap} from '../layer/basemap.js';
import {getType} from '../feature/building.js';
import {isCustom as isCustomMarker} from '../feature/marker.custom.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../create.js").InitExtentOptions} InitExtentOptions
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("ol/control/Control").default} ol.control.Control
 * @typedef {import("ol/layer/Tile").default} ol.layer.Tile
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 */

/**
 * @typedef {Object} InitialViewProps
 * @property {string} requiredTarget
 * @property {ol.Coordinate} requiredCenter
 * @property {number} requiredZoom
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
 * @type {Reselect.Selector<State, Array.<string>>}
 * @param {State} state state
 * @return {Array.<string>} required markers
 */
const getRequiredMarkerIds = (state) => state.requiredOpts.markerIds;

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
 * @type {Reselect.Selector<State, ol.Coordinate>}
 * @param {State} state state
 * @return {ol.Coordinate} center
 */
const getRequiredCenter = (state) => state.requiredOpts.center;

/**
 * @type {Reselect.Selector<State, number>}
 * @param {State} state state
 * @return {number} center
 */
const getRequiredZoom = (state) => state.requiredOpts.zoom;

/**
 * @type {Reselect.Selector<State, string>}
 * @param {State} state state
 * @return {string} center
 */
const getRequiredTarget = (state) => state.requiredOpts.target;

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
 *    Array<ol.Feature>,
 *    function(Array<string>): Array<ol.Feature>
 * >}
 */
export const getInitMarkers = createSelector(
  [getRequiredMarkerIds],
  (requiredMarkerIds) => {
    console.log('computing init markers');
    if (requiredMarkerIds.length === 0) {
      return [];
    }
    const type = getType();
    const buildings = getBuildingStore().getFeatures();
    const result = requiredMarkerIds.map((initMarkerId) => {
      if (REQUIRED_CUSTOM_MARKERS[initMarkerId]) {
        return REQUIRED_CUSTOM_MARKERS[initMarkerId];
      } else {
        return buildings.find((building) => {
          return building.get(type.primaryKey) === initMarkerId;
        });
      }
    });
    return result.filter((item) => item); //remove undefined (= invalid codes)
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    Array<ol.Feature>,
 *    function(Array<string>|string): Array<ol.Feature>
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
 *    function(Array<string>, Array<ol.Feature>): Array<string>
 * >}
 */
export const getInvalidCodes = createSelector(
  [getRequiredMarkerIds, getInitMarkers],
  (requiredMarkerIds, initMarkers) => {
    console.log('computing invalid codes');
    if (requiredMarkerIds.length === 0) {
      return [];
    }

    const type = getType();
    const initMarkersCodes = [];
    initMarkers.forEach((marker) => {
      if (!isCustomMarker(marker)) {
        initMarkersCodes.push(marker.get(type.primaryKey));
      }
    });

    const difference = /**@type {Array}*/ (requiredMarkerIds).filter(
      (markerString) => {
        return munimap_utils.isString(markerString) &&
          !REQUIRED_CUSTOM_MARKERS[markerString]
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
 *    function(Array<string>, number?): boolean
 * >}
 */
export const loadMarkers = createSelector(
  [getRequiredMarkerIds, getMarkersTimestamp],
  (requiredMarkerIds, markersTimestamp) => {
    console.log('computing whether load markers');
    return requiredMarkerIds.length > 0 && markersTimestamp === null;
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
 *    function(Array<string>, number?): boolean
 * >}
 */
export const areMarkersLoaded = createSelector(
  [getRequiredMarkerIds, getMarkersTimestamp],
  (requiredMarkerIds, markersTimestamp) => {
    console.log('computing if markers are loaded');
    return (
      (requiredMarkerIds.length > 0 && markersTimestamp > 0) ||
      requiredMarkerIds.length === 0
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

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    InitialViewProps,
 *    function(string, ol.Coordinate, number): InitialViewProps
 * >}
 */
export const getInitViewProps = createSelector(
  [getRequiredTarget, getRequiredCenter, getRequiredZoom],
  (requiredTarget, requiredCenter, requiredZoom) => {
    console.log('computing initial view props');
    return {requiredTarget, requiredCenter, requiredZoom};
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    View,
 *    function(InitialViewProps, Array<ol.Feature>, Array<ol.Feature>): View
 * >}
 */
export const calculateView = createSelector(
  [getInitViewProps, getInitMarkers, getInitZoomTo],
  (initialViewProps, markers, zoomTo) => {
    console.log('computing view');
    const {requiredTarget, requiredCenter, requiredZoom} = initialViewProps;
    const target = document.getElementById(requiredTarget);
    const center = ol_proj.transform(
      requiredCenter || [16.605390495656977, 49.1986567194723],
      ol_proj.get('EPSG:4326'),
      ol_proj.get('EPSG:3857')
    );
    const zoom = requiredZoom === null ? 13 : requiredZoom;
    const view = new View({
      center: center,
      maxZoom: 23,
      minZoom: 0,
      zoom: zoom,
      constrainResolution: true,
    });
    const initExtentOpts = /**@type {InitExtentOptions}*/ ({});
    if (zoomTo || markers) {
      zoomTo = zoomTo.length ? zoomTo : markers;
      if (zoomTo.length) {
        let res;
        const extent = extentOfFeatures(zoomTo);
        if (requiredZoom === null && requiredCenter === null) {
          if (target.offsetWidth === 0 || target.offsetHeight === 0) {
            view.fit(extent);
          } else {
            view.fit(extent, {
              size: [target.offsetWidth, target.offsetHeight],
            });
            res = view.getResolution();
            munimap_assert.assert(res);
            ol_extent.buffer(extent, res * 30, extent);
            view.fit(extent, {
              size: [target.offsetWidth, target.offsetHeight],
            });
            initExtentOpts.extent = extent;
            initExtentOpts.size = [target.offsetWidth, target.offsetHeight];
          }
          /** constrainResolution not exists in OL6, should be all removed */
          /** https://github.com/openlayers/openlayers/pull/9137 */
          // if (munimap.marker.custom.isCustom(zoomTo[0])) {
          //   if (view.getResolution() < munimap.floor.RESOLUTION.max) {
          //     res = view.constrainResolution(
          //       munimap.floor.RESOLUTION.max,
          //       undefined,
          //       1
          //     );
          //     initExtentOpts.resolution = res;
          //     view.setResolution(res);
          //   }
          // }
        } else if (requiredCenter === null) {
          initExtentOpts.center = ol_extent.getCenter(extent);
          view.setCenter(ol_extent.getCenter(extent));
        }
      } else {
        initExtentOpts.center = center;
        initExtentOpts.zoom = zoom;
      }
    }
    view.set('initExtentOpts', initExtentOpts, true);
    return view;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    import("ol/Collection").default<ol.control.Control>,
 *    function(string): import("ol/Collection").default<ol.control.Control>
 * >}
 */
export const getDefaultControls = createSelector([getLang], (lang) => {
  console.log('computing default controls');
  return control_defaults({
    attributionOptions: {
      tipLabel: munimap_lang.getMsg(
        munimap_lang.Translations.ATTRIBUTIONS,
        lang
      ),
    },
    rotate: false,
    zoomOptions: {
      zoomInTipLabel: munimap_lang.getMsg(
        munimap_lang.Translations.ZOOM_IN,
        lang
      ),
      zoomOutTipLabel: munimap_lang.getMsg(
        munimap_lang.Translations.ZOOM_OUT,
        lang
      ),
    },
  });
});
