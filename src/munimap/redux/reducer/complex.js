/**
 * @module redux/reducer/complex
 */
import * as mm_assert from '../../assert/assert.js';
import * as mm_utils from '../../utils/utils.js';
import * as ol_extent from 'ol/extent';
import * as slctr from '../selector.js';
import {
  COMPLEX_ID_FIELD_NAME,
  COMPLEX_RESOLUTION,
  FLOOR_RESOLUTION,
} from '../../feature/_constants.js';
import {INITIAL_STATE} from '../../conf.js';
import {ofFeatures as extentOfFeatures} from '../../utils/extent.js';
import {getAnimationDuration} from '../../utils/animation.js';
import {getBuildingStore, getComplexStore} from '../../source/_constants.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("../../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../../feature/feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 */

/**
 * @param {State} state state
 * @param {FeatureClickHandlerOptions} options payload
 * @return {AnimationRequestState} future extent
 */
const getAnimationRequest = (state, options) => {
  const featureUid = options.featureUid;
  const targetId = slctr.getTargetId(state);
  const feature = getComplexStore(targetId).getFeatureByUid(featureUid);
  const complexId = /**@type {number}*/ (feature.get(COMPLEX_ID_FIELD_NAME));
  const complexBldgs = getBuildingStore(targetId)
    .getFeatures()
    .filter((bldg) => {
      const cId = bldg.get('arealId');
      if (mm_utils.isDefAndNotNull(cId)) {
        mm_assert.assertNumber(cId);
        if (complexId === cId) {
          return true;
        }
      }
      return false;
    });
  const featuresExtent = extentOfFeatures(complexBldgs);
  const futureRes =
    complexBldgs.length === 1
      ? FLOOR_RESOLUTION.max / 2
      : COMPLEX_RESOLUTION.min / 2;

  const futureExtent = ol_extent.getForViewAndSize(
    ol_extent.getCenter(featuresExtent),
    futureRes,
    slctr.getRotation(state),
    slctr.getSize(state)
  );

  return [
    {
      ...INITIAL_STATE.animationRequest[0],
      extent: futureExtent,
      duration: getAnimationDuration(slctr.getExtent(state), featuresExtent),
    },
  ];
};

export {getAnimationRequest};
