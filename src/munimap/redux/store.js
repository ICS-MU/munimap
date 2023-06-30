import * as redux from 'redux';
import {asyncDispatchMiddleware} from './middleware.js';
import {createReducer} from './reducer/reducer.js';

/**
 * @typedef {import("../conf.js").State} State
 */

/**
 * @param {State} initialState initial state
 * @return {redux.Store} store
 */
const createStore = (initialState) => {
  const reducer = createReducer(initialState);
  const w = /** @type any */ (window);

  const enableDevtools = !PRODUCTION || APP_PATH.includes('testing');
  const reduxToolsExt =
    w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__();

  let enhancer;
  if (reduxToolsExt && enableDevtools) {
    enhancer = redux.compose(
      redux.applyMiddleware(asyncDispatchMiddleware),
      w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__()
    );
  } else {
    enhancer = redux.applyMiddleware(asyncDispatchMiddleware);
  }

  const store = redux.createStore(reducer, initialState, enhancer);
  return store;
};

export {createStore};
