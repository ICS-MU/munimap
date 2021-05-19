import {createSelector} from 'reselect';
import {getStore, getType} from './building.js';

const getRequiredLoadingMessage = (state) => state.requiredOpts.loadingMessage;
const getMarkersTimestamp = (state) => state.markersTimestamp;
const getRequiredMarkers = (state) => state.requiredOpts.markers;
const getRequiredZoomTos = (state) => state.requiredOpts.zoomTo;

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
