/**
 * @module redux/reducer/pubtran.stop
 */
import {INITIAL_STATE} from '../../conf.js';
import {getAnimationRequestParams} from '../../utils/animation.js';
import {getPubTranStore} from '../../source/constants.js';

/**
 * @typedef {import("ol/geom/Point").default} ol.geom.Point
 * @typedef {import("../../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../../utils/animation.js").ViewOptions} ViewOptions
 */

/**
 * @typedef {object} Props
 * @property {string} featureUid featureUid
 * @property {string} targetId targetId
 *
 * @typedef {ViewOptions & Props} GetAnimationRequestOptions
 */

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

export {getAnimationRequest};
