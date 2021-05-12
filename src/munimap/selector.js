import {createSelector} from 'reselect';
import {getStore, getType} from './building.js';

const get_zoomTos_s = (state) => state.zoomTos;

export const get_zoomToFeatures = createSelector(
  [get_zoomTos_s],
  (zoomToStrings) => {
    console.log('computing get_zoomToFeatures');
    const type = getType();
    const buildings = getStore().getFeatures();
    return zoomToStrings.map((zoomToString) => {
      return buildings.find((building) => {
        return building.get(type.primaryKey) === zoomToString;
      });
    });
  }
);
