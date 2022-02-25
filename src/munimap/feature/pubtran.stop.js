/**
 * @module feature/pubtranstop
 */

import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_range from '../utils/range.js';
import {IDOS_URL, MUNIMAP_PUBTRAN_URL} from '../conf.js';

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
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = munimap_range.createResolution(0, 2.39);

/**
 * @type {RangeInterface}
 * @const
 */
const CLUSTER_RESOLUTION = munimap_range.createResolution(0.6, 2.39);

/**
 *
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} Type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'OBJECTID',
      serviceUrl: MUNIMAP_PUBTRAN_URL,
      layerId: 0,
      name: 'publictransport',
    };
  }
  return TYPE;
};

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

export {
  RESOLUTION,
  CLUSTER_RESOLUTION,
  isClickable,
  featureClickHandler,
  getDetailHtml,
  getType,
};
