/**
 * @module layer/pubtranstop
 */
import * as munimap_lang from '../lang/lang.js';
import * as munimap_pubtran_stop from '../feature/pubtran.stop.js';
import VectorLayer from 'ol/layer/Vector';
import {getStore as getPubtranStore} from '../view/pubtran.stop.js';

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
 * @param {string} lang language
 * @return {VectorLayer} pubtran layer
 */
const create = (lang) => {
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
      maxResolution: munimap_pubtran_stop.RESOLUTION.max,
      source: getPubtranStore(),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      refreshStyleOnFloorChange: false,
      clearSourceOnFloorChange: false,
      redrawOnFloorChange: false,
      renderOrder: null,
    })
  );
  const pubTranSource = pubTranLayer.getSource();
  pubTranSource.setAttributions([pubTranAttribution]);
  return pubTranLayer;
};

export {create, isLayer};
