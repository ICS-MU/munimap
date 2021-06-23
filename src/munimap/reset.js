/* eslint-disable no-console */

/**
 * @module reset
 */

import * as munimap_matomo from './matomo/matomo.js';

/**
 * @param {Object} opts Options
 */
export default (opts) => {
  console.log('munimap.reset', opts);
  munimap_matomo.sendEvent('map', 'reset');
};
