import * as actions from './action';
import * as redux from 'redux';

/**
 * @typedef {import("./conf.js").State} State
 */

/**
 *
 * @param {State} initialState
 */
const createReducer = (initialState) => {
  return (state = initialState, action) => {
    if (action.type === actions.OL_MAP_VIEW_CHANGE) {
      return {
        ...state,
        zoom: action.payload.view.zoom,
        center: action.payload.view.center,
        center_proj: action.payload.view.center_proj,
      };
    }
    return state;
  };
};

/**
 * @param {State} initialState
 */
export const createStore = (initialState) => {
  const reducer = createReducer(initialState);
  const w = /** @type any */(window);

  const store = redux.createStore(reducer, initialState,
      w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__());
  return store;
};
