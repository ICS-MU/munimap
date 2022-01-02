/**
 * @module view/view
 */
import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_utils from '../utils/utils.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import {CLICK_HANDLER, IS_CLICKABLE} from '../layer/layer.js';
import {
  GET_MAIN_FEATURE_AT_PIXEL_STORE,
  TARGET_ELEMENTS_STORE,
} from '../create.js';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {Point} from 'ol/geom';
import {
  createActiveStore as createActiveDoorStore,
  createStore as createDoorStore,
} from '../source/door.js';
import {
  createActiveStore as createActivePoiStore,
  createStore as createPoiStore,
} from '../source/poi.js';
import {
  createActiveStore as createActiveRoomStore,
  createDefaultStore as createDefaultRoomStore,
  createStore as createRoomStore,
} from '../source/room.js';
import {createStore as createBuildingStore} from '../source/building.js';
import {create as createClusterLayer} from '../layer/cluster.js';
import {createStore as createComplexStore} from '../source/complex.js';
import {createStore as createFloorStore} from '../source/floor.js';
import {create as createGeolocationLayer} from '../layer/geolocation.js';
import {
  createLayer as createIdentifyLayer,
  refreshVisibility as refreshIdentifyLayerVisibility,
} from '../layer/identify.js';
import {createStore as createIdentifyStore} from '../source/identify.js';
import {create as createMarkerLayer} from '../layer/marker.js';
import {createStore as createMarkerStore} from '../source/marker.js';
import {createStore as createOptPoiStore} from '../source/optpoi.js';
import {create as createPubtranLayer} from '../layer/pubtran.stop.js';
import {createStore as createPubtranStore} from '../source/pubtran.stop.js';
import {createStore as createUnitStore} from '../source/unit.js';
import {getDefaultLayers} from '../layer/layer.js';
import {getMainFeatureAtPixel} from '../feature/feature.js';
import {getUid} from 'ol';
import {refreshActiveStyle as refreshActiveDoorStyle} from './door.js';
import {refreshStyle as refreshPubtranStyle} from './pubtran.stop.js';
import {updateClusteredFeatures} from './cluster.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol").View} ol.View
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import('../conf.js').RequiredOptions} RequiredOptions
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("../feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").ErrorMessageState} ErrorMessageState
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../create").MapListenersOptions} MapListenersOptions
 * @typedef {import("../utils/range.js").RangeInterface} RangeInterface
 * @typedef {import("ol").MapBrowserEvent} MapBrowserEvent
 * @typedef {import("../feature/feature.js").isClickableFunction} isClickableFunction
 * @typedef {import("../feature/feature.js").featureClickHandlerFunction} featureClickHandlerFunction
 * @typedef {import("../conf.js").AnimationRequestOptions} AnimationRequestOptions
 * @typedef {import("ol/style/Style").StyleFunction} StyleFunction
 * @typedef {import("../redux/selector.js").AllStyleFunctionsResult} AllStyleFunctionsResult
 * @typedef {import("ol/events.js").EventsKey} EventsKey
 * @typedef {import("ol/view.js").AnimationOptions} AnimationOptions
 */

/**
 * @typedef {Object} AddLayersOptions
 * @property {Array<ol.Feature>} markers markers
 * @property {ol.AttributionLike} muAttrs mu attributions
 * @property {RangeInterface} clusterResolution cluster resolution
 * @property {RequiredOptions} requiredOpts required options
 * @property {boolean} isIdentifyEnabled isIdentifyEnabled
 */

/**
 * @typedef {Object} VisibilityOptions
 * @property {boolean} isIdentifyEnabled isIdentifyEnabled
 * @property {boolean} identifyVisibled identifyVisibled
 */

/**
 * @typedef {Object} ErrorMessageOptions
 * @property {HTMLDivElement} munimapEl munimapEl
 * @property {HTMLDivElement} infoEl infoEl
 * @property {string} lang lang
 * @property {boolean} simpleScroll simple scroll
 * @property {Array<string>} invalidCodes invalid codes
 * @property {redux.Store} store store
 * @property {ErrorMessageState} errorMessage error message state
 */

