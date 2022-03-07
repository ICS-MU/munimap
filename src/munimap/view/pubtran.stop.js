/**
 * @module view/pubtran.stop
 */
import * as slctr from '../redux/selector.js';
import VectorLayer from 'ol/layer/Vector';
import {INITIAL_STATE} from '../conf.js';
import {getAnimationRequestParams} from '../utils/animation.js';
import {getStore} from '../source/pubtran.stop.js';
import {isLayer} from '../layer/pubtran.stop.js';
import {styleFunction} from '../style/pubtran.stop.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/geom/Point").default} ol.geom.Point
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
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
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} options payload
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (state, options) => {
  const featureUid = options.featureUid;
  const targetId = slctr.getTargetId(state);
  const feature = getStore(targetId).getFeatureByUid(featureUid);

  const point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
  const coords = point.getCoordinates();
  const animationRequest = getAnimationRequestParams(coords, {
    resolution: slctr.getResolution(state),
    rotation: slctr.getRotation(state),
    size: slctr.getSize(state),
    extent: slctr.getExtent(state),
  });

  return [
    {
      ...INITIAL_STATE.animationRequest[0],
      ...animationRequest,
    },
  ];
};

export {getAnimationRequest, refreshStyle};
