/**
 * @module create
 */
import * as actions from './redux/action.js';
import * as munimap_assert from './assert/assert.js';
import * as munimap_interaction from './ui/interaction.js';
import * as munimap_load from './load.js';
import * as munimap_utils from './utils/utils.js';
import * as munimap_view from './view/view.js';
import * as slctr from './redux/selector.js';
import Feature from 'ol/Feature';
import {INITIAL_STATE, MUNIMAP_PROPS_ID} from './conf.js';
import {Map} from 'ol';
import {addPoiDetail} from './feature/room.js';
import {createStore} from './redux/store.js';
import {decorate as decorateCustomMarker} from './feature/marker.custom.js';
import {isCtgUid as isOptPoiCtgUid} from './feature/optpoi.js';
import {isCode as isRoomCode} from './feature/room.js';
import {markerLabel as optPoiMarkerLabel} from './style/optpoi.js';
import {v4 as uuidv4} from 'uuid';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.BaseLayer
 * @typedef {import("ol").View} ol.View
 * @typedef {import("ol/size").Size} ol.size.Size
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("./conf.js").State} State
 * @typedef {import("./conf.js").MapProps} MapProps
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("./feature/marker.js").LabelFunction} MarkerLabelFunction
 * @typedef {import("./feature/feature.js").getMainFeatureAtPixelFunction} getMainFeatureAtPixelFunction
 */

/**
 * @typedef {Object} Options
 * @property {string|HTMLElement} target target
 * @property {number} [zoom] zoom
 * @property {ol.coordinate.Coordinate} [center] center
 * @property {Array<string>|string} [zoomTo] zoom to
 * @property {Array<string>|Array<Feature>} [markers] markers
 * @property {string} [lang] language
 * @property {boolean} [loadingMessage] loading message
 * @property {string} [baseMap] basemap
 * @property {boolean} [mapLinks] maplinks
 * @property {boolean} [clusterFacultyAbbr] cluster faculty abbreviations
 * @property {boolean} [labels] labels
 * @property {boolean} [locationCodes] location codes
 * @property {boolean} [simpleScroll] simple scroll
 * @property {MarkerLabelFunction} [markerLabel] marker label function
 * @property {boolean} [pubTran] public transportation stops
 * @property {Array<string>} [poiFilter] poi filter
 * @property {Array<string>} [markerFilter] marker filter
 * @property {getMainFeatureAtPixelFunction} [getMainFeatureAtPixel] getMainFeatureAtPixel function
 */

/**
 * @typedef {Object} LoadOrDecorateMarkersOptions
 * @property {Array<string>} [poiFilter] poi filter
 * @property {Array<string>} [markerFilter] marker filter
 * @property {string} [lang] language
 * @property {string} targetId target
 */

/**
 * @typedef {Object} InitExtentOptions
 * @property {ol.extent.Extent|undefined} extent extent
 * @property {ol.size.Size} size size
 * @property {ol.coordinate.Coordinate|undefined} center center
 * @property {number|undefined} zoom zoom
 * @property {number|undefined} resolution resolution
 */

/**
 * @typedef {Object} MapListenersOptions
 * @property {redux.Store} store store
 * @property {ol.View} view view
 */

/**
 * @type {Object<string, Feature>}
 */
export const REQUIRED_CUSTOM_MARKERS = {};

/**
 * @type {Object<string, MarkerLabelFunction>}
 */
export const MARKER_LABEL_STORE = {};

/**
 * @type {Object<string, Map>}
 */
export const CREATED_MAPS = {};

/**
 * @type {Object<string, HTMLElement>}
 */
export const TARGET_ELEMENTS_STORE = {};

/**
 * @type {Object<string, getMainFeatureAtPixelFunction>}
 */
export const GET_MAIN_FEATURE_AT_PIXEL_STORE = {};

/**
 * Load features by location codes or decorate custom markers.
 * @param {Array<string>|Array<Feature>|undefined} featuresLike featuresLike
 * @param {LoadOrDecorateMarkersOptions} options options
 * @return {Promise<Array<Feature|string>>} promise resolving with markers
 */
