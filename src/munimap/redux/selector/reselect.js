import {createSelector as createReselectSelector} from 'reselect';

// Create selector with memoize options.
export const createSelector = (selectors, fn) => {
  const slctr = createReselectSelector(...selectors, fn, {
    memoizeOptions: {
      maxSize: 2,
    },
  });
  return slctr;
};
