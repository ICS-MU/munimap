/**
 * @module feature/poi
 */

import * as munimap_range from '../utils/range.js';
import {FEATURE_TYPE_PROPERTY_NAME} from '../feature/feature.js';
import {RESOLUTION as FLOOR_RESOLUTION} from './floor.js';
import {MUNIMAP_URL} from '../conf.js';
import {getAnimationRequestParams} from '../utils/animation.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("../utils/animation.js").AnimationRequestOptions} AnimationRequestOptions
 * @typedef {import("ol/geom").Point} ol.geom.Point
 */

/**
 * @enum {string}
 * @const
 */
const PURPOSE = {
  INFORMATION_POINT: 'informace',
  BUILDING_ENTRANCE: 'vstup do budovy',
  BUILDING_COMPLEX_ENTRANCE: 'vstup do areálu a budovy',
  COMPLEX_ENTRANCE: 'vstup do areálu',
  ELEVATOR: 'výtah',
  CLASSROOM: 'učebna',
  TOILET: 'WC',
  TOILET_IMMOBILE: 'WC invalidé',
  TOILET_MEN: 'WC muži',
  TOILET_WOMEN: 'WC ženy',
};

/**
 * @type {RangeInterface}
 * @const
 */
const RESOLUTION = munimap_range.createResolution(0, 1.195);

/**
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'OBJECTID',
      serviceUrl: MUNIMAP_URL,
      layerId: 0,
      name: 'poi',
    };
  }
  return TYPE;
};

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {boolean} whether is feature poi
 */
const isPoi = (feature) => {
  const type = /**@type {TypeOptions}*/ (
    feature.get(FEATURE_TYPE_PROPERTY_NAME)
  );
  return type === getType();
};

/**
 * @param {FeatureClickHandlerOptions} options options
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const {feature, map} = options;
  const view = map.getView();
  const resolution = view.getResolution();

  if (!munimap_range.contains(FLOOR_RESOLUTION, resolution)) {
    const poiType = feature.get('typ');
    return (
      poiType === PURPOSE.BUILDING_ENTRANCE ||
      poiType === PURPOSE.BUILDING_COMPLEX_ENTRANCE
    );
  }
  return false;
};

/**
 * @param {FeatureClickHandlerOptions} options options
 * @return {AnimationRequestOptions} result
 */
const featureClickHandler = (options) => {
  const {feature, map} = options;
  const view = map.getView();
  const resolution = view.getResolution();

  const isVisible = munimap_range.contains(FLOOR_RESOLUTION, resolution);
  if (!isVisible) {
    const point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
    const coors = point.getCoordinates();
    return getAnimationRequestParams(map, coors, FLOOR_RESOLUTION.max);
  }
  return null;
};

export {PURPOSE, RESOLUTION, getType, isClickable, featureClickHandler};
