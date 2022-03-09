/**
 * @module feature/pubtranstop
 */

import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';
import {IDOS_URL} from '../conf.js';

/**
 * @typedef {import("../utils/range.js").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("../load.js").FeaturesForMapOptions} featuresForMapOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @param {IsClickableOptions} options opts
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => true;

/**
 * @param {redux.Dispatch} dispatch dispatch
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (dispatch, options) => {
  dispatch(actions.pubtranClicked(options));
};

/**
 * @param {string} title title
 * @param {string} lang language
 * @return {string} HTML string
 */
const getDetailHtml = (title, lang) => {
  const main = `<div class="munimap-title">${title}</div>`;

  const toMsg = munimap_lang.getMsg(
    munimap_lang.Translations.CONNECTION_TO,
    lang
  );
  const fromMsg = munimap_lang.getMsg(
    munimap_lang.Translations.CONNECTION_FROM,
    lang
  );
  const linkToHtml = `<a href="${encodeURI(
    IDOS_URL + '?t=' + title
  )}" target="_blank">${toMsg}</a>`;
  const linkFromHtml = `<a href="${encodeURI(
    IDOS_URL + '?f=' + title
  )}" target="_blank">${fromMsg}</a>`;

  const subtitle = munimap_lang.getMsg(
    munimap_lang.Translations.FIND_CONNECTION,
    lang
  );

  const content = `<div>${subtitle}: ${linkToHtml} / ${linkFromHtml}</div>`;
  return `${main}${content}`;
};

export {isClickable, featureClickHandler, getDetailHtml};
