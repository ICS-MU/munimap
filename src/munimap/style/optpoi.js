/**
 * @module style/optpoi
 */

import * as munimap_lang from '../lang/lang.js';
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

  const fieldName = munimap_lang.getMsg(
    munimap_lang.Translations.LABEL_FIELD_NAME,
    lang
  );
  let ctgLabel = feature.get(fieldName);
  let label;
  let clusteredNumber;
  if (clustered.length === 1) {
    clusteredNumber = clustered[0].get('numberOfDetails');
    if (clusteredNumber > 1) {
      ctgLabel = munimap_lang.getMsg(ctgId, lang);

      label = clusteredNumber + 'x ' + ctgLabel;
    } else {
      label = ctgLabel;
    }
  } else if (clustered.length > 1) {
    ctgLabel = munimap_lang.getMsg(ctgId, lang);
    if (ctgLabel === ' ') {
      ctgLabel = '';
    }
    const sameValueArray = [];
    clustered.forEach((el) =>
      sameValueArray.push({
        name: el.get(munimap_lang.getMsg(fieldName, lang)),
        building: el.get('polohKod').substr(0, 5),
      })
    );
    clustered.forEach((el) => {
      for (let i = 1; i < el.get('numberOfDetails'); i++) {
        sameValueArray.push('anotherDetailInsideOneFeature');
      }
    });

    clusteredNumber = sameValueArray.length;
    label = clusteredNumber + 'x ' + ctgLabel;
  }
  return label;
};

export {markerLabel};
