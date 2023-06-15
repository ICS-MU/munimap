/* eslint-disable no-console */
/**
 * @module
 */
import * as mm_utils from '../../utils/utils.js';
import * as ol_extent from 'ol/extent.js';
import * as ss from './simple.js';
import {ENABLE_SELECTOR_LOGS} from '../../conf.js';
import {
  FEATURE_TYPE_PROPERTY_NAME,
  MARKER_RESOLUTION,
  PUBTRAN_RESOLUTION,
  PUBTRAN_TYPE,
} from '../../feature/constants.js';
import {MultiPolygon, Polygon} from 'ol/geom.js';
import {calculateBubbleOffsets} from '../../style/icon.js';
import {createSelector} from './reselect.js';
import {getBetterInteriorPoint} from '../../utils/geom.js';
import {getDetailHtml} from '../../feature/pubtran.stop.js';
import {getPopupFeatureByUid} from '../../source/source.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("../../utils/range.js").RangeInterface} RangeInterface
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("../../style/icon.js").IconOptions} IconOptions
 */

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Feature,
 *    function(string, string): ol.Feature
 * >}
 */
const getFeatureForPopup = createSelector(
  [ss.getPopupFeatureUid, ss.getTargetId],
  (uid, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('get feature for popup');
    }

    if (!mm_utils.isDefAndNotNull(uid)) {
      return null;
    }
    return getPopupFeatureByUid(targetId, uid);
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    RangeInterface,
 *    function(ol.Feature): RangeInterface
 * >}
 */
const getHideResolutionForPopup = createSelector(
  [getFeatureForPopup],
  (feature) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('get hide resolution fo popup');
    }

    if (!feature) {
      return MARKER_RESOLUTION;
    }

    const ft = feature.get(FEATURE_TYPE_PROPERTY_NAME);
    return ft && ft.layerId === PUBTRAN_TYPE.layerId
      ? PUBTRAN_RESOLUTION
      : MARKER_RESOLUTION;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(string): boolean
 * >}
 */
const isPopupVisible = createSelector([ss.getPopupFeatureUid], (uid) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing whether popup is visible');
  }

  return mm_utils.isDefAndNotNull(uid);
});

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    string,
 *    function(ol.Feature, string): string
 * >}
 */
const getPopupContent = createSelector(
  [getFeatureForPopup, ss.getLang],
  (feature, lang) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('get popup content');
    }

    if (!feature) {
      return null;
    }
    const ft = feature.get(FEATURE_TYPE_PROPERTY_NAME);
    return ft && ft.layerId === PUBTRAN_TYPE.layerId
      ? getDetailHtml(feature.get('nazev'), lang)
      : feature.get('detail');
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Coordinate,
 *    function(ol.Feature): ol.Coordinate
 * >}
 */
const getPopupPositionInCoords = createSelector(
  [getFeatureForPopup],
  (feature) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing popup position');
    }

    if (!feature) {
      return null;
    }

    const geometry = feature.getGeometry();
    let centroid = ol_extent.getCenter(geometry.getExtent());
    if (
      !geometry.intersectsCoordinate(centroid) &&
      (geometry instanceof MultiPolygon || geometry instanceof Polygon)
    ) {
      centroid = getBetterInteriorPoint(geometry).getCoordinates();
    }

    return centroid;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    Array<number>,
 *    function(ol.Feature): Array<number>
 * >}
 */
const getOffsetForPopup = createSelector([getFeatureForPopup], (feature) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('get popup offset');
  }
  const defaultOffset = [0, 20];

  if (!feature) {
    return defaultOffset;
  }

  const ft = feature.get(FEATURE_TYPE_PROPERTY_NAME);
  const icon = /** @type {IconOptions|undefined}*/ (feature.get('icon'));
  if (ft && ft.layerId === PUBTRAN_TYPE.layerId) {
    return [0, 0];
  } else if (icon && icon.size) {
    const {offsetX, offsetY} = calculateBubbleOffsets(icon);
    return [offsetX, offsetY];
  } else {
    return defaultOffset;
  }
});

export {
  getFeatureForPopup,
  getHideResolutionForPopup,
  getOffsetForPopup,
  getPopupContent,
  getPopupPositionInCoords,
  isPopupVisible,
};
