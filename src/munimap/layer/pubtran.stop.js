/**
 * @module layer/pubtranstop
 */
import * as mm_lang from '../lang.js';
import * as mm_pubtran_stop from '../feature/pubtran.stop.js';
import VectorLayer from 'ol/layer/Vector.js';
import {PUBTRAN_LAYER_ID} from './constants.js';
import {PUBTRAN_RESOLUTION} from '../feature/constants.js';
import {getPubTranStore} from '../source/constants.js';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === PUBTRAN_LAYER_ID;
};

/**
 * @param {string} targetId targetId
 * @param {string} lang language
 * @return {VectorLayer} pubtran layer
 */
const create = (targetId, lang) => {
  const pubTranAttribution = mm_lang.getMsg(
    mm_lang.Translations.PUBTRAN_ATTRIBUTION_HTML,
    lang
  );
  const pubTranLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */
    ({
      id: PUBTRAN_LAYER_ID,
      isFeatureClickable: mm_pubtran_stop.isClickable,
      featureClickHandler: mm_pubtran_stop.featureClickHandler,
      maxResolution: PUBTRAN_RESOLUTION.max,
      source: getPubTranStore(targetId),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      refreshStyleOnFloorChange: false,
      clearSourceOnFloorChange: false,
      renderOrder: null,
    })
  );
  const pubTranSource = pubTranLayer.getSource();
  pubTranSource.setAttributions([pubTranAttribution]);
  return pubTranLayer;
};

export {create, isLayer};
