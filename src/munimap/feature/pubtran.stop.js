/**
 * @module feature/pubtranstop
 */

import * as munimap_range from '../utils/range.js';
import {MUNIMAP_PUBTRAN_URL} from '../conf.js';

/**
 * @typedef {import("../utils/range.js").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("../load.js").FeaturesForMapOptions} featuresForMapOptions
 * @typedef {import("ol").Feature} ol.Feature
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
 * @param {FeatureClickHandlerOptions} options opts
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => true;

/**
 * @param {FeatureClickHandlerOptions} options opts
 */
const featureClickHandler = (options) => {
  console.error('not implemnted yet!');
  // var feature = options.feature;
  // var map = options.map;
  // var lang = map.get(munimap.PROPS_NAME).lang;
  // var title = /**@type {string}*/ (feature.get('nazev'));
  // var link = 'https://idos.idnes.cz/idsjmk/spojeni/?';
  // var linkToAttributes = {
  //   href: encodeURI(link + 't=' + title),
  //   target: '_blank'
  // };
  // var linkFromAttributes = {
  //   href: encodeURI(link + 'f=' + title),
  //   target: '_blank'
  // };

  // var main = goog.dom.createDom('div', 'munimap-title',
  //   goog.dom.createTextNode(title));
  // var linkToEl = goog.dom.createDom('a', linkToAttributes,
  //   goog.dom.createTextNode(
  //     munimap.lang.getMsg(munimap.lang.Translations.CONNECTION_TO, lang)));
  // var linkFromEl = goog.dom.createDom('a', linkFromAttributes,
  //   goog.dom.createTextNode(
  //     munimap.lang.getMsg(munimap.lang.Translations.CONNECTION_FROM, lang)));
  // var linkEl = goog.dom.createDom('div', null, goog.dom.createTextNode(
  //   munimap.lang.getMsg(munimap.lang.Translations.FIND_CONNECTION, lang)
  //   + ': '));

  // var mainText = goog.dom.getOuterHtml(main);
  // var linkToElText = goog.dom.getOuterHtml(linkToEl);
  // var linkFromElText = goog.dom.getOuterHtml(linkFromEl);
  // var linkElText = linkEl.innerHTML;
  // var detail = mainText + '<div>' + linkElText + linkToElText + ' / ' +
  //     linkFromElText + '</div>';
  // munimap.bubble.show(feature, map, detail, 0, 0,
  //   munimap.pubtran.stop.RESOLUTION, true);
};

export {
  RESOLUTION,
  CLUSTER_RESOLUTION,
  isClickable,
  featureClickHandler,
  getType,
};
