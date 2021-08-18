/* eslint-disable no-console */
/**
 * @module redux/selector
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_floor from '../feature/floor.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_utils from '../utils/utils.js';
import * as munimap_view_cluster from '../view/cluster.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import View from 'ol/View';
import {
  CREATED_MAPS,
  REQUIRED_CUSTOM_MARKERS,
  REQUIRED_MARKER_LABEL,
} from '../create.js';
import {ENABLE_SELECTOR_LOGS} from '../conf.js';
import {GeoJSON} from 'ol/format';
import {MultiPolygon, Polygon} from 'ol/geom';
import {styleFunction as clusterStyleFunction} from '../style//cluster.js';
import {styleFunction as complexStyleFunction} from '../style/complex.js';
import {defaults as control_defaults} from 'ol/control';
import {createLayer as createBasemapLayer} from '../layer/basemap.js';
import {createSelector} from 'reselect';
import {
  ofFeatures as extentOfFeatures,
  getBufferValue,
} from '../utils/extent.js';
import {featureExtentIntersect} from '../utils/geom.js';
import {
  getByCode as getBuildingByCode,
  getType,
  hasInnerGeometry,
  isBuilding,
  isSelected,
} from '../feature/building.js';
import {getStore as getBuildingStore} from '../view/building.js';
import {getStore as getFloorStore} from '../view/floor.js';
import {getStore as getMarkerStore} from '../view/marker.js';
import {getPairedBasemap, isArcGISBasemap} from '../layer/basemap.js';
import {isCustom as isCustomMarker} from '../feature/marker.custom.js';
import {labelFunction, styleFunction} from '../style/building.js';
import {styleFunction as markerStyleFunction} from '../style/marker.js';

/**
 * @typedef {import("../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("../create.js").InitExtentOptions} InitExtentOptions
 * @typedef {import("../feature/floor.js").Options} FloorOptions
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("ol/control/Control").default} ol.control.Control
 * @typedef {import("ol/layer/Tile").default} ol.layer.Tile
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("ol/style/Style").default} ol.style.Style
 * @typedef {import("ol/style/Style").StyleFunction} StyleFunction
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
 * @type {Reselect.Selector<State, number?>}
 * @param {State} state state
 * @return {number|null} timestamp
 */
const getBuildingsTimestamp = (state) => state.buildingsTimestamp;

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
 * @type {Reselect.Selector<State, boolean>}
 * @param {State} state state
 * @return {boolean} basemap
 */
const getRequiredLabels = (state) => state.requiredOpts.labels;

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
 * @return {number} rotation
 */
const getRotation = (state) => state.rotation;

/**
 * @type {Reselect.Selector<State, ol.Size>}
 * @param {State} state state
 * @return {ol.Size} map size
 */
const getSize = (state) => state.mapSize;

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
 * @type {Reselect.Selector<State, FloorOptions>}
 * @param {State} state state
 * @return {FloorOptions} selected floor
 */
const getSelectedFloor = (state) => state.selectedFloor;

/**
 * @type {Reselect.Selector<State, string>}
 * @param {State} state state
 * @return {string} selected building
 */
const getSelectedBuilding = (state) => state.selectedBuilding;

/**
 * @type {Reselect.Selector<State, string>}
 * @param {State} state state
 * @return {string} marker label function id
 */
const getRequiredMarkerLabelId = (state) => state.requiredOpts.markerLabelId;

/**
 * @type {Reselect.Selector<State, boolean>}
 * @param {State} state state
 * @return {boolean} whether to show only location codes
 */
const getRequiredLocationCodes = (state) => state.requiredOpts.locationCodes;

/**
 * @type {Reselect.Selector<State, boolean>}
 * @param {State} state state
 * @return {boolean} whether to cluster faculty abbreviations
 */
const getRequiredClusterFacultyAbbr = (state) =>
  state.requiredOpts.clusterFacultyAbbr;

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
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing init markers');
    }
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
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing init zoomTo');
    }
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

    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing baseMapLayerId');
    }
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
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing baseMapLayer');
    }
    return createBasemapLayer(basemapLayerId, lang);
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
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing invalid codes');
    }
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
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether load markers');
    }
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
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether load zoomto');
    }
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
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean,
 *    function(Array<string>|string, number?): boolean
 * >}
 */
export const areZoomToLoaded = createSelector(
  [getRequiredZoomTo, getZoomToTimestamp],
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
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean?,
 *    function(boolean?, boolean, boolean): boolean
 * >}
 */
export const toggleLoadingMessage = createSelector(
  [getRequiredLoadingMessage, areMarkersLoaded, areZoomToLoaded],
  (requireLoadingMessage, markersLoaded, zoomToLoaded) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing loading message');
    }
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
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing MU attrs');
  }
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
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing initial view props');
    }
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
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing view');
    }
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
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing default controls');
  }
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

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    number,
 *    function(number): number
 * >}
 */
