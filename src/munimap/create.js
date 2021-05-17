import * as actions from './action.js';
import * as munimap_assert from './assert.js';
import * as munimap_building from './building.js';
import * as munimap_interaction from './interaction.js';
import * as munimap_lang from './lang.js';
import * as munimap_load from './load.js';
import * as munimap_utils from './utils.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import * as slctr from './selector.js';
import Feature from 'ol/Feature';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import Timer from 'timer.js';
import {INITIAL_STATE} from './conf.js';
import {Map, View} from 'ol';
import {createStore} from './store.js';
import {decorate as decorateCustomMarker} from './markerCustom.js';
import {ofFeatures as extentOfFeatures} from './extent.js';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.size.Size
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("./conf.js").State} State
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
 * @param {Options} options options
 * @param {Array<ol.Feature>} markers markers
 * @param {Array<ol.Feature>} zoomTos zoomTos
 * @return {View} view
 */
const calculateView = (options, markers, zoomTos) => {
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
  });
  const initExtentOpts = /**@type {InitExtentOptions}*/ ({});
  if (zoomTos || markers) {
    zoomTos = zoomTos.length ? zoomTos : markers;
    if (zoomTos.length) {
      let res;
      const extent = extentOfFeatures(zoomTos);
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
        // if (munimap.marker.custom.isCustom(zoomTos[0])) {
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
 * @return {Promise<{
 *    markers: Array<ol.Feature|string>,
 *    invalidMarkerIndexes: Array<number>,
 *  }>} promise resolving with markers
 */
const loadOrDecorateMarkers = async (featuresLike, options) => {
  const lang = options.lang;
  const arrPromises = []; // array of promises of features
  const invalidMarkerIndexes = [];

  if (!Array.isArray(featuresLike)) {
    return {markers: [], invalidMarkerIndexes: []};
  } else {
    featuresLike.forEach((el) => {
      if (true) {
        arrPromises.push(
          new Promise((resolve, reject) => {
            if (el instanceof Feature) {
              decorateCustomMarker(el);
              resolve(el);
            } else if (munimap_utils.isString(el)) {
              munimap_load.featuresFromParam(el).then(function (results) {
                if (results.length > 0) {
                  resolve(results);
                } else {
                  resolve('ERROR');
                }
              });
            }
          })
        );
      } else {
        console.log('is optpoi');
      }
    });

    let markers = await Promise.all(arrPromises);
    markers.forEach((value, idx) => {
      if (value === 'ERROR') {
        invalidMarkerIndexes.push(idx);
      }
    });
    // reduce array of arrays to 1 array
    markers = markers.reduce((a, b) => {
      a = a.concat(b);
      munimap_utils.removeArrayDuplicates(a);
      return a;
    }, []);

    return {markers, invalidMarkerIndexes};
  }
};

/**
 * @param {Element} target target
 * @param {string} lang language
 */
const addLoadingMessage = (target, lang) => {
  const messageDiv = document.createElement('div');
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
 * @param {State} state Redux state
 * @param {Element} target target element
 */
const removeLoadingMessage = (state, target) => {
  const id = target.id.toString();
  const messageEl = document.getElementById(`message_${id}`);

  if (!state.loadingMessage && !!messageEl) {
    document.getElementById(`message_${id}`).remove();
    document.getElementById(`message_${id}_style`).remove();
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
  // munimap_assert.baseMap(options.baseMap);
  // munimap_assert.pubTran(options.pubTran);
  // munimap_assert.locationCodes(options.locationCodes);
  // munimap_assert.mapLinks(options.mapLinks);
  // munimap_assert.labels(options.labels);
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
 * Check the options and remove invalid values.
 * @param {Array.<string>|Array.<ol.Feature>|undefined} featuresLike featuresLike
 * @return {Array.<string>} an array of codes in wrong text format
 */
const filterInvalidCodeExpressions = (featuresLike) => {
  const invalidCodes = [];
  const indexesOfInvalidCodes = [];

  if (featuresLike) {
    featuresLike.forEach((featureLike, index) => {
      if (munimap_utils.isString(featureLike)) {
        if (
          !munimap_building.isCodeOrLikeExpr(featureLike)
          /*(munimap.building.isCodeOrLikeExpr(featuresLike[m]) === false) &&
        (munimap.room.isCodeOrLikeExpr(featuresLike[m]) === false) &&
        (munimap.door.isCodeOrLikeExpr(featuresLike[m]) === false) &&
        (munimap.optpoi.isCtgUid(featuresLike[m]) === false) &&
        (featuresLike[m] instanceof ol.Feature === false))*/
        ) {
          invalidCodes.push(featureLike);
          indexesOfInvalidCodes.push(index);
        }
      }
    });
    indexesOfInvalidCodes.reverse();
    for (let n = 0; n < invalidCodes.length; n++) {
      featuresLike.splice(indexesOfInvalidCodes[n], 1);
    }
  }
  return invalidCodes;
};

/**
 * 
 * @param {Options} options opts
 * @param {Array<ol.Feature|string>} markers markers
 * @param {Array<number>} invalidMarkerIndexes idxs
 * @return {Array<string>} invalid codes
 */
const filterInvalidMarkerCodes = (options, markers, invalidMarkerIndexes) => {
  const invalidMarkerCodes = [];
  const invalidFeaturesIndexes = [];

  markers.forEach((feature, idx) => {
    if (feature === 'ERROR') {
      invalidFeaturesIndexes.push(idx);
    }
  });

  invalidFeaturesIndexes.reverse();
  invalidFeaturesIndexes.forEach((fIndex) => markers.splice(fIndex, 1));

  invalidMarkerIndexes.reverse();
  invalidMarkerIndexes.forEach((mIndex) => {
    invalidMarkerCodes.push(options.markers[mIndex]);
    options.markers.splice(mIndex, 1);
  });

  if (invalidMarkerCodes.length) {
    console.log(
      `Features not found in the database: ${invalidMarkerCodes.join(', ')}`
    );
  }
  return invalidMarkerCodes;
};

/**
 *
 * @param {State} state redux state
 * @param {{
 *    createInvalidCodesInfo: function,
 *    map: Map,
 *    munimapEl: Element,
 *    infoEl: Element
 *  }} options options
 */
const toggleInvalidCodesInfo = (state, options) => {
  const {createInvalidCodesInfo, map, munimapEl, infoEl} = options;
  const {invalidCodes, createDragEl} = state.invalidCodesInfo;
  if (createDragEl === undefined) {
    return;
  }

  if (invalidCodes.length) {
    createInvalidCodesInfo();
  } else {
    const dragEl = document.getElementById('munimap-error');
    if (dragEl) {
      dragEl.remove();
      infoEl.classList.remove('munimap-info-hide');
    }
    //re-render map => openlayers remove the error message by re-rendering map
    createDragEl ? munimap_interaction.createDragEl(munimapEl) : map.render();
  }
};

/**
 * @param {Options} options Options
 * @returns {Promise<Map>} initialized map
 */
export default async (options) => {
  munimap_assert.assert(
    munimap_utils.isDefAndNotNull(options.target) &&
      munimap_utils.isString(options.target),
    'Target must be a string!'
  );
  assertOptions(options);

  const target = document.getElementById(options.target);
  options.lang = options.lang || munimap_lang.Abbr.CZECH;

  if (options.loadingMessage === undefined) {
    options.loadingMessage = true;
  }
  if (options.loadingMessage) {
    addLoadingMessage(target, options.lang);
  }

  let zoomToStrings;
  let markerStrings;
  if (options.zoomTo && options.zoomTo.length) {
    zoomToStrings = /** @type {Array.<string>} */ (typeof options.zoomTo ===
      'string' || options.zoomTo instanceof String
      ? [options.zoomTo]
      : options.zoomTo);
  } else {
    zoomToStrings = [];
  }

  if (options.markers && options.markers.length) {
    munimap_assert.assertArray(options.markers);
    munimap_utils.removeArrayDuplicates(options.markers);
    markerStrings = /** @type {Array.<string>} */ (options.markers);
  } else {
    markerStrings = /** @type {Array.<string>} */ ([]);
  }

  let invalidMarkerCodes = filterInvalidCodeExpressions(options.markers);
  const {markers, invalidMarkerIndexes} = await loadOrDecorateMarkers(
    options.markers,
    options
  );

  invalidMarkerCodes = invalidMarkerCodes.concat(
    filterInvalidMarkerCodes(options, markers, invalidMarkerIndexes)
  );
  invalidMarkerCodes.sort();
  munimap_assert.assertMarkerFeatures(markers);

  const zoomTos = zoomToStrings.length
    ? await munimap_load.featuresFromParam(zoomToStrings)
    : [];
  const map_size = /** @type {ol.size.Size} */ ([800, 400]);
  const view = calculateView(
    options,
    /**@type {Array<ol.Feature>}*/ (markers),
    zoomTos
  );

  // redux-related
  const initialState = {
    ...INITIAL_STATE,
    map_size,
    center: view.getCenter(),
    zoom: view.getZoom(),
    zoomTos: zoomToStrings,
    markers: markerStrings,
    loadingMessage: options.loadingMessage,
    lang: options.lang,
  };
  const store = createStore(initialState);

  // map-related
  const timer = new Timer();
  const handleViewChange = () => {
    timer.start(0.1);
  };
  const handleTimerEnd = () => {
    store.dispatch(
      actions.ol_map_view_change({
        center: view.getCenter(),
        center_proj: 'EPSG:3857',
        zoom: view.getZoom(),
      })
    );
  };
  timer.on('end', handleTimerEnd);
  const attach_view_events = (view) => {
    view.on('change:center', handleViewChange);
    view.on('change:resolution', handleViewChange);
  };
  const detach_view_events = (view) => {
    view.un('change:center', handleViewChange);
    view.un('change:resolution', handleViewChange);
  };
  attach_view_events(view);

  const munimapEl = document.createElement('div');
  const infoEl = document.createElement('div');
  munimapEl.className = 'munimap';
  infoEl.className = 'ol-popup munimap-info';
  munimapEl.appendChild(infoEl);
  target.appendChild(munimapEl);

  const map = new Map({
    target: munimapEl,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view,
  });

  let createInvalidCodesInfo;
  if (invalidMarkerCodes.length) {
    createInvalidCodesInfo = munimap_interaction.initInvalidCodesInfo(
      munimapEl,
      {
        dispatch: store.dispatch,
        invalidCodes: invalidMarkerCodes,
        lang: options.lang,
      }
    );
    infoEl.classList.add('munimap-info-hide');
  }

  // redux-related
  const render = () => {
    timer.stop();
    const state = store.getState();
    console.log('state', state);
    console.log('get_zoomToFeatures', slctr.get_zoomToFeatures(state));

    removeLoadingMessage(state, target);
    toggleInvalidCodesInfo(state, {
      createInvalidCodesInfo,
      map,
      munimapEl,
      infoEl,
    });
  };
  store.subscribe(render);

  store.dispatch(
    actions.ol_map_initialized({
      loadingMessage: false,
    })
  );

  const handleRenderComplete = () => {
    store.dispatch(
      actions.change_invalidcodes_info({
        invalidCodes: invalidMarkerCodes,
        createDragEl: invalidMarkerCodes.length > 0,
      })
    );
  };
  map.once('rendercomplete', handleRenderComplete);

  return map;
};
