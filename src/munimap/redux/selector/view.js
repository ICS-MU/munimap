/* eslint-disable no-console */
/**
 * @module
 */

import * as mm_lang from '../../lang.js';
import * as mm_utils from '../../utils/utils.js';
import * as ol_extent from 'ol/extent.js';
import * as sf from './feature/feature.js';
import * as sfl from './feature/floor.js';
import * as ss from './simple.js';
import {ENABLE_SELECTOR_LOGS, INITIAL_STATE} from '../../conf.js';
import {defaults as control_defaults} from 'ol/control.js';
import {create as createMapView} from '../../view/mapview.js';
import {createSelector} from './reselect.js';
import {getAnimationDuration} from '../../utils/animation.js';
import {getBufferValue} from '../../utils/extent.js';
import {isInExtent} from '../../feature/building.js';

/**
 * @typedef {import("../../conf.js").State} State
 * @typedef {import("../../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/View").default} ol.View
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("ol/coordinate").Coordinate} ol.Coordinate
 * @typedef {import("ol/control/Control").default} ol.control.Control
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 */

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.View,
 *    function(string, ol.Coordinate, number, Array<ol.Feature>, Array<ol.Feature>): ol.View
 * >}
 */
const calculateView = createSelector(
  [
    ss.getTargetId,
    ss.getRequiredCenter,
    ss.getRequiredZoom,
    sf.getInitMarkersWithGeometry,
    sf.getInitZoomTo,
  ],
  (targetId, requiredCenter, requiredZoom, markers, zoomTo) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing view');
    }
    return createMapView(
      targetId,
      requiredCenter,
      requiredZoom,
      markers,
      zoomTo
    );
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    import("ol/Collection").default<ol.control.Control>,
 *    function(string): import("ol/Collection").default<ol.control.Control>
 * >}
 */
const getDefaultControls = createSelector(
  [ss.getLang, ss.getTargetId],
  (lang, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing default controls');
    }

    //targetId is important for multiple maps
    //each of them must have their own controls
    if (!targetId) {
      return null;
    }
    return control_defaults({
      attributionOptions: {
        tipLabel: mm_lang.getMsg(mm_lang.Translations.ATTRIBUTIONS, lang),
      },
      rotate: false,
      zoomOptions: {
        zoomInTipLabel: mm_lang.getMsg(mm_lang.Translations.ZOOM_IN, lang),
        zoomOutTipLabel: mm_lang.getMsg(mm_lang.Translations.ZOOM_OUT, lang),
      },
    });
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Extent,
 *    function(number, ol.Coordinate, number, ol.Size): ol.Extent
 * >}
 */
const getExtent = createSelector(
  [ss.getResolution, ss.getCenter, ss.getRotation, ss.getSize],
  (resolution, center, rotation, size) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing extent');
    }

    if (!size) {
      return;
    }
    return ol_extent.getForViewAndSize(center, resolution, rotation, size);
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.Extent,
 *    function(ol.Extent): ol.Extent
 * >}
 */
const getReferenceExtent = createSelector([getExtent], (extent) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing reference extent');
  }
  return ol_extent.buffer(extent, getBufferValue(extent));
});

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(ol.Extent, string): boolean
 * >}
 */
const isSelectedInExtent = createSelector(
  [getReferenceExtent, ss.getSelectedFeature, ss.getTargetId],
  (refExtent, selectedFeature, targetId) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing whether is selected building in extent');
    }
    if (mm_utils.isDefAndNotNull(selectedFeature)) {
      return isInExtent(selectedFeature, targetId, refExtent);
    }
    return false;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    AnimationRequestState,
 *    function(ol.Size, ol.Extent, ol.View): AnimationRequestState
 * >}
 */
const calculateAnimationRequest = createSelector(
  [ss.getSize, getExtent, calculateView],
  (size, extent, view) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('calculate animation request');
    }
    const newExt = view.calculateExtent(size);
    let duration = 0;

    if (extent && newExt) {
      if (ol_extent.intersects(extent, newExt)) {
        duration = getAnimationDuration(extent, newExt);
      }

      const animationRequest = {
        extent: newExt,
        duration,
      };
      return [
        {
          ...INITIAL_STATE.animationRequest[0],
          ...animationRequest,
        },
      ];
    } else {
      return null;
    }
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean?,
 *    function(boolean?, boolean, boolean): boolean
 * >}
 */
const toggleLoadingMessage = createSelector(
  [ss.getRequiredLoadingMessage, sf.areMarkersLoaded, sf.areZoomToLoaded],
  (requireLoadingMessage, markersLoaded, zoomToLoaded) => {
    if (ENABLE_SELECTOR_LOGS) {
      console.log('computing loading message');
    }
    if (!requireLoadingMessage) {
      return null;
    } else {
      if (markersLoaded && zoomToLoaded) {
        return false;
      } else {
        return true;
      }
    }
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(string, boolean): boolean
 * >}
 */
const showInfoEl = createSelector(
  [ss.getSelectedFeature, sfl.isInFloorResolutionRange],
  (selectedFeature, inFloorResolutionRange) => {
    return !!selectedFeature && inFloorResolutionRange;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    boolean,
 *    function(number): boolean
 * >}
 */
const isResetAnimationDone = createSelector(
  [ss.getResetTimestamp],
  (resetTimestamp) => {
    return resetTimestamp > 0;
  }
);

/**
 * @type {import("reselect").OutputSelector<
 *    State,
 *    ol.AttributionLike,
 *    function(string): ol.AttributionLike
 * >}
 */
const getMuAttrs = createSelector([ss.getLang], (lang) => {
  if (ENABLE_SELECTOR_LOGS) {
    console.log('computing MU attrs');
  }
  const munimapAttr = mm_lang.getMsg(
    mm_lang.Translations.MUNIMAP_ATTRIBUTION_HTML,
    lang
  );
  const muAttr = mm_lang.getMsg(mm_lang.Translations.MU_ATTRIBUTION_HTML, lang);
  return [munimapAttr, muAttr];
});

export {
  calculateAnimationRequest,
  calculateView,
  getDefaultControls,
  getExtent,
  getMuAttrs,
  getReferenceExtent,
  isResetAnimationDone,
  isSelectedInExtent,
  showInfoEl,
  toggleLoadingMessage,
};
