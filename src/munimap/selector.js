import * as munimap_utils from './utils.js';
import {createSelector} from 'reselect';
import {createTileLayer} from './view.js';
import {getPairedBasemap, isArcGISBasemap} from './basemap.js';
import {getStore, getType} from './building.js';

const getRequiredLoadingMessage = (state) => state.requiredOpts.loadingMessage;
const getMarkersTimestamp = (state) => state.markersTimestamp;
const getZoomTosTimestamp = (state) => state.zoomToTimestamp;
const getRequiredMarkers = (state) => state.requiredOpts.markers;
const getRequiredZoomTos = (state) => state.requiredOpts.zoomTo;
const getRequiredBaseMap = (state) => state.requiredOpts.baseMap;
const getLang = (state) => state.requiredOpts.lang;
const getCenter = (state) => state.center;
const getResolution = (state) => state.resolution;

export const toggleLoadingMessage = createSelector(
  [getRequiredLoadingMessage, getMarkersTimestamp],
  (requireLoadingMessage, timestamp) => {
    console.log('computing loading message');
    if (!requireLoadingMessage) {
      return null;
    } else {
      if (timestamp) {
        return false;
      } else {
        return true;
      }
    }
  }
);

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

export const getInitZoomTos = createSelector(
  [getRequiredZoomTos],
  (initZoomTos) => {
    console.log('computing init zoomTos');
    if (initZoomTos.length === 0) {
      return [];
    }
    const type = getType();
    const buildings = getStore().getFeatures();
    return initZoomTos.map((initZoomTo) => {
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
