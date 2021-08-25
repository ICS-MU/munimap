/**
 * @module feature/marker
 */

import * as munimap_range from '../utils/range.js';
import {getStore as getMarkerStore} from '../source/marker.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
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
  console.error('Not implemented yet!');
  return false;
  // const feature = options.feature;
  // const map = options.map;
  // const resolution = options.resolution;
  // if (munimap_customMarker.isCustom(feature)) {
  //   return true;
  // } else if (feature.get('detail')) {
  //   return true;
  // } else if (munimap_building.isBuilding(feature)) {
  //   return (
  //     munimap_building.hasInnerGeometry(feature) &&
  //     (!munimap_range.contains(FLOOR_RESOLUTION, resolution) ||
  //       !munimap_building.isSelected(feature, map))
  //   ); //not implemented
  // } else if (munimap.room.isRoom(feature)) {
  //   return (!munimap.range.contains(munimap.floor.RESOLUTION, resolution) ||
  //       !munimap.room.isInSelectedFloor(feature, map));
  // } else if (munimap.door.isDoor(feature)) {
  //   return !munimap.range.contains(munimap.door.RESOLUTION, resolution);
  // }
  // return false;
};

/**
 * @param {FeatureClickHandlerOptions} options opts
 */
const featureClickHandler = (options) => {
  console.log('Yot implemented yet');
};

export {isClickable, featureClickHandler, isMarker};