export const getLoadedBuildingsCount = createSelector(
  [getBuildingsTimestamp],
  (buildingsTimestamp) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('calculate buildings count');
    }

    if (buildingsTimestamp === null) {
      return 0;
    }
    return getBuildingStore().getFeatures().length;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    void,
 *    function(number, boolean, string): void
 * >}
 */
export const updateClusteredFeatures = createSelector(
  [getLoadedBuildingsCount, getRequiredLabels, getTarget],
  (buildingsCount, requiredLabels, target) => {
    if (requiredLabels === false) {
      return;
    }
    const map = CREATED_MAPS[target];
    munimap_view_cluster.updateClusteredFeatures(
      map,
      map.getView().getResolution(),
      requiredLabels
    );
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    string,
 *    function(FloorOptions): string
 * >}
 */
export const getSelectedFloorCode = createSelector(
  [getSelectedFloor],
  (selectedFloor) => {
    return selectedFloor.locationCode || null;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    number,
 *    function(FloorOptions): number
 * >}
 */
export const getSelectedFloorLayerId = createSelector(
  [getSelectedFloor],
  (selectedFloor) => {
    return selectedFloor.floorLayerId || null;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    Array<string>,
 *    function(number): Array<string>
 * >}
 */
export const getActiveFloorCodes = createSelector(
  [getSelectedFloorLayerId],
  (selectedFloorLayerId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing active floors');
    }
    if (!selectedFloorLayerId) {
      return [];
    }

    let codes = [];
    const floors = getFloorStore().getFeatures();
    const active = floors.filter((floor) => {
      const layerId = /**@type {number}*/ (floor.get('vrstvaId'));
      if (layerId === selectedFloorLayerId) {
        return true;
      }
      return false;
    });
    codes = active.map((floor) => {
      return /**@type {string}*/ (floor.get('polohKod'));
    });
    return codes;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean,
 *    function(number): boolean
 * >}
 */
export const isIndoorResolution = createSelector(
  [getResolution],
  (resolution) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether is indoor resolution');
    }
    return (
      munimap_utils.isDef(resolution) &&
      munimap_range.contains(
        munimap_floor.RESOLUTION,
        /**@type {number}*/ (resolution)
      )
    );
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(boolean, string): StyleFunction
 * >}
 */
export const getStyleForBuildingLayer = createSelector(
  [isIndoorResolution, getSelectedFloorCode],
  (showIndoor, selectedFloorCode) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for building');
    }

    const selectedFloor = showIndoor ? selectedFloorCode : null;
    const styleFce = (feature, res) => {
      const showSelected =
        showIndoor && munimap_floor.selectedFloorFilter(feature, selectedFloor);
      const style = styleFunction(feature, res, showSelected);
      return style;
    };

    return styleFce;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    ol.Extent,
 *    function(number, ol.Coordinate, number, ol.Size): ol.Extent
 * >}
 */
export const getExtent = createSelector(
  [getResolution, getCenter, getRotation, getSize],
  (resolution, center, rotation, size) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing extent');
    }

    if (!size) {
      return;
    }
    return ol_extent.getForViewAndSize(center, resolution, rotation, size);
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(ol.Extent, string, boolean): StyleFunction
 * >}
 */
export const getBuildingLabelFunction = createSelector(
  [getExtent, getLang, getRequiredLabels],
  (extent, lang, requiredLabels) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing building label function');
    }
    return munimap_utils.partial(labelFunction, {lang, requiredLabels, extent});
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(boolean, string, StyleFunction): StyleFunction
 * >}
 */
export const getStyleForBuildingLabelLayer = createSelector(
  [isIndoorResolution, getSelectedFloorCode, getBuildingLabelFunction],
  (showIndoor, selectedFloorCode, buildingLabelFunction) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for building label');
    }
    const selectedFloor = showIndoor ? selectedFloorCode : null;
    const styleFce = (feature, res) => {
      const showSelected =
        showIndoor && munimap_floor.selectedFloorFilter(feature, selectedFloor);
      if (showSelected) {
        return null;
      } else {
        const style = buildingLabelFunction(feature, res);
        return style;
      }
    };

    return styleFce;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(string): StyleFunction
 * >}
 */
export const getStyleForComplexLayer = createSelector([getLang], (lang) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('STYLE - computing style for complexes');
  }

  //asi nemusi byt selector, protoze se bere z funkce
  const markers = getMarkerStore().getFeatures();
  const styleFce = (feature, res) => {
    const style = complexStyleFunction(feature, res, markers, lang);
    return style;
  };

  return styleFce;
});

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    ol.Extent,
 *    function(ol.Extent): ol.Extent
 * >}
 */
