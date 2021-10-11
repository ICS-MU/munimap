/**
 *
 * @module control/maplinks
 */
import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';
import Control from 'ol/control/Control';
import {get as getProjection, transform} from 'ol/proj';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @type {string}
 * @const
 */
const SEZNAM_IMG_PATH = APP_PATH + 'img/seznam.png';

/**
 * @type {string}
 * @const
 */
const GOOGLE_IMG_PATH = APP_PATH + 'img/google.png';

/**
 * @param {string} path path
 * @param {ol.Map} map map
 * @param {redux.Store} store store
 * @param {Array<string>|undefined} markers markers
 * @param {Array<string>} pointCoordinates coords
 */
const handleClick = (path, map, store, markers, pointCoordinates) => {
  const zoomLevel = map.getView().getZoom().toString();
  const center = transform(
    map.getView().getCenter() || null,
    getProjection('EPSG:3857'),
    getProjection('EPSG:4326')
  );
  const x = center[1].toString();
  const y = center[0].toString();

  let matomoAction;
  if (path === SEZNAM_IMG_PATH) {
    matomoAction = 'mapy.cz';
    if (markers.length === 1) {
      window.open(
        `https://mapy.cz/zakladni?x=${y}&y=${x}&z=${zoomLevel}&source=coor&` +
          `id=${pointCoordinates[1]}%2C${pointCoordinates[0]}`
      );
    } else {
      window.open(`https://mapy.cz/zakladni?x=${zoomLevel}&y=${x}&z=${y}`);
    }
  } else {
    matomoAction = 'maps.google.com';
    if (markers.length === 1) {
      window.open(
        `http://www.google.com/maps/place/${pointCoordinates[0]},` +
          `${pointCoordinates[1]}/@${x},${y},${zoomLevel}z`
      );
    } else {
      window.open(`http://www.google.com/maps/@${x},${y},${zoomLevel}z`);
    }
  }
  store.dispatch(
    actions.log_action_happened({
      category: 'mapLinks',
      action: matomoAction,
    })
  );
};

/**
 * @param {string} path path
 * @param {ol.Map} map map
 * @param {redux.Store} store store
 * @param {Array<string>|undefined} markers markers
 * @param {string} lang language
 * @return {Element} element
 */
const createItemElement = (path, map, store, markers, lang) => {
  const pointCenter = transform(
    map.getView().getCenter() || null,
    getProjection('EPSG:3857'),
    getProjection('EPSG:4326')
  );
  const pointCoordinates = [
    pointCenter[1].toString(),
    pointCenter[0].toString(),
  ];

  const el = document.createElement('div');
  el.className += ' munimap-link-item';
  el.addEventListener('click', () => {
    handleClick(path, map, store, markers, pointCoordinates);
  });
  el.style.backgroundImage = 'url(' + path + ')';
  el.title =
    path === SEZNAM_IMG_PATH
      ? munimap_lang.getMsg(munimap_lang.Translations.SEZNAM_MAP, lang)
      : munimap_lang.getMsg(munimap_lang.Translations.GOOGLE_MAP, lang);
  return el;
};

/**
 * @param {ol.Map} map map
 * @param {redux.Store} store store
 * @param {Array<string>|undefined} markers markers
 * @param {string} lang language
 * @return {Control} control
 */
export default (map, store, markers, lang) => {
  const main = document.createElement('div');
  main.className += ' munimap-link';
  main.appendChild(
    createItemElement(SEZNAM_IMG_PATH, map, store, markers, lang)
  );
  main.appendChild(
    createItemElement(GOOGLE_IMG_PATH, map, store, markers, lang)
  );
  const result = new Control({
    element: main,
  });
  return result;
};
