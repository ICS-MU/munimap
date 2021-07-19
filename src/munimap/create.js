/**
 * @module create
 */
import * as actions from './redux/action.js';
import * as munimap_assert from './assert/assert.js';
import * as munimap_interaction from './ui/interaction.js';
import * as munimap_lang from './lang/lang.js';
import * as munimap_load from './load.js';
import * as munimap_matomo from './matomo/matomo.js';
import * as munimap_utils from './utils/utils.js';
import * as munimap_view from './view.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import * as slctr from './redux/selector.js';
import Feature from 'ol/Feature';
import {INITIAL_STATE} from './conf.js';
import {Map, View} from 'ol';
import {defaults as control_defaults} from 'ol/control';
import {createStore} from './redux/store.js';
import {decorate as decorateCustomMarker} from './feature/marker.custom.js';
import {ofFeatures as extentOfFeatures} from './utils/extent.js';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.BaseLayer
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.size.Size
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("./conf.js").State} State
 * @typedef {import("ol/source/Source").AttributionLike} ol.AttributionLike
 * @typedef {import("ol/Collection").default} ol.Collection
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("./feature/marker.js").LabelFunction} MarkerLabelFunction
 */

/**
 * @typedef {Object} Options
 * @property {string} target
 * @property {number} [zoom]
 * @property {ol.coordinate.Coordinate} [center]
 * @property {Array.<string>|string} [zoomTo]
 * @property {Array.<string>|Array.<ol.Feature>} [markers]
 * @property {string} [lang]
 * @property {boolean} [loadingMessage]
 * @property {string} [baseMap]
 * @property {boolean} [mapLinks]
 * @property {boolean} [clusterFacultyAbbr]
 * @property {boolean} [labels]
 * @property {boolean} [locationCodes]
 * @property {boolean} [simpleScroll]
 * @property {MarkerLabelFunction} [markerLabel]
 * @property {boolean} [pubTran]
 */

/**
 * @typedef {Object} InitExtentOptions
 * @property {ol.extent.Extent|undefined} extent
 * @property {ol.size.Size} size
 * @property {ol.coordinate.Coordinate|undefined} center
 * @property {number|undefined} zoom
 * @property {number|undefined} resolution
 */

/**
 * @typedef {Object} MapListenersOptions
 * @property {redux.Store} store
 * @property {View} view
 * @property {function} createInvalidCodesInfo
 * @property {function} createLimitScrollInfo
 * @property {boolean} showLabels
 */

/**
 * @param {Options} options options
 * @param {Array<ol.Feature>} markers markers
 * @param {Array<ol.Feature>} zoomTo zoomTo
 * @return {View} view
 */
