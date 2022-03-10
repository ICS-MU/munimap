/**
 * @module view/pubtran.stop
 */
import VectorLayer from 'ol/layer/Vector';
import {INITIAL_STATE} from '../conf.js';
import {getAnimationRequestParams} from '../utils/animation.js';
import {getPubTranStore} from '../source/_constants.js';
import {isLayer} from '../layer/pubtran.stop.js';
import {styleFunction} from '../style/pubtran.stop.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/geom/Point").default} ol.geom.Point
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("../utils/animation.js").ViewOptions} ViewOptions
 */

/**
 * @typedef {Object} Props
 * @property {string} featureUid featureUid
 * @property {string} targetId targetId
 *
 * @typedef {ViewOptions & Props} GetAnimationRequestOptions
 */

/**
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshStyle = (layers) => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }
  const lyr = layers.find((l) => isLayer(l));

  if (lyr && lyr instanceof VectorLayer && styleFunction !== lyr.getStyle()) {
    lyr.setStyle(styleFunction);
  }
};

/**
 * @param {GetAnimationRequestOptions} options payload
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (options) => {
  const {featureUid, targetId, rotation, size, extent, resolution} = options;
  const feature = getPubTranStore(targetId).getFeatureByUid(featureUid);

  const point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
  const coords = point.getCoordinates();
  const animationRequest = getAnimationRequestParams(coords, {
    resolution,
    rotation,
    size,
    extent,
  });

  return [
    {
      ...INITIAL_STATE.animationRequest[0],
      ...animationRequest,
    },
  ];
};

export {getAnimationRequest, refreshStyle};
