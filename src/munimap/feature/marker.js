/**
 * @module feature/marker
 */

import * as munimap_building from './building.js';
import * as munimap_range from '../utils/range.js';
import {RESOLUTION as DOOR_RESOLUTION, isDoor} from './door.js';
import {RESOLUTION as FLOOR_RESOLUTION} from './floor.js';
import {ofFeature as extentOfFeature} from '../utils/extent.js';
import {getAnimationRequestParams} from '../utils/animation.js';
import {getCenter} from 'ol/extent';
import {getClosestPointToPixel} from './feature.js';
import {getStore as getMarkerStore} from '../source/marker.js';
import {isCustom as isCustomMarker} from './marker.custom.js';
import {isRoom, isInSelectedFloor as isRoomInSelectedFloor} from './room.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("../utils/animation.js").AnimationRequestOptions} AnimationRequestOptions
 */

/**
 * @typedef {function((ol.Feature|ol.render.Feature), number): (string|null|undefined)} LabelFunction
 */

/**
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = munimap_range.createResolution(0, 2.39);

/**
 * @param {ol.Feature} feature feature
 * @return {boolean} whether is marker feature
 */
const isMarker = (feature) => {
  const result = getMarkerStore().getFeatures().indexOf(feature) >= 0;
  return result;
};

/**
 * @param {FeatureClickHandlerOptions} options opts
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const {feature, map, selectedFeature} = options;
  const view = map.getView();
  const resolution = view.getResolution();

  if (isCustomMarker(feature) || feature.get('detail')) {
    return true;
  } else if (munimap_building.isBuilding(feature)) {
    return (
      munimap_building.hasInnerGeometry(feature) &&
      (!munimap_range.contains(FLOOR_RESOLUTION, resolution) ||
        !munimap_building.isSelected(feature, selectedFeature))
    );
  } else if (isRoom(feature)) {
    return (
      !munimap_range.contains(FLOOR_RESOLUTION, resolution) ||
      !isRoomInSelectedFloor(feature, selectedFeature)
    );
  } else if (isDoor(feature)) {
    return !munimap_range.contains(DOOR_RESOLUTION, resolution);
  }
  return false;
};

/**
 * @param {FeatureClickHandlerOptions} options opts
 * @return {AnimationRequestOptions} result
 */
const featureClickHandler = (options) => {
  const {feature, map, pixel} = options;
  const view = map.getView();
  const resolution = view.getResolution();
  const resolutionRange = isDoor(feature) ? DOOR_RESOLUTION : FLOOR_RESOLUTION;
  const isVisible = munimap_range.contains(resolutionRange, resolution);
  // var identifyCallback = munimap.getProps(map).options.identifyCallback;

  if (!isVisible /*&& !jpad.func.isDef(identifyCallback)*/) {
    let point;
    if (isRoom(feature) || isDoor(feature) || isCustomMarker(feature)) {
      const extent = extentOfFeature(feature);
      point = getCenter(extent);
    } else {
      point = getClosestPointToPixel(map, feature, pixel);
    }
    return getAnimationRequestParams(map, point, resolutionRange.max);
  }
  return null;
  // const detail = /** @type {string} */ (feature.get('detail'));
  // if (detail) {
  //   munimap.bubble.show(feature, map, detail, 0, 20, undefined, true);
  // }
};

export {isClickable, featureClickHandler, isMarker};
