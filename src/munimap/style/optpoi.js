/**
 * @module style/optpoi
 */

import * as mm_lang from '../lang/lang.js';
import {getFeatures} from '../cluster/cluster.js';

/**
 * @typedef {import("../feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 */

/**
 * @param {string} ctgId category id
 * @param {Array<string>} roomCodes room location codes
 * @param {string} lang language
 * @return {MarkerLabelFunction} label
 */
const markerLabel = (ctgId, roomCodes, lang) => (feature, resolution) => {
  let clustered = getFeatures(feature);
  if (!clustered.length) {
    clustered = [/**@type {ol.Feature}*/ (feature)];
  }
  clustered = clustered.filter((f) => roomCodes.includes(f.get('polohKod')));

  const fieldName = mm_lang.getMsg(mm_lang.Translations.LABEL_FIELD_NAME, lang);
  let ctgLabel = feature.get(fieldName);
  let label;
  let clusteredNumber;
  if (clustered.length === 1) {
    clusteredNumber = clustered[0].get('numberOfDetails');
    label =
      clusteredNumber > 1
        ? `${clusteredNumber}x ${mm_lang.getMsg(ctgId, lang)}`
        : ctgLabel;
  } else if (clustered.length > 1) {
    ctgLabel = mm_lang.getMsg(ctgId, lang);
    if (ctgLabel === ' ') {
      ctgLabel = '';
    }

    let count = clustered.length;
    clustered.forEach((el) => {
      const detailsCount = el.get('numberOfDetails');
      if (detailsCount && detailsCount > 1) {
        count += detailsCount - 1;
      }
    });
    label = `${count}x ${ctgLabel}`;
  }
  return label;
};

export {markerLabel};
