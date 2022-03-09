/**
 * @module view/view
 */
import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import * as slctr from '../redux/selector.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import View from 'ol/View';
import {CLICK_HANDLER, IS_CLICKABLE} from '../layer/layer.js';
import {
  GET_MAIN_FEATURE_AT_PIXEL_STORE,
  TARGET_ELEMENTS_STORE,
} from '../create.js';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {Point} from 'ol/geom';
import {
  calculateParameters,
  inTooltipResolutionRange,
  isSuitableForTooltip,
} from './tooltip.js';
import {clearFloorBasedStores} from '../source/source.js';
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
import {
  create as createClusterLayer,
  getLayer as getClusterLayer,
} from '../layer/cluster.js';
import {createStore as createComplexStore} from '../source/complex.js';
import {createStore as createFloorStore} from '../source/floor.js';
import {create as createGeolocationLayer} from '../layer/geolocation.js';
import {
  createLayer as createIdentifyLayer,
  getLayer as getIdentifyLayer,
  refreshVisibility as refreshIdentifyLayerVisibility,
} from '../layer/identify.js';
import {createStore as createIdentifyStore} from '../source/identify.js';
import {create as createMarkerLayer} from '../layer/marker.js';
import {createStore as createMarkerStore} from '../source/marker.js';
import {createStore as createOptPoiStore} from '../source/optpoi.js';
import {create as createPubtranLayer} from '../layer/pubtran.stop.js';
import {createStore as createPubtranStore} from '../source/pubtran.stop.js';
import {createStore as createUnitStore} from '../source/unit.js';
import {ofFeatures as extentOfFeatures} from '../utils/extent.js';
import {getDefaultLayers} from '../layer/layer.js';
import {getMainFeatureAtPixel} from '../feature/feature.js';
import {getUid} from 'ol';
import {isCode as isFloorCode} from '../feature/floor.constants.js';
import {loadFloors} from '../load.js';
import {refreshActiveStyle as refreshActiveDoorStyle} from './door.js';
import {refreshStyle as refreshPubtranStyle} from './pubtran.stop.js';
import {updateClusteredFeatures} from './cluster.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol").View} ol.View
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/source/Vector").default} ol.source.Vector
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import('../conf.js').RequiredOptions} RequiredOptions
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("../feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("../conf.js").State} State
 * @typedef {import("../conf.js").ErrorMessageState} ErrorMessageState
 * @typedef {import("../conf.js").AnimationRequestState} AnimationRequestState
 * @typedef {import("../utils/range.js").RangeInterface} RangeInterface
 * @typedef {import("ol").MapBrowserEvent} MapBrowserEvent
 * @typedef {import("../feature/feature.js").isClickableFunction} isClickableFunction
 * @typedef {import("../feature/feature.js").featureClickHandlerFunction} featureClickHandlerFunction
 * @typedef {import("../conf.js").AnimationRequestOptions} AnimationRequestOptions
 * @typedef {import("ol/style/Style").StyleFunction} StyleFunction
 * @typedef {import("../redux/selector.js").AllStyleFunctionsResult} AllStyleFunctionsResult
 * @typedef {import("ol/events.js").EventsKey} EventsKey
 * @typedef {import("ol/view.js").AnimationOptions} AnimationOptions
 * @typedef {import("../view/tooltip.js").TooltipParams} TooltipParams
 * @typedef {import("react").Dispatch<TooltipParams>} DispatchTooltipParams
 */

/**
 * @typedef {Object} MapListenersOptions
 * @property {string} selectedFeature selected feature
 * @property {RequiredOptions} requiredOpts options
 * @property {boolean} isIdentifyEnabled isIdentifyEnabled
 */

/**
 * @typedef {Object} EnsureTooltipOptions
 * @property {string} selectedFeature selected feature
 * @property {string} lang language
 * @property {string} tooltipProps selected feature
 * @property {DispatchTooltipParams} setTooltipProps selected feature
 * @property {RequiredOptions} requiredOpts options
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
 * @typedef {Object} PointerMoveTimeoutOptions
 * @property {string} title title
 * @property {string} featureUid featureUid
 * @property {ol.coordinate.Coordinate} pixelInCoords pixelInCoords
 * @property {string} purposeTitle purposeTitle
 * @property {string} purposeGis purposeGis
 */

/**
 * @typedef {Object} InitExtentOptions
 * @property {ol.extent.Extent|undefined} extent extent
 * @property {ol.Size} size size
 * @property {ol.coordinate.Coordinate|undefined} center center
 * @property {number|undefined} zoom zoom
 * @property {number|undefined} resolution resolution
 */

/**
 * @type {Object<string, number>}
 */
const TIMEOUT_STORE = {};

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
  if (!map) {
    return;
  }

  const {isIdentifyEnabled} = options;
  const {targetId} = options.requiredOpts;
  const hasLayers = map.getLayers().getLength() > 1; //more than basemap
  const identifyLayer = getIdentifyLayer(map);

  if (hasLayers) {
    if (isIdentifyEnabled && !identifyLayer) {
      //munimap.reset
      map.addLayer(createIdentifyLayer(targetId));
    } else if (!isIdentifyEnabled && identifyLayer) {
      map.removeLayer(getIdentifyLayer(map));
    }
    return;
  }

  const {lang, labels, locationCodes, pubTran} = options.requiredOpts;
  const markerLayer = createMarkerLayer(options);
  const markerClusterLayer = createClusterLayer(map, options);
  const layers = getDefaultLayers(targetId, labels, locationCodes);
  layers.forEach((layer) => map.addLayer(layer));

  if (pubTran) {
    const pubTranLayer = createPubtranLayer(targetId, lang);
    map.addLayer(pubTranLayer);
  }

  map.addLayer(markerClusterLayer);
  map.addLayer(markerLayer);

  if (window.location.protocol === 'https:' || !PRODUCTION) {
    const geolocationLayer = createGeolocationLayer();
    map.addLayer(geolocationLayer);
  }

  if (isIdentifyEnabled) {
    map.addLayer(createIdentifyLayer(targetId));
  }
};

