/**
 * @module feature/marker
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_range from '../utils/range.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

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
 * @type {VectorSource}
 * @const
 */
const STORE = new VectorSource();

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'marker';

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} whether is marker layer
 */
const isLayer = (layer) => {
  return layer.get('id') === LAYER_ID;
};

/**
 * @param {ol.Map} map map
 * @return {VectorLayer} layer
 */
const getLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isLayer);
  munimap_assert.assertInstanceof(result, VectorLayer);
  return /** @type {VectorLayer}*/ (result);
};

/**
 * @param {ol.Map} map map
 * @return {ol.source.Vector} source
 */
const getStore = (map) => {
  const layer = getLayer(map);
  const result = layer.getSource();
  return result;
};

/**
 * @param {ol.Map} map map
 * @return {Array.<ol.Feature>} features
 */
const getFeatures = (map) => {
  const store = getStore(map);
  return store.getFeatures();
};

/**
 * @param {ol.Map} map map
 * @param {ol.Feature} feature feature
 * @return {boolean} whether is marker feature
 */
const isMarker = (map, feature) => {
  const result = getFeatures(map).indexOf(feature) >= 0;
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

export {
  LAYER_ID,
  STORE,
  isClickable,
  featureClickHandler,
  getStore,
  isMarker,
  getFeatures,
};
