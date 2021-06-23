/**
 * @module ui/interaction
 */
import * as munimap_lang from '../lang/lang.js';

/**
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 */

/**
 * @typedef {Object} InvalidCodeOptions
 * @property {Array<string>} invalidCodes
 * @property {string} lang
 * @property {ol.Map} map
 */

/**
 * @param {HTMLCanvasElement|null} canvas canvas
 * @param {string} message msg
 * @param {string} lang language abbr
 */
const createCanvas = (canvas, message, lang) => {
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  let lineHeight;
  let size;
  if (canvas.offsetWidth < 500) {
    size = 22 * dpr;
    ctx.font = size + 'px Arial';
    lineHeight = 26 * dpr;
  } else {
    size = 30 * dpr;
    ctx.font = size + 'px Arial';
    lineHeight = 35 * dpr;
  }

  const text = munimap_lang.getMsg(message, lang);
  const lines = text.split('\n');
  lines.forEach((el, i) => {
    ctx.fillText(el, canvas.width / 2, canvas.height / 2 + i * lineHeight);
  });
};

/**
 * @param {Element} target target element (e.g. munimapEl)
 * @return {Element} drag element
 */
const createDragEl = (target) => {
  const dragEl = document.createElement('div');
  dragEl.id = `munimap-error_${target.parentElement.id.toString()}`;
  dragEl.className = 'munimap-error';
  target.appendChild(dragEl);
  return dragEl;
};

/**
 * @param {Element} target target element (e.g. munimapEl)
 * @param {Element} infoEl info element
 * @param {InvalidCodeOptions} options opts
 * @return {function} createError function
 */
const initInvalidCodesInfo = (target, infoEl, options) => {
  const {map, invalidCodes, lang} = options;
  target.setAttribute('tabindex', '0');

  window.document.addEventListener('blur', activeChange, true);
  window.document.addEventListener('focus', activeChange, true);

  createDragEl(target);
  infoEl.classList.add('munimap-info-hide');

  function activeChange(e) {
    const dragEl = document.getElementById(
      `munimap-error_${target.parentElement.id.toString()}`
    );
    const infoEl = target.getElementsByClassName('ol-popup munimap-info')[0];
    if (target.contains(window.document.activeElement)) {
      //user clicked on map (focus map div)
      if (dragEl) {
        dragEl.remove();
        infoEl.classList.remove('munimap-info-hide');
        map.render(); //remove error message from canvas
      }
    } else if (
      !target.contains(window.document.activeElement) &&
      dragEl === null
    ) {
      //message from canvas is removed and user blur map div
      createDragEl(target);
    } else {
      dragEl.remove();
      infoEl.classList.remove('munimap-info-hide');
      createDragEl(target);
    }
  }

  function createError() {
    const canvas = /**@type {HTMLCanvasElement}*/ (target.getElementsByTagName(
      'CANVAS'
    )[0]);
    const dragEl = document.getElementById(
      `munimap-error_${target.parentElement.id.toString()}`
    );

    if (dragEl === null || canvas === undefined) {
      return;
    }
    createCanvas(
      canvas,
      munimap_lang.getMsg(munimap_lang.Translations.ACTIVATE_MAP, lang) +
        '\n' +
        munimap_lang.getMsg(munimap_lang.Translations.NOT_FOUND, lang) +
        ':\n' +
        invalidCodes.join(', '),
      lang
    );
  }

  return createError;
};

export {initInvalidCodesInfo};
