/**
 * @module redux/middleware
 */

/**
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("redux").Middleware} redux.Middleware
 * @typedef {import("redux").MiddlewareAPI} redux.MiddlewareAPI
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("redux").AnyAction} redux.AnyAction
 */

/**
 * This middleware will just add the property "async dispatch" to all actions
 * @type {redux.Middleware}
 * @param {redux.Store} store store
 * @return {function(redux.Dispatch): (function(any): any)} middleware function
 */
export const asyncDispatchMiddleware = (store) => {
  return (next) => {
    return (action) => {
      let syncActivityFinished = false;
      let actionQueue = [];

      function flushQueue() {
        actionQueue.forEach((a) => store.dispatch(a)); // flush queue
        actionQueue = [];
      }

      function asyncDispatch(asyncAction) {
        actionQueue = actionQueue.concat([asyncAction]);

        if (syncActivityFinished) {
          flushQueue();
        }
      }

      const actionWithAsyncDispatch = Object.assign({}, action, {
        asyncDispatch,
      });
      const res = next(actionWithAsyncDispatch);

      syncActivityFinished = true;
      flushQueue();

      return res;
    };
  };
};