const calculateView = (options, markers, zoomTo) => {
  const target = document.getElementById(options.target);
  const center = ol_proj.transform(
    options.center || [16.605390495656977, 49.1986567194723],
    ol_proj.get('EPSG:4326'),
    ol_proj.get('EPSG:3857')
  );
  const zoom = options.zoom === undefined ? 13 : options.zoom;
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
      const extent = extentOfFeatures(zoomTo);
      if (options.zoom === undefined && options.center === undefined) {
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
        /** constrainResolution not exists in OL6 */
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
      } else if (options.center === undefined) {
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

/**
 * Load features by location codes or decorate custom markers.
 * @param {Array<string>|Array<ol.Feature>|undefined} featuresLike featuresLike
 * @param {Options} options options
 * @return {Promise<Array<ol.Feature|string>>} promise resolving with markers
 */
export const loadOrDecorateMarkers = async (featuresLike, options) => {
  const lang = options.lang;
  const arrPromises = []; // array of promises of features

  if (!Array.isArray(featuresLike)) {
    return [];
  } else {
    featuresLike.forEach((el) => {
      if (true) {
        arrPromises.push(
          new Promise((resolve, reject) => {
            if (el instanceof Feature) {
              decorateCustomMarker(el);
              resolve(el);
            } else if (munimap_utils.isString(el)) {
              munimap_load.featuresFromParam(el).then((results) => {
                resolve(results);
              });
            }
          })
        );
      } else {
        console.log('is optpoi');
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
  // munimap_assert.getMainFeatureAtPixel(options.getMainFeatureAtPixel);
  munimap_assert.markers(options.markers);
  // munimap_assert.layers(options.layers);
  munimap_assert.lang(options.lang);
  munimap_assert.baseMap(options.baseMap);
  munimap_assert.pubTran(options.pubTran);
  munimap_assert.locationCodes(options.locationCodes);
  munimap_assert.mapLinks(options.mapLinks);
  munimap_assert.labels(options.labels);
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
 *
 * @param {Options} options Options
 * @return {State} State
 */
const getInitialState = (options) => {
  const initialState = {
    ...INITIAL_STATE,
    requiredOpts: {
      ...INITIAL_STATE.requiredOpts,
      target: options.target,
    },
  };
  if (options.markers !== undefined) {
    initialState.requiredOpts.markers = options.markers;
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
    initialState.requiredOpts.markerLabel = options.markerLabel;
  }
  if (options.pubTran !== undefined) {
    initialState.requiredOpts.pubTran = options.pubTran;
  }

  return initialState;
};

/**
 * Attach listeners to Map.
 * @param {Map} map map
 * @param {MapListenersOptions} options opts
 */
const attachMapListeners = (map, options) => {
  const {
    store,
    view,
    createInvalidCodesInfo,
    createLimitScrollInfo,
    showLabels,
  } = options;

  map.once('rendercomplete', () => {
    if (createInvalidCodesInfo) {
      createInvalidCodesInfo();
    }
    if (createLimitScrollInfo) {
      createLimitScrollInfo();
    }
    store.dispatch(
      actions.map_rendered({
        map_size: map.getSize(),
      })
    );
  });

  map.on('moveend', () => {
    store.dispatch(
      actions.ol_map_view_change({
        center: view.getCenter(),
        resolution: view.getResolution(),
      })
    );
  });

  map.on('precompose', (evt) => {
    //get state
    //map prop
    const res = evt.frameState.viewState.resolution;
    store.dispatch(
      actions.map_precomposed({
        resolution: res,
      })
    );
  });
};

/**
 * @param {Options} options Options
 * @returns {Promise<Map>} initialized map
 */
export default (options) => {
  return new Promise((resolve, reject) => {
    /*------------------------- parse and assert options -----------------------*/
    assertOptions(options);
    /*------------------------------- matomo -----------------------------------*/
    munimap_matomo.sendEvent('map', 'create');
    munimap_matomo.sendEventForOptions(options);
    /*----------------------------- create redux store -------------------------*/
    const initialState = getInitialState(options);
    const store = createStore(initialState);

    store.dispatch(actions.create_munimap());

    let unsubscribeInit;
    let map;

    /*------------- create redux render function and subscribtion --------------*/
    const render = () => {
      const state = store.getState();

      const target = document.getElementById(options.target);

      let munimapEl = target.getElementsByClassName('munimap')[0];
      let infoEl = target.getElementsByClassName('ol-popup munimap-info')[0];
      if (munimapEl === undefined) {
        munimapEl = document.createElement('div');
        infoEl = document.createElement('div');
        munimapEl.className = 'munimap';
        infoEl.className = 'ol-popup munimap-info';
        munimapEl.appendChild(infoEl);
        target.appendChild(munimapEl);
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
          let createInvalidCodesInfo;
          let createLimitScrollInfo;
          const markers = slctr.getInitMarkers(state);
          const zoomTo = slctr.getInitZoomTo(state);
          const view = calculateView(state.requiredOpts, markers, zoomTo);
          map = new Map({
            controls: control_defaults({
              attributionOptions: {
                tipLabel: munimap_lang.getMsg(
                  munimap_lang.Translations.ATTRIBUTIONS,
                  state.requiredOpts.lang
                ),
              },
              rotate: false,
              zoomOptions: {
                zoomInTipLabel: munimap_lang.getMsg(
                  munimap_lang.Translations.ZOOM_IN,
                  state.requiredOpts.lang
                ),
                zoomOutTipLabel: munimap_lang.getMsg(
                  munimap_lang.Translations.ZOOM_OUT,
                  state.requiredOpts.lang
                ),
              },
            }),
            target: /**@type {HTMLElement}*/ (munimapEl),
            layers: [basemapLayer],
            view,
          });
          munimap_view.addControls(map, state.requiredOpts);

          if (state.requiredOpts.simpleScroll) {
            createLimitScrollInfo = munimap_interaction.limitScroll(
              map,
              munimapEl,
              state.requiredOpts.lang
            );
          }
          if (invalidCodes.length > 0) {
            const opts = {map, invalidCodes, lang: state.requiredOpts.lang};
            createInvalidCodesInfo = munimap_interaction.initInvalidCodesInfo(
              munimapEl,
              infoEl,
              opts
            );
          }

          attachMapListeners(map, {
            store,
            view,
            createInvalidCodesInfo,
            createLimitScrollInfo,
            showLabels: state.requiredOpts.labels,
          });

          munimap_view.addLayers(map, {
            markers,
            lang: state.requiredOpts.lang,
            muAttrs: slctr.getMuAttrs(state),
            clusterFacultyAbbr: state.requiredOpts.clusterFacultyAbbr,
            showLabels: state.requiredOpts.labels,
            locationCodes: state.requiredOpts.locationCodes,
            markerLabel: state.requiredOpts.markerLabel,
            pubTran: state.requiredOpts.pubTran,
          });
        }

        munimap_view.changeBaseMap(basemapLayer, map);

        if (state.clusterResolutionExceeded) {
          munimap_view.updateClusteredFeatures(
            map,
            state.resolution,
            state.requiredOpts.labels
          );
        }
      }
    };

    const returnFunction = () => {
      const state = store.getState();
      if (state.map_size !== null) {
        unsubscribeInit();
        resolve(map);
      }
    };
    render();
    store.subscribe(render);
    unsubscribeInit = store.subscribe(returnFunction);
  });
};
