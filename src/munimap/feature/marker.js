/**
 * @module feature/marker
 */

import * as actions from '../redux/action.js';
import * as munimap_building from './building.js';
import * as munimap_range from '../utils/range.js';
import {RESOLUTION as DOOR_RESOLUTION} from './door.constants.js';
import {RESOLUTION as FLOOR_RESOLUTION} from './floor.constants.js';
import {getMarkerStore} from '../source/_constants.js';
import {isCustom as isCustomMarker} from './marker.custom.js';
import {isDoor} from './door.constants.js';
import {isRoom} from './room.constants.js';
import {isInSelectedFloor as isRoomInSelectedFloor} from './room.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("../utils/range").RangeInterface} RangeInterface
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @typedef {function((ol.Feature|ol.render.Feature), number): (string|null|undefined)} LabelFunction
 */

/**
 * @param {ol.Feature} feature feature
 * @return {string} locationCode
 */
const getFloorCode = (feature) => {
  const markerLocationCode = feature.get('polohKod');
  return markerLocationCode ? markerLocationCode.slice(0, 8) : null;
};

/**
 * @param {Array<ol.Feature>} markers markers
 * @param {string} selectedFeature selected feature
 * @return {Array<string>} codes
 */
const getSelectedFloorCodesWithMarkers = (markers, selectedFeature) => {
  const result = markers.map((marker) => {
    const pk = /** @type {string}*/ (marker.get('polohKod'));
    const inSelectedBuilding = pk && pk.startsWith(selectedFeature.slice(0, 5));
    return pk && inSelectedBuilding && pk.length >= 8 && pk.slice(0, 8);
  });
  return result.filter((item) => item);
};

/**
 * @param {string} targetId targetId
 * @param {ol.Feature} feature feature
 * @return {boolean} whether is marker feature
 */
const isMarker = (targetId, feature) => {
  const result = getMarkerStore(targetId).getFeatures().indexOf(feature) >= 0;
  return result;
};

/**
 * @param {IsClickableOptions} options opts
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const {feature, resolution, selectedFeature} = options;
  const hasPoiDetail =
    feature.get('detail') && feature.get('detail').length > 0;

  if (isCustomMarker(feature) || hasPoiDetail) {
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
 * @param {redux.Dispatch} dispatch dispatch
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (dispatch, options) => {
  dispatch(actions.markerClicked(options));
};

export {
  getFloorCode,
  isClickable,
  featureClickHandler,
  getSelectedFloorCodesWithMarkers,
  isMarker,
};
