/**
 * @module layer/pubtranstop
 */
import * as munimap_lang from '../lang/lang.js';
import * as munimap_pubtran_stop from '../feature/pubtran.stop.js';
import VectorLayer from 'ol/layer/Vector';
import {RESOLUTION as PUBTRAN_RESOLUTION} from '../feature/pubtran.stop.constants.js';
import {getStore as getPubtranStore} from '../source/pubtran.stop.js';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'publictransport';

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === LAYER_ID;
};

/**
 * @param {string} targetId targetId
 * @param {string} lang language
 * @return {VectorLayer} pubtran layer
 */
const create = (targetId, lang) => {
  const pubTranAttribution = munimap_lang.getMsg(
    munimap_lang.Translations.PUBTRAN_ATTRIBUTION_HTML,
    lang
  );
  const pubTranLayer = new VectorLayer(
    /** @type {VectorLayerOptions} */
    ({
      id: LAYER_ID,
      isFeatureClickable: munimap_pubtran_stop.isClickable,
      featureClickHandler: munimap_pubtran_stop.featureClickHandler,
      maxResolution: PUBTRAN_RESOLUTION.max,
      source: getPubtranStore(targetId),
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