export const loadOrDecorateMarkers = async (featuresLike, options) => {
  const lang = options.lang;
  const arrPromises = []; // array of promises of features
  let workplaces = [];

  if (options.markerFilter !== null) {
    workplaces = options.markerFilter.map((el) => el);
  }

  if (!Array.isArray(featuresLike)) {
    return [];
  } else {
    featuresLike.forEach((el) => {
      if (!isOptPoiCtgUid(el)) {
        arrPromises.push(
          new Promise((resolve, reject) => {
            if (REQUIRED_CUSTOM_MARKERS[el]) {
              decorateCustomMarker(REQUIRED_CUSTOM_MARKERS[el]);
              resolve(REQUIRED_CUSTOM_MARKERS[el]);
            } else if (munimap_utils.isString(el)) {
              munimap_load.featuresFromParam(el).then((results) => {
                resolve(results);
              });
            }
          })
        );
      } else {
        const arrPoi = [el];
        const ctgIds = arrPoi.map((ctguid) => ctguid.split(':')[1]);
        let roomCodes = [];
        arrPromises.push(
          munimap_load
            .loadOptPois({
              ids: ctgIds,
              workplaces: workplaces,
              poiFilter: options.poiFilter,
            })
            .then((features) => {
              const rooms = features.filter((f) => {
                const lc = /**@type {string}*/ (f.get('polohKodLokace'));
                munimap_assert.assertString(lc);

                return !options.poiFilter
                  ? isRoomCode(lc)
                  : options.poiFilter.some(
                      (poiFilter) =>
                        isRoomCode(lc) && f.get('poznamka') === poiFilter
                    );
              });
              roomCodes = rooms.map((f) => f.get('polohKodLokace'));

              if (ctgIds.length === 1) {
                MARKER_LABEL_STORE[`OPT_POI_MARKER_LABEL_${options.targetId}`] =
                  optPoiMarkerLabel(ctgIds[0], roomCodes, lang);
              }

              return new Promise((resolve, reject) => {
                munimap_load.featuresFromParam(roomCodes).then((values) => {
                  resolve(addPoiDetail(values, features, lang));
                });
              });
            })
        );
      }
    });

    let markers = await Promise.all(arrPromises);
    // reduce array of arrays to 1 array
    markers = markers.reduce((a, b) => {
      a = a.concat(b);
      munimap_utils.removeArrayDuplicates(a);
      return a;
    }, []);
    return markers;
  }
};

/**
 * @param {Options} options opts
 */
const assertOptions = (options) => {
  munimap_assert.target(options.target);
  munimap_assert.assert(
    options.zoom === undefined || options.zoomTo === undefined,
    "Zoom and zoomTo options can't be defined together."
  );
  munimap_assert.assert(
    options.center === undefined || options.zoomTo === undefined,
    "Center and zoomTo options can't be defined together."
  );
  munimap_assert.zoom(options.zoom);
  munimap_assert.zoomTo(options.zoomTo);
  munimap_assert.getMainFeatureAtPixel(options.getMainFeatureAtPixel);
  munimap_assert.markers(options.markers);
  // munimap_assert.layers(options.layers);
  munimap_assert.lang(options.lang);
  munimap_assert.baseMap(options.baseMap);
  munimap_assert.pubTran(options.pubTran);
  munimap_assert.locationCodes(options.locationCodes);
  munimap_assert.mapLinks(options.mapLinks);
  munimap_assert.labels(options.labels);
  munimap_assert.markerFilter(options.markerFilter);
  munimap_assert.poiFilter(options.poiFilter);
  // munimap_assert.identifyTypes(options.identifyTypes);
  // munimap_assert.identifyCallback(options.identifyCallback);
  // if (
  //   munimap_utils.isDef(options.identifyTypes) &&
  //   !munimap_utils.isDef(options.identifyCallback)
  // ) {
  //   goog.asserts.fail(
  //     'IdentifyTypes must be defined together with identifyCallback.'
  //   );
  // }
};

