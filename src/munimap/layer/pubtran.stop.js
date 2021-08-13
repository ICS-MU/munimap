/**
 * @module layer/pubtranstop
 */
import * as munimap_lang from '../lang/lang.js';
import * as munimap_pubtran_stop from '../feature/pubtran.stop.js';
import PubtranStopStyleFunction from '../style/pubtran.stop.js';
import VectorLayer from 'ol/layer/Vector';

/**
 * @typedef {import("./layer.js").VectorLayerOptions} VectorLayerOptions
 */

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'publictransport';

/**
 * @param {string} lang language
 * @return {VectorLayer} pubtran layer
 */
export const create = (lang) => {
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
      type: munimap_pubtran_stop.TYPE,
      maxResolution: munimap_pubtran_stop.RESOLUTION.max,
      source: munimap_pubtran_stop.STORE,
      style: PubtranStopStyleFunction,
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