/**
 * Ensure basemap and change it if necessary.
 * @param {ol.Map} map map
 * @param {TileLayer} basemapLayer basemap
 */
const ensureBaseMap = (map, basemapLayer) => {
  if (!map) {
    return;
  }
  const layers = map.getLayers();

  const currentIndex = layers
    .getArray()
    .findIndex((layer) => layer instanceof TileLayer);
  const currentId = layers.item(currentIndex).get('id');
  const newId = basemapLayer.get('id');

  if (currentId !== newId) {
    layers.setAt(currentIndex, basemapLayer);
  }
};

/**
 * Add layers to map.
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 */
const ensureLayers = (map, options) => {
  if (!map || map.getLayers().getLength() > 1) {
    return;
  }
  const {lang, labels, locationCodes, pubTran} = options.requiredOpts;
  const {isIdentifyEnabled} = options;
  const markerLayer = createMarkerLayer(map, options);
  const markerClusterLayer = createClusterLayer(map, options);
  const layers = getDefaultLayers(lang, labels, locationCodes);
  layers.forEach((layer) => map.addLayer(layer));

  if (pubTran) {
    const pubTranLayer = createPubtranLayer(lang);
    map.addLayer(pubTranLayer);
  }

  map.addLayer(markerClusterLayer);
  map.addLayer(markerLayer);

  if (window.location.protocol === 'https:' || !PRODUCTION) {
    const geolocationLayer = createGeolocationLayer();
    map.addLayer(geolocationLayer);
  }

  if (isIdentifyEnabled) {
    const identifyLayer = createIdentifyLayer();
    map.addLayer(identifyLayer);
  }
};

/**
 * @param {MapBrowserEvent} evt event
 * @param {redux.Dispatch} dispatch dispatch
 * @param {MapListenersOptions} options options
 */
const handleMapClick = (evt, dispatch, options) => {
  const {selectedFeature, isIdentifyEnabled} = options;
  const {getMainFeatureAtPixelId, clusterFacultyAbbr, identifyTypes} =
    options.requiredOpts;
  const {map, pixel} = evt;

  const getMainFeatureAtPixelFn = getMainFeatureAtPixelId
    ? GET_MAIN_FEATURE_AT_PIXEL_STORE[getMainFeatureAtPixelId]
    : getMainFeatureAtPixel;

  const featureWithLayer = getMainFeatureAtPixelFn(map, pixel);
  if (featureWithLayer) {
    const layer = featureWithLayer.layer;
    const isClickable = /** @type {isClickableFunction}*/ (
      layer.get(IS_CLICKABLE)
    );
    if (isClickable) {
      munimap_assert.assertFunction(isClickable);

      const handlerOpts = {
        feature: featureWithLayer.feature,
        resolution: map.getView().getResolution(),
        selectedFeature,
        clusterFacultyAbbr,
        identifyTypes,
        isIdentifyEnabled,
      };
      if (isClickable(handlerOpts)) {
        const featureClickHandler = /** @type {featureClickHandlerFunction} */ (
          layer.get(CLICK_HANDLER)
        );
        if (featureClickHandler) {
          munimap_assert.assertFunction(featureClickHandler);
          featureClickHandler(dispatch, {
            featureUid: getUid(featureWithLayer.feature),
            pixelInCoords: map.getCoordinateFromPixel(pixel),
          });
        }
      }
    }
  }
};

/**
 * @param {MapBrowserEvent} evt event
 * @param {MapListenersOptions} options options
 */
