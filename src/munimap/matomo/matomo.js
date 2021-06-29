/**
 * @module matomo/matomo
 */

import {isCustom as isCustomMarker} from '../feature/marker.custom.js';

/**
 * @typedef {import("../create.js").Options} CreateOptions
 */

/**
 * @public
 */
export const init = () => {
  const matomo =
    'https://analytics.dis.ics.muni.cz/piwik/piwik.php?idsite=4' +
    '&rec=1&action_name=library / loaded&url=' +
    window.location.href +
    '&rand=' +
    String(Math.random()).slice(2, 8) +
    '&urlref=' +
    window.document.referrer +
    '&res=' +
    String(window.screen.width) +
    'x' +
    String(window.screen.height) +
    '&send_image=0';
  //fetch(encodeURI(matomo));
};

/**
 * @param {string} category category
 * @param {string} action action
 */
export const sendEvent = (category, action) => {
  const matomo =
    'https://analytics.dis.ics.muni.cz/piwik/piwik.php?idsite=4' +
    '&rec=1&action_name=' +
    category +
    ' / ' +
    action +
    '&url=' +
    window.location.href +
    '&rand=' +
    String(Math.random()).slice(2, 8) +
    '&urlref=' +
    window.document.referrer +
    '&res=' +
    String(window.screen.width) +
    'x' +
    String(window.screen.height) +
    '&e_c=' +
    category +
    '&e_a=' +
    action +
    '&send_image=0';
  //fetch(encodeURI(matomo));
};

/**
 * @param {Array} markers markers
 */
export const checkCustomMarker = (markers) => {
  if (markers.length && markers.some((el) => isCustomMarker(el))) {
    sendEvent('customMarker', 'true');
  }
};

/**
 * @param {CreateOptions} options opts
 */
export const sendEventForOptions = (options) => {
  if (String(options.mapLinks) !== 'undefined') {
    console.log('send_maplinks');
    sendEvent('mapLinks', String(options.mapLinks));
  }
  if (String(options.pubTran) !== 'undefined') {
    sendEvent('pubTran', String(options.pubTran));
  }
  if (String(options.baseMap) !== 'undefined') {
    console.log('send_basemap');
    sendEvent('baseMap', String(options.baseMap));
  }

  // if (String(options.identifyTypes) !== 'undefined') {
  //   sendEvent('identifyTypes', 'true');
  // }
  // if (String(options.identifyCallback) !== 'undefined') {
  //   sendEvent('identifyCallback', 'true');
  // }
};
