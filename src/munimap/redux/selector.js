/**
 * @module redux/selector
 */
import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import {createSelector} from 'reselect';
import {createTileLayer} from '../view.js';
import {getPairedBasemap, isArcGISBasemap} from '../layer/basemap.js';
import {getStore, getType} from '../feature/building.js';

const getRequiredLoadingMessage = (state) => state.requiredOpts.loadingMessage;
const getMarkersTimestamp = (state) => state.markersTimestamp;
const getZoomToTimestamp = (state) => state.zoomToTimestamp;
const getRequiredMarkers = (state) => state.requiredOpts.markers;
const getRequiredZoomTo = (state) => state.requiredOpts.zoomTo;
const getRequiredBaseMap = (state) => state.requiredOpts.baseMap;
const getLang = (state) => state.requiredOpts.lang;
const getCenter = (state) => state.center;
const getResolution = (state) => state.resolution;

export const getInitMarkers = createSelector(
  [getRequiredMarkers],
  (requiredMarkers) => {
    console.log('computing init markers');
    if (requiredMarkers.length === 0) {
      return [];
    }
    const type = getType();
    const buildings = getStore().getFeatures();
    const result = requiredMarkers.map((initMarker) => {
      return buildings.find((building) => {
        return building.get(type.primaryKey) === initMarker;
      });
    });
    return result.filter((item) => item); //remove undefined (= invalid codes)
  }
);

export const getInitZoomTo = createSelector(
  [getRequiredZoomTo],
  (initZoomTo) => {
    console.log('computing init zoomTo');
    if (initZoomTo.length === 0) {
      return [];
    } else if (munimap_utils.isString(initZoomTo)) {
      initZoomTo = [initZoomTo];
    }
    const type = getType();
    const buildings = getStore().getFeatures();
    return initZoomTo.map((initZoomTo) => {
      return buildings.find((building) => {
        return building.get(type.primaryKey) === initZoomTo;
      });
    });
  }
);

export const getBasemapLayerId = createSelector(
  [getCenter, getResolution, getRequiredBaseMap],
  (center, resolution, requiredBasemap) => {
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

export const getBasemapLayer = createSelector(
  [getBasemapLayerId, getLang],
  (basemapLayerId, lang) => {
    console.log('computing baseMapLayer');
    return createTileLayer(basemapLayerId, lang);
  }
);

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

    const difference = requiredMarkers.filter(
      (markerString) => !initMarkersCodes.includes(markerString)
    );
    return difference;
  }
);

export const loadMarkers = createSelector(
  [getRequiredMarkers, getMarkersTimestamp],
  (requiredMarkers, markersTimestamp) => {
    console.log('computing whether load markers');
    return requiredMarkers.length > 0 && markersTimestamp === null;
  }
);

export const loadZoomTo = createSelector(
  [getRequiredZoomTo, getZoomToTimestamp],
  (requiredZoomTo, zoomToTimestamp) => {
    console.log('computing whether load zoomto');
    return requiredZoomTo.length > 0 && zoomToTimestamp === null;
  }
);

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
