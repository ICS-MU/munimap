/**
 * @module view/floor
 */

import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import {getFloorObject} from '../feature/floor.js';
import {loadFloors} from '../load.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("redux").AnyAction} redux.AnyAction
 */

/**
 * @typedef {Object} ChangeSelectedFloorOptions
 * @property {string} buildingCode
 * @property {string} floorCode
 * @property {Array<string>} activeFloors
 */

/**
 * @type {VectorSource}
 */
let FLOOR_STORE;

/**
 * Create store for complexes.
 * @return {VectorSource} store
 */
const createStore = () => {
  FLOOR_STORE = new VectorSource();
  return FLOOR_STORE;
};

/**
 * Get building store.
 * @return {VectorSource} store
 */
const getStore = () => {
  return FLOOR_STORE;
};

/**
 * @param {ChangeSelectedFloorOptions} options options
 * @param {function(redux.AnyAction): void} asyncDispatch asynchronous dispatch
 */
const changeSelected = (options, asyncDispatch) => {
  const {buildingCode, floorCode, activeFloors} = options;

  if (!buildingCode) {
    return;
  }

  let selectedFloor;
  const where = `polohKod LIKE '${buildingCode}%'`;
  let newSelectedFloor;
  loadFloors(where).then((floors) => {
    newSelectedFloor = floors.find((floor) => {
      return floorCode === /**@type {string}*/ (floor.get('polohKod'));
    });
    munimap_assert.assertInstanceof(newSelectedFloor, Feature);
    const newSelectedWasActive = activeFloors.some(
      (code) => code === floorCode
    );
    selectedFloor = getFloorObject(newSelectedFloor);
    //munimap.info.refreshFloorSelect(map, floors);
    if (newSelectedWasActive) {
      //munimap.style.refreshAllFromFragments(map); //asi je už v create - provádí se refreshStyles
      asyncDispatch(actions.set_selected_floor(selectedFloor));
    } else {
      const where = 'vrstvaId = ' + selectedFloor.floorLayerId;
      loadFloors(where).then((floors) => {
        if (floors) {
          //munimap.floor.refreshFloorBasedLayers(map);
        }
        asyncDispatch(actions.set_selected_floor(selectedFloor));
      });
    }
  });
};

export {changeSelected, createStore, getStore};
