/**
 * @module view/view
 */
import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import * as slctr from '../redux/selector.js';
import TileLayer from 'ol/layer/Tile';
import createControls from '../control/mapcontrolsview.js';
import {
  GET_MAIN_FEATURE_AT_PIXEL_STORE,
  TARGET_ELEMENTS_STORE,
} from '../create.js';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {Point} from 'ol/geom';
import {
  addEmptyErrorEl,
  prependMessageToErrorEl,
  removeErrorEl,
} from '../ui/interaction.js';
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
import {create as createMarkerLayer} from '../layer/marker.js';
import {createStore as createMarkerStore} from '../source/marker.js';
import {createStore as createOptPoiStore} from '../source/optpoi.js';
import {create as createPubtranLayer} from '../layer/pubtran.stop.js';
import {createStore as createPubtranStore} from '../source/pubtran.stop.js';
import {createStore as createUnitStore} from '../source/unit.js';
import {getDefaultLayers} from '../layer/layer.js';
import {getMainFeatureAtPixel} from '../feature/feature.js';
import {refreshActiveStyle as refreshActiveDoorStyle} from './door.js';
import {refreshActiveStyle as refreshActivePoiStyle} from './poi.js';
import {
  refreshActiveStyle as refreshActiveRoomStyle,
  refreshLabelStyle as refreshRoomLabelStyle,
  refreshStyle as refreshRoomStyle,
} from './room.js';
import {
  refreshLabelStyle as refreshBuildingLabelStyle,
  refreshStyle as refreshBuildingStyle,
} from './building.js';
import {
  refreshStyle as refreshClusterStyle,
  updateClusteredFeatures,
} from './cluster.js';
import {refreshStyle as refreshComplexStyle} from './complex.js';
import {
  refreshElementPosition,
  refreshElementVisibility,
  refreshFloorSelect,
} from './info.js';
import {refreshStyle as refreshMarkerStyle} from './marker.js';
import {refreshStyle as refreshPubtranStyle} from './pubtran.stop.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import('../conf.js').RequiredOptions} RequiredOptions
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("../feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").ErrorMessageState} ErrorMessageState
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../create").MapListenersOptions} MapListenersOptions
 * @typedef {import("../utils/range.js").RangeInterface} RangeInterface
 * @typedef {import("ol").MapBrowserEvent} MapBrowserEvent
 * @typedef {import("../feature/feature.js").isClickableFunction} isClickableFunction
 * @typedef {import("../feature/feature.js").featureClickHandlerFunction} featureClickHandlerFunction
 * @typedef {import("../utils/animation.js").AnimationRequestOptions} AnimationRequestOptions
 */

/**
 * @typedef {Object} AddLayersOptions
 * @property {Array<ol.Feature>} markers markers
 * @property {string} lang language
 * @property {ol.AttributionLike} muAttrs mu attributions
 * @property {boolean} [clusterFacultyAbbr] whether to cluster faculty abbrs
 * @property {boolean} [showLabels] whether to show labels
 * @property {boolean} [locationCodes] whether to show location codes
 * @property {MarkerLabelFunction} [markerLabel] marker label
 * @property {boolean} [pubTran] public transportation
 * @property {ol.source.Vector} [markerSource] marker source
 * @property {RangeInterface} clusterResolution cluster resolution
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
 * @param {Element} target target
 * @param {string} lang language
 */
const addLoadingMessage = (target, lang) => {
  const messageDiv = document.createElement('div');
  console.log(target)
  messageDiv.id = 'message_' + target.id.toString();
  messageDiv.className = 'loading-message';
  messageDiv.style.cssText =
    'color: #999; font-size: 30px;' +
    ' font-weight: bold; vertical-align: middle; ' +
    ' font-family: Arial, Helvetica, sans-serif; ' +
    ' position: absolute; top: 0; left: 0; width: 100%;' +
    ' height: 100%; text-align: center;';

  const innerDiv = document.createElement('div');
  innerDiv.className = 'inner';
  innerDiv.style.cssText =
    'display:inline-block; vertical-align: middle; position: relative;';

  const message = document.createElement('p');
  message.className = 'text';
  message.appendChild(
    document.createTextNode(
      munimap_lang.getMsg(munimap_lang.Translations.LOADING_MAP, lang)
    )
  );

  const styleElInnerHTML =
    `#message_${target.id.toString()}` +
    `:before {box-sizing: inherit; content: \'\'; display: inline-block; ` +
    `height: 100%; vertical-align: middle; margin-right: -0.25em;}`;

  const styleEl = document.createElement('style');
  styleEl.id = 'message_' + target.id.toString() + '_style';
  styleEl.appendChild(document.createTextNode(styleElInnerHTML));

  messageDiv.appendChild(innerDiv);
  innerDiv.appendChild(message);
  target.appendChild(styleEl);
  target.appendChild(messageDiv);
};

/**
 * @param {Element} target target element
 */