const handlePointerMove = (evt, options) => {
  if (evt.dragging) {
    return;
  }

  const {selectedFeature, isIdentifyEnabled} = options;
  const {targetId, getMainFeatureAtPixelId, clusterFacultyAbbr, identifyTypes} =
    options.requiredOpts;
  const map = evt.map;
  const targetEl = TARGET_ELEMENTS_STORE[targetId];
  const pixel = map.getEventPixel(evt.originalEvent);
  const getMainFeatureAtPixelFn = getMainFeatureAtPixelId
    ? GET_MAIN_FEATURE_AT_PIXEL_STORE[getMainFeatureAtPixelId]
    : getMainFeatureAtPixel;

  const featureWithLayer = getMainFeatureAtPixelFn(map, pixel);
  const elAtPixel = evt.originalEvent.target;
  if (featureWithLayer) {
    const feature = featureWithLayer.feature;
    // let title = /**@type {string|undefined}*/ (feature.get('typ'));
    // const purposeTitle = /**@type {string|undefined}*/ (
    //   feature.get('ucel_nazev')
    // );
    // const purposeGis = /**@type {string|undefined}*/ (
    //   feature.get('ucel_gis')
    // );
    // if (tooltipsShown
    //   && munimap.tooltips.inTooltipResolutionRange(map, title)) {
    //   if (!!title && Object.values(munimap.poi.Purpose).includes(title)) {
    //     timing = munimap.tooltips.toggleTooltip(map, pixel, title);
    //   } else if (Object.values(munimap.tooltips.RoomTypes).includes(
    //     purposeTitle)) {
    //     title = purposeTitle;
    //     timing = munimap.tooltips.toggleTooltipPolygon(
    //       map, feature, pixel, title);
    //   } else if (!!purposeGis &&
    //     munimap.tooltips.RoomPoiTypes.includes(purposeGis)) {
    //     title = purposeGis;
    //     timing = munimap.tooltips.toggleTooltipPolygon(
    //       map, feature, pixel, title);
    //   } else {
    //     munimap.tooltips.setTooltipShown(map, false);
    //   }
    // }
    const layer = featureWithLayer.layer;
    const isClickable = /** @type {isClickableFunction}*/ (
      layer.get('isFeatureClickable')
    );
    if (isClickable) {
      munimap_assert.assertFunction(isClickable);
      const handlerOpts = {
        feature,
        resolution: map.getView().getResolution(),
        selectedFeature,
        clusterFacultyAbbr,
        identifyTypes,
        isIdentifyEnabled,
      };
      targetEl.style.cursor = isClickable(handlerOpts) ? 'pointer' : '';
    } else {
      targetEl.style.cursor = '';
    }
  } else {
    targetEl.style.cursor = '';
    // if (options.tooltips) {
    //   munimap.tooltips.setTooltipShown(map, false);
    // }
  }
};

/**
 * Attach listeners to Map.
 * @param {ol.Map} map map
 * @param {redux.Dispatch} dispatch dispatch
 */
const attachIndependentMapListeners = (map, dispatch) => {
  if (!map) {
    return;
  }
  map.once('rendercomplete', () => {
    dispatch(actions.map_initialized());
  });

  map.on('moveend', () => {
    dispatch(
      actions.ol_map_view_change({
        center: map.getView().getCenter(),
        resolution: map.getView().getResolution(),
        mapSize: map.getSize(),
      })
    );
  });
};

/**
 * Attach listeners to Map.
 * @param {ol.Map} map map
 * @param {redux.Dispatch} dispatch dispatch
 * @param {MapListenersOptions} options opts
 * @return {Array<EventsKey>} ol event keys
 */
const attachDependentMapListeners = (map, dispatch, options) => {
  if (!map) {
    return [];
  }
  const k1 = map.on('click', (evt) => handleMapClick(evt, dispatch, options));
  const k2 = map.on('pointermove', (evt) => handlePointerMove(evt, options));
  return [k1, k2];
};

/**
 * Create global stores for features - buildings, rooms...
 * @param {redux.Store} reduxStore store
 */
