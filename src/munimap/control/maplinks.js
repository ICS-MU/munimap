/**
 *
 * @module maplinks
 */
import * as munimap_lang from '../lang/lang.js';
import * as munimap_matomo from '../matomo/matomo.js';
import Control from 'ol/control/Control';
import {get as getProjection, transform} from 'ol/proj';

/**
 * @type {string}
 * @const
 */
const SEZNAM_IMG_PATH = '/img/seznam.png';

/**
 * @type {string}
 * @const
 */
const GOOGLE_IMG_PATH = '/img/google.png';

/**
 * @param {string} path path
 * @param {ol.Map} map map
 * @param {Array.<string>|Array.<ol.Feature>|undefined} markers markers
 * @param {Array<string>} pointCoordinates coords
 */
const handleClick = (path, map, markers, pointCoordinates) => {
  const zoomLevel = map.getView().getZoom().toString();
  const center = transform(
    map.getView().getCenter() || null,
    getProjection('EPSG:3857'),
    getProjection('EPSG:4326')
  );
  const x = center[1].toString();
  const y = center[0].toString();
  if (path === SEZNAM_IMG_PATH) {
    munimap_matomo.sendEvent('mapLinks', 'mapy.cz');
    if (markers.length === 1) {
      window.open(
        `https://mapy.cz/zakladni?x=${y}&y=${x}&z=${zoomLevel}&source=coor&` +
          `id=${pointCoordinates[1]}%2C${pointCoordinates[0]}`
      );
    } else {
      window.open(`https://mapy.cz/zakladni?x=${zoomLevel}&y=${x}&z=${y}`);
    }
  } else {
    munimap_matomo.sendEvent('mapLinks', 'maps.google.com');
    if (markers.length === 1) {
      window.open(
        `http://www.google.com/maps/place/${pointCoordinates[0]},` +
          `${pointCoordinates[1]}/@${x},${y},${zoomLevel}z`
      );
    } else {
      window.open(`http://www.google.com/maps/@${x},${y},${zoomLevel}z`);
    }
  }
};

/**
 * @param {string} path path
 * @param {ol.Map} map map
 * @param {Array.<string>|Array.<ol.Feature>|undefined} markers markers
 * @param {string} lang language
 * @return {Element} element
 */
const createItemElement = (path, map, markers, lang) => {
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
    handleClick(path, map, markers, pointCoordinates);
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
 * @param {Array.<string>|Array.<ol.Feature>|undefined} markers markers
 * @param {string} lang language
 * @return {Control} control
 */
export default (map, markers, lang) => {
  const main = document.createElement('div');
  main.className += ' munimap-link';
  main.appendChild(createItemElement(SEZNAM_IMG_PATH, map, markers, lang));
  main.appendChild(createItemElement(GOOGLE_IMG_PATH, map, markers, lang));
  const result = new Control({
    element: main,
  });
  return result;
};