const removeLoadingMessage = (target) => {
  const id = target.id.toString();
  const messageEl = document.getElementById(`message_${id}`);

  if (messageEl) {
    document.getElementById(`message_${id}`).remove();
    document.getElementById(`message_${id}_style`).remove();
  }
};

/**
 * @param {boolean} add whether to add or remove
 * @param {Element} target target element
 * @param {string} lang language
 */
const toggleLoadingMessage = (add, target, lang) => {
  add ? addLoadingMessage(target, lang) : removeLoadingMessage(target);
};

/**
 * Ensure basemap and change it if necessary.
 * @param {TileLayer} basemapLayer basemap
 * @param {ol.Map} map map
 */
const ensureBaseMap = (basemapLayer, map) => {
  if (map === undefined) {
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
 * Add controls to map.
 * @param {ol.Map} map map
 * @param {redux.Store} store store
 * @param {RequiredOptions} requiredOpts opts
 */
const addCustomControls = (map, store, requiredOpts) => {
  createControls(map, store, requiredOpts);
};

/**
 * Add layers to map.
 * @param {ol.Map} map map
 * @param {AddLayersOptions} options opts
 */
const addLayers = (map, options) => {
  const {lang, showLabels, locationCodes} = options;
  const markerLayer = createMarkerLayer(map, options);
  options.markerSource = markerLayer.getSource();

  const markerClusterLayer = createClusterLayer(map, options);
  const layers = getDefaultLayers(lang, showLabels, locationCodes);
  layers.forEach((layer) => map.addLayer(layer));

  if (options.pubTran) {
    const pubTranLayer = createPubtranLayer(lang);
    map.addLayer(pubTranLayer);
  }

  map.addLayer(markerClusterLayer);
  map.addLayer(markerLayer);
};

/**
 * @param {MapBrowserEvent} evt event
 * @param {redux.Store} store store
 */
const handleMapClick = (evt, store) => {
  const {map, pixel} = evt;
  const state = /**@type {State}*/ (store.getState());
  const getMainFeatureAtPixelFn = state.requiredOpts.getMainFeatureAtPixelId
    ? GET_MAIN_FEATURE_AT_PIXEL_STORE[
        state.requiredOpts.getMainFeatureAtPixelId
      ]
    : getMainFeatureAtPixel;

  let result;
  const featureWithLayer = getMainFeatureAtPixelFn(map, pixel);
  if (featureWithLayer) {
    const layer = featureWithLayer.layer;
    const isClickable = /** @type {isClickableFunction}*/ (
      layer.get('isFeatureClickable')
    );
    if (isClickable) {
      munimap_assert.assertFunction(isClickable);

      const handlerOpts = {
        feature: featureWithLayer.feature,
        map: map,
        pixel: pixel,
        selectedFeature: state.selectedFeature,
        clusterFacultyAbbr: state.requiredOpts.clusterFacultyAbbr,
      };
      if (isClickable(handlerOpts)) {
        const featureClickHandler = /** @type {featureClickHandlerFunction} */ (
          layer.get('featureClickHandler')
        );
        if (featureClickHandler) {
          munimap_assert.assertFunction(featureClickHandler);
          result = featureClickHandler(handlerOpts);
        }
      }
    }
  }
  if (result) {
    munimap_utils.isString(result)
      ? store.dispatch(
          actions.selected_feature_changed(/** @type {string}*/ (result))
        )
      : store.dispatch(
          actions.view_animation_requested(
            /** @type {AnimationRequestOptions}*/ (result)
          )
        );
  }
};

/**
 * @param {MapBrowserEvent} evt event
 * @param {redux.Store} store store
 */
const handlePointerMove = (evt, store) => {
  if (evt.dragging) {
    return;
  }

  const map = evt.map;
  const state = store.getState();
  const targetEl = TARGET_ELEMENTS_STORE[state.requiredOpts.targetId];
  const pixel = map.getEventPixel(evt.originalEvent);
  const getMainFeatureAtPixelFn = state.requiredOpts.getMainFeatureAtPixel
    ? GET_MAIN_FEATURE_AT_PIXEL_STORE[
        state.requiredOpts.getMainFeatureAtPixelId
      ]
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
        feature: feature,
        map: map,
        pixel: pixel,
        selectedFeature: state.selectedFeature,
        clusterFacultyAbbr: state.requiredOpts.clusterFacultyAbbr,
      };
      if (isClickable(handlerOpts)) {
        //const popupEl = munimap.bubble.OVERLAY.getElement();
        const popupEl = undefined;
        !munimap_utils.isDef(popupEl) || popupEl !== elAtPixel
          ? (targetEl.style.cursor = 'pointer')
          : (targetEl.style.cursor = '');
      } else {
        targetEl.style.cursor = '';
      }
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
 * @param {MapListenersOptions} options opts
 */
const attachMapListeners = (map, options) => {
  const {store, view} = options;

  map.once('rendercomplete', () => {
    store.dispatch(actions.map_initialized());
  });

  map.on('moveend', () => {
    store.dispatch(
      actions.ol_map_view_change({
        center: view.getCenter(),
        resolution: view.getResolution(),
        mapSize: map.getSize(),
      })
    );
  });

  map.on('click', (evt) => handleMapClick(evt, store));
  map.on('pointermove', (evt) => handlePointerMove(evt, store));
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
};

/**
 * Refresh styles for layers.
 * @param {State} state state
 * @param {Array<ol.layer.Base>} layers layers
 */
const refreshStyles = (state, layers) => {
  refreshBuildingStyle(state, layers);
  refreshBuildingLabelStyle(state, layers);
  refreshComplexStyle(state, layers);
  refreshMarkerStyle(state, layers);
  refreshClusterStyle(state, layers);
  refreshRoomStyle(state, layers);
  refreshRoomLabelStyle(state, layers);
  refreshActiveRoomStyle(state, layers);
  refreshActiveDoorStyle(state, layers);
  refreshActivePoiStyle(state, layers);

  if (state.requiredOpts.pubTran) {
    refreshPubtranStyle(layers);
  }
};

/**
 * Ensure update clusters in map.
 * @param {State} state state
 * @param {ol.Map} map map
 */
const ensureClusterUpdate = (state, map) => {
  if (!map) {
    return;
  }

  const oldBuildingsCount = map.get(MUNIMAP_PROPS_ID).buildingsCount;
  const newBuildingsCount = slctr.getLoadedBuildingsCount(state);

  if (newBuildingsCount !== oldBuildingsCount) {
    const requiredLabels = state.requiredOpts.labels;
    map.get(MUNIMAP_PROPS_ID).buildingsCount = newBuildingsCount;
    if (requiredLabels !== false) {
      const resolution = map.getView().getResolution();
      updateClusteredFeatures(resolution, requiredLabels);
    }
  }
};

/**
 * @param {HTMLDivElement} infoEl info element
 */
const initFloorSelect = (infoEl) => {
  const complexEl = document.createElement('div');
  const bldgEl = document.createElement('div');
  const floorEl = document.createElement('div');
  complexEl.className = 'munimap-complex';
  bldgEl.className = 'munimap-building';
  floorEl.className = 'munimap-floor';
  infoEl.appendChild(complexEl);
  infoEl.appendChild(bldgEl);
  infoEl.appendChild(floorEl);

  const customSelectEl = document.createElement('div');
  customSelectEl.className = 'munimap-floor-select';
  floorEl.appendChild(customSelectEl);
};

/**
 * @param {ol.Map} map map
 * @param {HTMLDivElement} infoEl info element
 * @param {redux.Store} reduxStore redux store
 */
const refreshInfoElement = (map, infoEl, reduxStore) => {
  const onClickItem = (actionCreator, opt_args) =>
    reduxStore.dispatch(actionCreator(opt_args));
  const state = reduxStore.getState();

  //must be in this order - visibility, floor select, position
  //position is computed from infoEl size that is influenced by vis+fl
  refreshElementVisibility(infoEl, state);
  refreshFloorSelect(
    infoEl,
    state.selectedFeature,
    state.requiredOpts.lang,
    onClickItem
  );
  refreshElementPosition(map, infoEl, state);
};

/**
 * @param {ErrorMessageOptions} options options
 */
const refreshErrorMessage = (options) => {
  const {invalidCodes, simpleScroll, errorMessage, munimapEl} = options;
  const {render, withMessage} = errorMessage;
  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;

  if (hasInvalidCodes || shouldBlockMap) {
    if (render === false) {
      removeErrorEl(munimapEl);
    } else {
      addEmptyErrorEl(options);
      if (withMessage === true || (hasInvalidCodes && withMessage === null)) {
        prependMessageToErrorEl(options);
      }
    }
  }
};

/**
 *
 * @param {ol.Map} map map
 * @param {AnimationRequestState} animationRequest requested view state
 */
const animate = (map, animationRequest) => {
  if (Object.values(animationRequest).every((i) => i === null)) {
    return;
  }

  const {center, resolution, duration, extent} = animationRequest;
  const view = map.getView();

  const previous = map.get(MUNIMAP_PROPS_ID).animationRequest;
  const condition =
    !previous ||
    previous.center !== center ||
    previous.extent !== extent ||
    previous.resolution !== resolution ||
    previous.duration !== duration;

  if (condition) {
    map.get(MUNIMAP_PROPS_ID).animationRequest = animationRequest;
    if (extent) {
      view.fit(extent, {duration, nearest: true});
    } else {
      const _center =
        center instanceof Point ? center.getCoordinates() : center;
      view.animate({center: _center, resolution, duration});
    }
  }
};

export {
  attachMapListeners,
  ensureBaseMap,
  addCustomControls,
  addLayers,
  toggleLoadingMessage,
  createFeatureStores,
  refreshStyles,
  ensureClusterUpdate,
  initFloorSelect,
  refreshInfoElement,
  refreshErrorMessage,
  animate,
};