/**
 * @param {MapBrowserEvent} evt event
 * @param {redux.Dispatch} dispatch dispatch
 * @param {MapListenersOptions} options options
 */
const handleMapClick = (evt, dispatch, options) => {
  const {selectedFeature, isIdentifyEnabled} = options;
  const {getMainFeatureAtPixelId, clusterFacultyAbbr, identifyTypes, targetId} =
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
        targetId,
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
  if (featureWithLayer) {
    const feature = featureWithLayer.feature;
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
        targetId,
      };
      targetEl.style.cursor = isClickable(handlerOpts) ? 'pointer' : '';
    } else {
      targetEl.style.cursor = '';
    }
  } else {
    targetEl.style.cursor = '';
  }
};

/**
 * @param {MapBrowserEvent} evt event
 * @param {EnsureTooltipOptions} options options
 */
const ensureTooltip = (evt, options) => {
  const {selectedFeature, lang, tooltipProps, setTooltipProps} = options;
  const {
    targetId,
    getMainFeatureAtPixelId,
    tooltips: tooltipsEnabled,
    locationCodes,
  } = options.requiredOpts;
  const map = evt.map;
  const resolution = map.getView().getResolution();
  const pixel = map.getEventPixel(evt.originalEvent);
  const getMainFeatureAtPixelFn = getMainFeatureAtPixelId
    ? GET_MAIN_FEATURE_AT_PIXEL_STORE[getMainFeatureAtPixelId]
    : getMainFeatureAtPixel;

  const featureWithLayer = getMainFeatureAtPixelFn(map, pixel);
  if (featureWithLayer) {
    const feature = featureWithLayer.feature;
    const inTooltipResolutionRange_ = inTooltipResolutionRange(
      feature,
      resolution,
      selectedFeature
    );
    if (tooltipsEnabled && inTooltipResolutionRange_) {
      if (TIMEOUT_STORE[targetId]) {
        clearTimeout(TIMEOUT_STORE[targetId]);
        delete TIMEOUT_STORE[targetId];
        if (tooltipProps) {
          setTooltipProps(null);
        }
      }

      if (isSuitableForTooltip(feature)) {
        const opts = {
          title: feature.get('typ'),
          featureUid: getUid(feature),
          pixelInCoords: map.getCoordinateFromPixel(pixel),
          purposeTitle: feature.get('ucel_nazev'),
          purposeGis: feature.get('ucel_gis'),
          resolution,
          lang,
          locationCodes,
          targetId,
        };
        TIMEOUT_STORE[targetId] = setTimeout(
          () => setTooltipProps(calculateParameters(opts)),
          750
        );
      }
    } else if (!inTooltipResolutionRange_ && tooltipProps) {
      setTooltipProps(null);
    }
  } else {
    if (TIMEOUT_STORE[targetId]) {
      clearTimeout(TIMEOUT_STORE[targetId]);
      delete TIMEOUT_STORE[targetId];
    }
    if (tooltipProps) {
      setTooltipProps(null);
    }
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
  const state = reduxStore.getState();
  const targetId = state.requiredOpts.targetId;
  const callbackFn = (actionCreator, opt_args) =>
    reduxStore.dispatch(actionCreator(opt_args));

  createBuildingStore(targetId, callbackFn);
  createMarkerStore(targetId);
  createComplexStore(targetId);
  createUnitStore(targetId);
  createFloorStore(targetId);
  createRoomStore(targetId);
  createDefaultRoomStore(targetId, callbackFn);
  createActiveRoomStore(reduxStore, targetId, callbackFn);
  createDoorStore(targetId);
  createActiveDoorStore(reduxStore, targetId, callbackFn);
  createPoiStore(targetId);
  createActivePoiStore(reduxStore, targetId, callbackFn);
  createOptPoiStore(targetId);

  if (state.requiredOpts.pubTran) {
    createPubtranStore(targetId);
  }
  if (state.requiredOpts.identifyCallbackId) {
    createIdentifyStore(targetId);
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
 * @param {string} options.targetId targetId
 * @param {number} options.buildingsCount buildings count
 */
const ensureClusterUpdate = (map, {targetId, labels, buildingsCount}) => {
  if (!map) {
    return;
  }

  const oldBuildingsCount = map.get(MUNIMAP_PROPS_ID).buildingsCount;
  const newBuildingsCount = buildingsCount;
  const clusterLayer = getClusterLayer(map);
  const isSourceEmpty =
    clusterLayer && clusterLayer.getSource().getFeatures().length === 0;

  if (newBuildingsCount !== oldBuildingsCount || isSourceEmpty) {
    map.get(MUNIMAP_PROPS_ID).buildingsCount = newBuildingsCount;
    if (labels !== false) {
      const resolution = map.getView().getResolution();
      updateClusteredFeatures(targetId, resolution, labels);
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
 * @param {function(boolean): void} [opt_callback] callback
 */
const animate = (map, animationRequest, opt_callback) => {
  if (!map || Object.values(animationRequest[0]).every((i) => i === null)) {
    return;
  }

  const view = map.getView();
  animationRequest.forEach((animationReqItem) => {
    if (Array.isArray(animationReqItem)) {
      opt_callback
        ? view.animate(
            ...animationReqItem.map((item) =>
              createAnimationOptions_(view, item)
            ),
            opt_callback
          )
        : view.animate(
            ...animationReqItem.map((item) =>
              createAnimationOptions_(view, item)
            )
          );
    } else {
      const {extent, duration} = animationReqItem;
      extent
        ? view.fit(extent, {duration, callback: opt_callback})
        : opt_callback
        ? view.animate(
            createAnimationOptions_(view, animationReqItem),
            opt_callback
          )
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

/**
 * @param {string} targetId targetId
 * @param {State} newState new state
 * @param {redux.Dispatch} asyncDispatch async dispatch
 * @return {string|null|undefined} selected feature
 */
const handleMapViewChange = (targetId, newState, asyncDispatch) => {
  let selectedFeature;
  const locationCode = slctr.getSelectedLocationCode(newState);
  if (locationCode !== undefined) {
    //null is valid value
    if (locationCode !== null) {
      //set to variable - it can be building/floor code
      selectedFeature = locationCode;
      const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
      loadFloors(targetId, where).then((floors) =>
        asyncDispatch(actions.floors_loaded(isFloorCode(locationCode)))
      );
    } else {
      //deselect feature from state
      selectedFeature = null;
      clearFloorBasedStores(targetId);
    }
  }
  return selectedFeature;
};

/**
 * @param {string} targetId targetId
 * @param {ol.coordinate.Coordinate} requiredCenter required center
 * @param {number} requiredZoom required zoom
 * @param {Array<ol.Feature>} markers markers
 * @param {Array<ol.Feature>} zoomTo zoomTo
 * @return {ol.View} view
 */
const createMapView = (
  targetId,
  requiredCenter,
  requiredZoom,
  markers,
  zoomTo
) => {
  const target = TARGET_ELEMENTS_STORE[targetId];
  const center = ol_proj.transform(
    requiredCenter || [16.605390495656977, 49.1986567194723],
    ol_proj.get('EPSG:4326'),
    ol_proj.get('EPSG:3857')
  );
  const zoom = requiredZoom === null ? 13 : requiredZoom;
  const view = new View({
    center: center,
    maxZoom: 23,
    minZoom: 0,
    zoom: zoom,
    constrainResolution: true,
  });
  const initExtentOpts = /**@type {InitExtentOptions}*/ ({});
  if (zoomTo || markers) {
    zoomTo = zoomTo.length ? zoomTo : markers;
    if (zoomTo.length) {
      let res;
      const extent = extentOfFeatures(zoomTo, targetId);
      if (requiredZoom === null && requiredCenter === null) {
        if (target.offsetWidth === 0 || target.offsetHeight === 0) {
          view.fit(extent);
        } else {
          view.fit(extent, {
            size: [target.offsetWidth, target.offsetHeight],
          });
          res = view.getResolution();
          munimap_assert.assert(res);
          ol_extent.buffer(extent, res * 30, extent);
          view.fit(extent, {
            size: [target.offsetWidth, target.offsetHeight],
          });
          initExtentOpts.extent = extent;
          initExtentOpts.size = [target.offsetWidth, target.offsetHeight];
        }
        /** constrainResolution not exists in OL6, */
        /** use view.getConstrainedResolution(resolution), */
        /** https://github.com/openlayers/openlayers/pull/9137 */
        // if (munimap.marker.custom.isCustom(zoomTo[0])) {
        //   if (view.getResolution() < munimap.floor.RESOLUTION.max) {
        //     res = view.constrainResolution(
        //       munimap.floor.RESOLUTION.max,
        //       undefined,
        //       1
        //     );
        //     initExtentOpts.resolution = res;
        //     view.setResolution(res);
        //   }
        // }
      } else if (requiredCenter === null) {
        initExtentOpts.center = ol_extent.getCenter(extent);
        view.setCenter(ol_extent.getCenter(extent));
      }
    } else {
      initExtentOpts.center = center;
      initExtentOpts.zoom = zoom;
    }
  }
  view.set('initExtentOpts', initExtentOpts, true);
  return view;
};

export {
  animate,
  attachIndependentMapListeners,
  attachDependentMapListeners,
  createFeatureStores,
  createMapView,
  ensureBaseMap,
  ensureClusterUpdate,
  ensureLayers,
  ensureTooltip,
  handleMapViewChange,
  refreshStyles,
  refreshVisibility,
};
