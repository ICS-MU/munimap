/**
 * @module create
 */
import * as actions from './redux/action.js';
import * as munimap_assert from './assert/assert.js';
import * as munimap_interaction from './ui/interaction.js';
import * as munimap_lang from './lang/lang.js';
import * as munimap_load from './load.js';
import * as munimap_utils from './utils/utils.js';
import * as munimap_view from './view.js';
import * as slctr from './redux/selector.js';
import Feature from 'ol/Feature';
import {INITIAL_STATE, MUNIMAP_PROPS_ID} from './conf.js';
import {Map} from 'ol';
import {defaults as control_defaults} from 'ol/control';
import {createStore} from './redux/store.js';
import {decorate as decorateCustomMarker} from './feature/marker.custom.js';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol/layer/Base").default} ol.layer.BaseLayer
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol").View} ol.View
 * @typedef {import("ol/size").Size} ol.size.Size
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("./conf.js").State} State
 * @typedef {import("./conf.js").MapProps} MapProps
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
 * @property {ol.View} view
 * @property {function} createInvalidCodesInfo
 * @property {function} createLimitScrollInfo
 */

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
  if (options.zoom !== undefined) {
    initialState.requiredOpts.zoom = options.zoom;
  }
  if (options.center !== undefined) {
    initialState.requiredOpts.center = options.center;
  }

  return initialState;
};

/**
 * Attach listeners to Map.
 * @param {Map} map map
 * @param {MapListenersOptions} options opts
 */
const attachMapListeners = (map, options) => {
  const {store, view, createInvalidCodesInfo, createLimitScrollInfo} = options;

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
};

/**
 * @param {Options} options Options
 * @returns {Promise<Map>} initialized map
 */
export default (options) => {
  return new Promise((resolve, reject) => {
    assertOptions(options);

    const initialState = getInitialState(options);
    const store = createStore(initialState);

    store.dispatch(
      actions.send_to_matomo({
        category: 'map',
        action: 'create',
      })
    );
    store.dispatch(actions.send_to_matomo_for_opts(options));
    store.dispatch(actions.create_munimap());

    let unsubscribeInit;
    let map;

    /*------------ create redux render function and subscribtion -------------*/
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
          const view = slctr.calculateView(state);
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

          const mapProps = /**@type {MapProps}*/ ({
            currentRes: view.getResolution(),
          });
          map.set(MUNIMAP_PROPS_ID, mapProps);

          munimap_view.addControls(map, store, state.requiredOpts);

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

          munimap_view.updateClusteredFeatures(
            map,
            state.resolution,
            state.requiredOpts.labels
          );
        }

        munimap_view.ensureBaseMap(basemapLayer, map);
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