/**
 * @param {Options} options options
 * @return {string} id in store
 */
const addTargetElementToStore = (options) => {
  const targetEl = munimap_utils.isElement(options.target)
    ? /** @type {HTMLElement}*/ (options.target)
    : document.getElementById(/** @type {string}*/ (options.target));
  const targetId =
    targetEl.id && targetEl.id.length > 0 ? targetEl.id : uuidv4();

  TARGET_ELEMENTS_STORE[targetId] = targetEl;

  return targetId;
};

/**
 * @param {Options} options Options
 * @param {string} targetId id in store
 * @return {State} State
 */
const getInitialState = (options, targetId) => {
  const initialState = {
    ...INITIAL_STATE,
    requiredOpts: {
      ...INITIAL_STATE.requiredOpts,
      targetId: targetId,
    },
  };
  if (options.markers !== undefined) {
    const reqMarkers = /** @type {Array<string>}*/ ([]);
    options.markers.forEach((marker, idx) => {
      if (marker instanceof Feature) {
        const id = `CUSTOM_MARKER_${targetId}_${idx}`;
        REQUIRED_CUSTOM_MARKERS[id] = marker;
        reqMarkers.push(id);
      } else {
        reqMarkers.push(marker);
      }
    });

    initialState.requiredOpts.markerIds = reqMarkers;
  }
  if (options.zoomTo !== undefined) {
    initialState.requiredOpts.zoomTo = options.zoomTo;
  }
  if (options.lang !== undefined) {
    initialState.requiredOpts.lang = options.lang;
  }
  if (options.loadingMessage !== undefined) {
    initialState.requiredOpts.loadingMessage = options.loadingMessage;
  }
  if (options.baseMap !== undefined) {
    initialState.requiredOpts.baseMap = options.baseMap;
  }
  if (options.mapLinks !== undefined) {
    initialState.requiredOpts.mapLinks = options.mapLinks;
  }
  if (options.clusterFacultyAbbr !== undefined) {
    initialState.requiredOpts.clusterFacultyAbbr = options.clusterFacultyAbbr;
  }
  if (options.labels !== undefined) {
    initialState.requiredOpts.labels = options.labels;
  }
  if (options.locationCodes !== undefined) {
    initialState.requiredOpts.locationCodes = options.locationCodes;
  }
  if (options.simpleScroll !== undefined) {
    initialState.requiredOpts.simpleScroll = options.simpleScroll;
  }
  if (options.markerLabel !== undefined) {
    const id = `REQUIRED_MARKER_LABEL_${targetId}`;
    MARKER_LABEL_STORE[id] = options.markerLabel;
    initialState.requiredOpts.markerLabelId = id;
  }
  if (options.pubTran !== undefined) {
    initialState.requiredOpts.pubTran = options.pubTran;
  }
  if (options.zoom !== undefined) {
    initialState.requiredOpts.zoom = options.zoom;
  }
  if (options.center !== undefined) {
    initialState.requiredOpts.center = options.center;
  }
  if (options.poiFilter !== undefined) {
    initialState.requiredOpts.poiFilter = options.poiFilter;
  }
  if (options.markerFilter !== undefined) {
    initialState.requiredOpts.markerFilter = options.markerFilter;
  }
  if (options.getMainFeatureAtPixel !== undefined) {
    const id = `GET_MAIN_FEATURE_AT_PIXEL_${targetId}`;
    GET_MAIN_FEATURE_AT_PIXEL_STORE[id] = options.getMainFeatureAtPixel;
    initialState.requiredOpts.getMainFeatureAtPixelId = id;
  }

  return initialState;
};

/**
 * @param {Options} options Options
 * @return {Promise<Map>} initialized map
 */