const createFeatureStores = (reduxStore) => {
  const callbackFn = (actionCreator, opt_args) =>
    reduxStore.dispatch(actionCreator(opt_args));

  createBuildingStore(callbackFn);
  createMarkerStore();
  createComplexStore();
  createUnitStore();
  createFloorStore();
  createRoomStore();
  createDefaultRoomStore(callbackFn);
  createActiveRoomStore(reduxStore, callbackFn);
  createDoorStore();
  createActiveDoorStore(reduxStore, callbackFn);
  createPoiStore();
  createActivePoiStore(reduxStore, callbackFn);
  createOptPoiStore();

  const state = reduxStore.getState();
  if (state.requiredOpts.pubTran) {
    createPubtranStore();
  }
  if (state.requiredOpts.identifyCallbackId) {
    createIdentifyStore();
  }
};

/**
 * Refresh styles for layers.
 * @param {ol.Map} map map
 * @param {AllStyleFunctionsResult} styleFunctions style functions
 * @param {boolean} pubTran pubtran
 */
const refreshStyles = (map, styleFunctions, pubTran) => {
  if (!map) {
    return;
  }

  const layers = map.getLayers().getArray();
  if (!Array.isArray(layers) || layers.length === 0) {
    return;
  }

  Object.entries(styleFunctions).forEach(([id, styleFn]) => {
    const lyr = layers.find((l) => l.get('id') === id);
    if (lyr && lyr instanceof VectorLayer) {
      if (styleFn !== lyr.getStyle()) {
        lyr.setStyle(styleFn);
      }
    }
  });

  //styles not derived from state
  refreshActiveDoorStyle(layers);
  if (pubTran) {
    refreshPubtranStyle(layers);
  }
};

/**
 * Ensure update clusters in map.
 * @param {ol.Map} map map
 * @param {Object} options options
 * @param {boolean} options.labels labels
 * @param {number} options.buildingsCount buildings count
 */
const ensureClusterUpdate = (map, {labels, buildingsCount}) => {
  if (!map) {
    return;
  }

  const oldBuildingsCount = map.get(MUNIMAP_PROPS_ID).buildingsCount;
  const newBuildingsCount = buildingsCount;

  if (newBuildingsCount !== oldBuildingsCount) {
    map.get(MUNIMAP_PROPS_ID).buildingsCount = newBuildingsCount;
    if (labels !== false) {
      const resolution = map.getView().getResolution();
      updateClusteredFeatures(resolution, labels);
    }
  }
};

/**
 *
 * @param {ol.View} view view
 * @param {AnimationRequestOptions} options options
 * @return {AnimationOptions} options
 */
const createAnimationOptions_ = (view, options) => {
  const {center, resolution, duration} = options;
  const _center = center instanceof Point ? center.getCoordinates() : center;
  const _resolution = view.getConstrainedResolution(resolution);
  return {
    center: _center,
    resolution: _resolution,
    duration,
  };
};

/**
 *
 * @param {ol.Map} map map
 * @param {AnimationRequestState} animationRequest requested view state
 */
const animate = (map, animationRequest) => {
  if (!map || Object.values(animationRequest[0]).every((i) => i === null)) {
    return;
  }

  const view = map.getView();
  animationRequest.forEach((animationReqItem) => {
    if (Array.isArray(animationReqItem)) {
      view.animate(
        ...animationReqItem.map((item) => createAnimationOptions_(view, item))
      );
    } else {
      const {extent, duration} = animationReqItem;
      extent
        ? view.fit(extent, {duration})
        : view.animate(createAnimationOptions_(view, animationReqItem));
    }
  });
};

/**
 * @param {ol.Map} map map
 * @param {VisibilityOptions} options options
 */
const refreshVisibility = (map, options) => {
  if (!map) {
    return;
  }

  const {isIdentifyEnabled, identifyVisibled} = options;
  if (isIdentifyEnabled) {
    refreshIdentifyLayerVisibility(map, identifyVisibled);
  }
};

export {
  animate,
  attachIndependentMapListeners,
  attachDependentMapListeners,
  createFeatureStores,
  ensureBaseMap,
  ensureClusterUpdate,
  ensureLayers,
  refreshStyles,
  refreshVisibility,
};
