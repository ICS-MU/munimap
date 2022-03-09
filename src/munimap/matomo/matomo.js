/**
 * @module matomo/matomo
 */

/**
 * @typedef {Object} Options
 * @property {boolean} [mapLinks] maplinks
 * @property {boolean} [pubTran] pubtran
 * @property {string} [baseMap] basemap
 * @property {Array<string>} [identifyTypes] identify types
 * @property {Function} [identifyCallback] identify callback
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

  //eslint-disable-next-line no-console
  PRODUCTION ? fetch(encodeURI(matomo)) : console.log(matomo);
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

  //eslint-disable-next-line no-console
  PRODUCTION ? fetch(encodeURI(matomo)) : console.log(matomo);
};

/**
 * @param {boolean} hasCustom has custom marker
 */
export const sendEventForCustomMarker = (hasCustom) => {
  if (hasCustom) {
    sendEvent('customMarker', 'true');
  }
};

/**
 * @param {Options} options opts
 */
export const sendEventForOptions = (options) => {
  if (String(options.mapLinks) !== 'undefined') {
    sendEvent('mapLinks', String(options.mapLinks));
  }
  if (String(options.pubTran) !== 'undefined') {
    sendEvent('pubTran', String(options.pubTran));
  }
  if (String(options.baseMap) !== 'undefined') {
    sendEvent('baseMap', String(options.baseMap));
  }
  if (String(options.identifyTypes) !== 'undefined') {
    sendEvent('identifyTypes', 'true');
  }
  if (String(options.identifyCallback) !== 'undefined') {
    sendEvent('identifyCallback', 'true');
  }
};