export default (options) => {
  return new Promise((resolve, reject) => {
    assertOptions(options);

    const targetId = addTargetElementToStore(options);
    const initialState = getInitialState(options, targetId);
    const store = createStore(initialState);

    munimap_view.createFeatureStores(store);
    store.dispatch(
      actions.create_munimap({
        mapLinks: options.mapLinks,
        pubTran: options.pubTran,
        baseMap: options.baseMap,
        // identifyTypes: options.identifyTypes,
        // identifyCallback: options.identifyCallback
      })
    );

    let unsubscribeInit;
    let map;

    /*------------ create redux render function and subscribtion -------------*/
    const render = () => {
      const state = /**@type {State}*/ (store.getState());

      const targetEl = /** @type {HTMLElement}*/ (
        TARGET_ELEMENTS_STORE[state.requiredOpts.targetId]
      );

      let munimapEl = /**@type {HTMLDivElement}*/ (
        targetEl.getElementsByClassName('munimap')[0]
      );
      let infoEl = /**@type {HTMLDivElement}*/ (
        targetEl.getElementsByClassName('ol-popup munimap-info')[0]
      );
      if (munimapEl === undefined) {
        munimapEl = /**@type {HTMLDivElement}*/ (document.createElement('div'));
        infoEl = /**@type {HTMLDivElement}*/ (document.createElement('div'));
        munimapEl.className = 'munimap';
        infoEl.className = 'ol-popup munimap-info';
        infoEl.style.zIndex = '2';
        munimapEl.appendChild(infoEl);
        targetEl.appendChild(munimapEl);
      }

      const addMsg = slctr.toggleLoadingMessage(state);
      if (addMsg !== null) {
        munimap_view.toggleLoadingMessage(
          addMsg,
          munimapEl,
          state.requiredOpts.lang
        );
      }

      if (slctr.areMarkersLoaded(state) && slctr.areZoomToLoaded(state)) {
        const invalidCodes = slctr.getInvalidCodes(state);
        const basemapLayer = slctr.getBasemapLayer(state);
        if (map === undefined) {
          const markers = slctr.getInitMarkers(state);
          const view = slctr.calculateView(state);
          const defaultControls = slctr.getDefaultControls(state);
          map = new Map({
            controls: defaultControls,
            target: munimapEl,
            layers: [basemapLayer],
            view,
          });

          const mapProps = /**@type {MapProps}*/ ({
            currentRes: view.getResolution(),
            buildingsCount: slctr.getLoadedBuildingsCount(state),
          });
          map.set(MUNIMAP_PROPS_ID, mapProps);
          CREATED_MAPS[state.requiredOpts.targetId] = map;

          munimap_view.addCustomControls(map, store, state.requiredOpts);
          munimap_view.attachMapListeners(map, {store, view});

          munimap_view.addLayers(map, {
            markers,
            lang: state.requiredOpts.lang,
            muAttrs: slctr.getMuAttrs(state),
            clusterFacultyAbbr: state.requiredOpts.clusterFacultyAbbr,
            showLabels: state.requiredOpts.labels,
            locationCodes: state.requiredOpts.locationCodes,
            markerLabel: MARKER_LABEL_STORE[state.requiredOpts.markerLabelId],
            pubTran: state.requiredOpts.pubTran,
            clusterResolution: slctr.getClusterResolution(state),
          });
          munimap_view.initFloorSelect(infoEl);
        }

        munimap_view.refreshErrorMessage({
          invalidCodes,
          lang: state.requiredOpts.lang,
          simpleScroll: state.requiredOpts.simpleScroll,
          munimapEl,
          infoEl,
          errorMessage: state.errorMessage,
          store,
        });

        munimap_view.ensureClusterUpdate(state, map);
        munimap_view.ensureBaseMap(basemapLayer, map);
        munimap_view.refreshStyles(state, map.getLayers().getArray());
        munimap_view.refreshInfoElement(map, infoEl, store);
        munimap_view.animate(map, state.animationRequest);
      }
    };

    const returnFunction = () => {
      const state = store.getState();
      if (state.mapInitialized === true) {
        unsubscribeInit();
        resolve(map);
      }
    };
    render();
    store.subscribe(render);
    unsubscribeInit = store.subscribe(returnFunction);
  });
};
