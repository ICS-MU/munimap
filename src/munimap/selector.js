import * as munimap_utils from './utils.js';
import {createSelector} from 'reselect';
import {createTileLayer} from './create.js';
import {getPairedBasemap, isArcGISBasemap} from './basemap.js';
import {getStore, getType} from './building.js';

const getRequiredLoadingMessage = (state) => state.requiredOpts.loadingMessage;
const getMarkersTimestamp = (state) => state.markersTimestamp;
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
  (initMarkers) => {
    console.log('computing init markers');
    if (initMarkers.length === 0) {
      return [];
    }
    const type = getType();
    const buildings = getStore().getFeatures();
    return initMarkers.map((initMarker) => {
      return buildings.find((building) => {
        return building.get(type.primaryKey) === initMarker;
      });
    });
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

export const getBasemapLayer = createSelector(
  [getCenter, getResolution, getRequiredBaseMap, getLang],
  (center, resolution, requiredBasemap, lang) => {
    console.log('computing bm');
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
    const id =
      !isSafeLatLon && !isSafeResolution && isArcGISBasemap(requiredBasemap)
        ? getPairedBasemap(requiredBasemap)
        : requiredBasemap;

    return createTileLayer(id, lang);
  }
);
