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
import XYZ from 'ol/source/XYZ';
import {BASEMAPS} from './basemap.js';
import {INITIAL_STATE} from './conf.js';
import {Map, View} from 'ol';
import {RESOLUTION_COLOR} from './style.js';
import {createStore} from './store.js';
import {decorate as decorateCustomMarker} from './markerCustom.js';
import {ofFeatures as extentOfFeatures} from './extent.js';

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
export const loadOrDecorateMarkers = async (featuresLike, options) => {
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
 * 
 * @param {boolean} add whether to add or remove
 * @param {Element} target target element
 * @param {string} lang language
 */
const toggleLoadingMessage = (add, target, lang) => {
  add ? addLoadingMessage(target, lang) : removeLoadingMessage(target);
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
 * @param {TileLayer} raster raster
 * @param {string} baseMap options
 */
const setBaseMapStyle = (raster, baseMap) => {
  raster.on('prerender', (evt) => {
    const ctx = evt.context;
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //set opacity of the layer according to current resolution
    const resolution = evt.frameState.viewState.resolution;
    const resColor = RESOLUTION_COLOR.find((obj, i, arr) => {
      return resolution > obj.resolution || i === arr.length - 1;
    });
    raster.setOpacity(resColor.opacity);
  });
  if (
    (baseMap === BASEMAPS.OSM_BW || baseMap === BASEMAPS.ARCGIS_BW) &&
    !munimap_utils.isUserAgentIE()
  ) {
    raster.on('postrender', (evt) => {
      const ctx = evt.context;
      ctx.globalCompositeOperation = 'color';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = '#000000';
      ctx.globalCompositeOperation = 'source-over';
    });
  }
};

/**
 * @param {string} basemapId basemap id
 * @param {string=} lang lang
 * @return {TileLayer} layer
 */
export const createTileLayer = (basemapId, lang) => {
  let source;

  if (basemapId === BASEMAPS.ARCGIS || basemapId === BASEMAPS.ARCGIS_BW) {
    const esriAttribution =
      '© <a href="http://help.arcgis.com/' +
      'en/communitymaps/pdf/WorldTopographicMap_Contributors.pdf"' +
      ' target="_blank">Esri</a>';

    source = new XYZ({
      url:
        'https://server.arcgisonline.com/ArcGIS/rest/services/' +
        'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attributions: [esriAttribution],
      crossOrigin: null,
      maxZoom: 19,
    });
  } else if (basemapId === BASEMAPS.OSM || basemapId === BASEMAPS.OSM_BW) {
    munimap_assert.assert(
      munimap_utils.isDefAndNotNull(lang),
      'Language must be set.'
    );
    const osmAttribution = munimap_lang.getMsg(
      munimap_lang.Translations.OSM_ATTRIBUTION_HTML,
      lang
    );

    source = new OSM({
      attributions: [osmAttribution],
      crossOrigin: null,
      maxZoom: 18,
    });
  }

  const layer = new TileLayer({source});
  layer.set('id', basemapId);
  setBaseMapStyle(layer, basemapId);
  return layer;
};

/**
 * Change basemap if necessary.
 * @param {TileLayer} basemapLayer basemap
 * @param {Map} map map
 */
const changeBaseMap = (basemapLayer, map) => {
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
 * @param {Options} options Options
 * @returns {Promise<Map>} initialized map
 */
export default (options) => {
  return new Promise((resolve, reject) => {
    /*------------------------- parse and assert options -----------------------*/
    munimap_assert.assert(
      munimap_utils.isDefAndNotNull(options.target) &&
        munimap_utils.isString(options.target),
      'Target must be a string!'
    );
    assertOptions(options);

    /*----------------------------- create redux store -------------------------*/
    const initialState = {
      ...INITIAL_STATE,
      requiredOpts: {
        target: options.target,
        markers: options.markers === undefined ? [] : options.markers,
        zoomTo: options.zoomTo === undefined ? [] : options.zoomTo,
        lang: options.lang || munimap_lang.Abbr.CZECH,
        loadingMessage:
          options.loadingMessage === undefined ? true : options.loadingMessage,
        baseMap:
          options.baseMap === undefined ? BASEMAPS.ARCGIS_BW : options.baseMap,
      },
    };
    const store = createStore(initialState);

    let mapPromise;
    let unsubscribeInit;
    let map;

    /**
     * @param {Map} map map
     * @return {Promise<Map>} initialized map
     */
    const mapPromiseFunction = (map) => {
      return new Promise((resolve, reject) => {
        resolve(map);
      });
    };

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
        toggleLoadingMessage(addMsg, munimapEl, state.requiredOpts.lang);
      }

      if (state.markersTimestamp === null) {
        store.dispatch(actions.load_markers());
        return;
      }
      if (state.zoomToTimestamp === null) {
        store.dispatch(actions.load_zoomTo());
        return;
      }

      const invalidCodes = slctr.getInvalidCodes(state);
      const basemapLayer = slctr.getBasemapLayer(state);
      if (map === undefined) {
        let createInvalidCodesInfo;
        const markers = slctr.getInitMarkers(state);
        const zoomTos = slctr.getInitZoomTos(state);
        const view = calculateView(state.requiredOpts, markers, zoomTos);
        map = new Map({
          target: /**@type {HTMLElement}*/ (munimapEl),
          layers: [basemapLayer],
          view,
        });

        mapPromise = mapPromiseFunction(map);

        if (invalidCodes) {
          const opts = {map, invalidCodes, lang: state.requiredOpts.lang};
          createInvalidCodesInfo = munimap_interaction.initInvalidCodesInfo(
            munimapEl,
            infoEl,
            opts
          );
        }

        map.once('rendercomplete', () => {
          if (createInvalidCodesInfo) {
            createInvalidCodesInfo();
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
      }

      changeBaseMap(basemapLayer, map);
    };

    const returnFunction = () => {
      const state = store.getState();
      if (state.map_size !== null) {
        unsubscribeInit();
        resolve(mapPromise);
      }
    };
    render();
    store.subscribe(render);
    unsubscribeInit = store.subscribe(returnFunction);
  });
};