export const getReferenceExtent = createSelector([getExtent], (extent) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing reference extent');
  }
  return ol_extent.buffer(extent, getBufferValue(extent));
});

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean,
 *    function(ol.Extent, string): boolean
 * >}
 */
export const isSelectedInExtent = createSelector(
  [getReferenceExtent, getSelectedBuilding],
  (refExtent, selectedBuilding) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether selected building in extent');
    }
    if (munimap_utils.isDefAndNotNull(selectedBuilding)) {
      munimap_assert.assertString(selectedBuilding);
      const building = getBuildingByCode(
        /**@type {string}*/ (/**@type {unknown}*/ (selectedBuilding))
      );
      const geom = building.getGeometry();
      return geom.intersectsExtent(refExtent);
    }
    return false;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    boolean,
 *    function(number): boolean
 * >}
 */
const isInFloorResolutionRange = createSelector(
  [getResolution],
  (resolution) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether is resolution in floor resolution. range');
    }
    return munimap_range.contains(munimap_floor.RESOLUTION, resolution);
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    ol.Feature,
 *    function(ol.Extent): ol.Feature
 * >}
 */
const getFeatureForChangingFloor = createSelector(
  [getReferenceExtent],
  (refExt) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing feature for changing floor');
    }
    let marker = null; //munimap.getProps(map).selectedMarker;
    if (!marker) {
      const markers = getMarkerStore().getFeatures();
      marker = markers.find((f) => {
        return f.getGeometry()
          ? f.getGeometry().intersectsExtent(refExt)
          : null;
      });
    }
    if (marker) {
      return marker;
    } else {
      let selectFeature;
      let maxArea;
      const format = new GeoJSON();
      const buildingStore = getBuildingStore();
      buildingStore.forEachFeatureIntersectingExtent(refExt, (building) => {
        if (hasInnerGeometry(building)) {
          const intersect = featureExtentIntersect(building, refExt, format);
          const geom = intersect.getGeometry();
          if (geom instanceof Polygon || geom instanceof MultiPolygon) {
            const area = geom.getArea();
            if (!munimap_utils.isDef(maxArea) || area > maxArea) {
              maxArea = area;
              selectFeature = building;
            }
          }
        }
      });
      return selectFeature || null;
    }
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    (ol.Feature|undefined),
 *    function(ol.Size, string, ol.Feature, boolean, boolean):
 *      (ol.Feature|undefined)
 * >}
 */
export const getFeatureForRefreshingSelected = createSelector(
  [
    getSize,
    getSelectedBuilding,
    getFeatureForChangingFloor,
    isInFloorResolutionRange,
    isSelectedInExtent,
  ],
  (
    size,
    selectedBuilding,
    featureForChangingFloor,
    inFloorResolutionRange,
    selectedInExtent
  ) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing feature for refreshing selected');
    }
    if (!size) {
      return;
    }

    if (!selectedBuilding || !selectedInExtent) {
      return inFloorResolutionRange ? featureForChangingFloor : null;
    } else {
      // munimap.info.refreshElementPosition(map);
      return;
    }
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(string, string, ol.Extent, boolean, boolean, string):
 *      StyleFunction
 * >}
 */
export const getStyleForMarkerLayer = createSelector(
  [
    getLang,
    getRequiredMarkerLabelId,
    getExtent,
    getRequiredLocationCodes,
    isInFloorResolutionRange,
    getSelectedBuilding,
  ],
  (
    lang,
    requiredMarkerLabelId,
    extent,
    locationCodes,
    inFloorResolutionRange,
    selectedBuilding
  ) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for markers');
    }

    const options = {
      markers: getMarkerStore().getFeatures(),
      markerLabel: REQUIRED_MARKER_LABEL[requiredMarkerLabelId],
      lang,
      extent,
      locationCodes,
    };
    const styleFce = (feature, res) => {
      if (
        inFloorResolutionRange &&
        isBuilding(feature) &&
        isSelected(feature, selectedBuilding)
      ) {
        return null;
      }
      const style = markerStyleFunction(feature, res, options);
      return style;
    };

    return styleFce;
  }
);

/**
 * @type {Reselect.OutputSelector<
 *    State,
 *    StyleFunction,
 *    function(string, boolean, string, boolean):
 *      StyleFunction
 * >}
 */
export const getStyleForClusterLayer = createSelector(
  [
    getLang,
    getRequiredLocationCodes,
    getRequiredMarkerLabelId,
    getRequiredClusterFacultyAbbr,
  ],
  (lang, locationCodes, requiredMarkerLabelId, clusterFacultyAbbr) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('STYLE - computing style for clusters');
    }

    const options = {
      lang,
      locationCodes,
      markerLabel: REQUIRED_MARKER_LABEL[requiredMarkerLabelId],
      clusterFacultyAbbr,
    };
    const styleFce = (feature, res) => {
      const style = clusterStyleFunction(feature, res, options);
      return style;
    };

    return styleFce;
  }
);
