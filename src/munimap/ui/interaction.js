/**
 * @module ui/interaction
 */
import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';

/**
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("../view/view.js").ErrorMessageOptions} ErrorMessageOptions
 */

/**
 * @typedef {Object} InvalidCodeOptions
 * @property {Array<string>} invalidCodes invalid codes
 * @property {string} lang language
 * @property {ol.Map} map map
 */

/**
 * @param {HTMLDivElement} munimapEl munimapEl
 * @return {string} id
 */
const getId = (munimapEl) => {
  return `munimap-error_${munimapEl.parentElement.id.toString()}`;
};

/**
 * @param {HTMLDivElement} munimapEl target element
 * @return {HTMLDivElement} error element
 */
const getErrorEl = (munimapEl) => {
  return /** @type {HTMLDivElement}*/ (
    document.getElementById(getId(munimapEl))
  );
};

/**
 * @param {HTMLDivElement} munimapEl target element (e.g. munimapEl)
 * @return {HTMLDivElement} error element
 */
const createErrorEl = (munimapEl) => {
  const errEl = document.createElement('div');
  errEl.id = getId(munimapEl);
  errEl.className = 'munimap-error';
  return errEl;
};

/**
 * @param {HTMLDivElement} munimapEl target element (e.g. munimapEl)
 */
const removeErrorEl = (munimapEl) => {
  const errEl = getErrorEl(munimapEl);
  if (errEl) {
    errEl.remove();
  }
};

const getErrorMessageStyle = (errEl) => {
  const dpr = window.devicePixelRatio || 1;
  let size;
  let lineHeight;
  if (errEl.offsetWidth < 500) {
    size = 22 * dpr;
    lineHeight = 26 * dpr;
  } else {
    size = 30 * dpr;
    lineHeight = 35 * dpr;
  }
  return {size, lineHeight};
};

/**
 * @param {Array<string>} invalidCodes invalid codes
 * @param {boolean} simpleScroll simple scroll
 * @param {string} lang language
 * @return {string|undefined} message
 */
const createInnerText = (invalidCodes, simpleScroll, lang) => {
  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;
  let msg;
  if (hasInvalidCodes) {
    msg =
      munimap_lang.getMsg(munimap_lang.Translations.ACTIVATE_MAP, lang) +
      '\n' +
      munimap_lang.getMsg(munimap_lang.Translations.NOT_FOUND, lang) +
      ':\n' +
      invalidCodes.join(', ');
  } else if (shouldBlockMap) {
    msg = munimap_lang.getMsg(munimap_lang.Translations.ACTIVATE_MAP, lang);
  }
  return msg;
};

/**
 * @param {ErrorMessageOptions} options options
 */
const addEmptyErrorEl = (options) => {
  const {munimapEl, simpleScroll, invalidCodes, store} = options;
  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;
  let errEl = getErrorEl(munimapEl);

  if (errEl !== null) {
    return;
  }

  errEl = createErrorEl(munimapEl);
  munimapEl.setAttribute('tabindex', '0');
  munimapEl.appendChild(errEl);

  errEl.addEventListener(
    'click',
    (e) => {
      munimapEl.focus();
      store.dispatch(
        actions.target_focused({render: false, withMessage: false})
      );
    },
    false
  );
  munimapEl.addEventListener('blur', () => {
    munimapEl.blur();
    store.dispatch(
      actions.target_blurred({
        render: hasInvalidCodes && !shouldBlockMap ? false : true,
        withMessage: false,
      })
    );
  });

  if (shouldBlockMap) {
    munimapEl.addEventListener('wheel', () =>
      store.dispatch(
        actions.target_wheeled({
          render: document.activeElement === munimapEl ? false : true,
          withMessage: true,
        })
      )
    );
    munimapEl.addEventListener('touchmove', () =>
      store.dispatch(
        actions.target_touchmoved({
          render: document.activeElement === munimapEl ? false : true,
          withMessage: true,
        })
      )
    );
  }
};

/**
 * @param {ErrorMessageOptions} options options
 */
const prependMessageToErrorEl = (options) => {
  const {invalidCodes, simpleScroll, infoEl, lang, munimapEl} = options;
  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;

  const errEl = getErrorEl(munimapEl);
  if (errEl === null || errEl.children.length > 0) {
    return;
  }

  const msg = createInnerText(invalidCodes, simpleScroll, lang);
  if (msg) {
    if (hasInvalidCodes) {
      infoEl.classList.add('munimap-info-hide');
    }
    const msgEl = document.createElement('div');
    const {size, lineHeight} = getErrorMessageStyle(errEl);
    msgEl.innerText = msg;
    msgEl.style.lineHeight = `${lineHeight}px`;
    msgEl.style.fontSize = `${size}px`;
    errEl.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    errEl.appendChild(msgEl);
  }
};

export {addEmptyErrorEl, prependMessageToErrorEl, removeErrorEl};
