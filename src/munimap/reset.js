/* eslint-disable no-console */

import * as munimap_matomo from './matomo.js';

/**
 * @param {Object} opts Options
 */
export default (opts) => {
  console.log('munimap.reset', opts);
  munimap_matomo.sendEvent('map', 'reset');
};
