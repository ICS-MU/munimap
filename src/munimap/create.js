import * as actions from './action.js';
import * as munimap_load from './load.js';
import * as munimap_utils from './utils.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import * as slctr from './selector.js';
import Feature from 'ol/Feature';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import Timer from 'timer.js';
import assert from './assert.js';
import {Abbr} from './lang.js';
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
 */

/**
 * @typedef {Object} Options
 * @property {string} target
 * @property {number} [zoom]
 * @property {ol.coordinate.Coordinate} [center]
 * @property {Array.<string>|string} [zoomTo]
 * @property {Array.<string>|Array.<ol.Feature>} [markers]
 * @property {string|undefined} lang
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
          assert(res);
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
 * @param {Array<number>} invalidMarkerIndexes invalid codes
 * @return {Promise<Array<ol.Feature>>} promise resolving with markers
 */
const loadOrDecorateMarkers = async (
  featuresLike,
  options,
  invalidMarkerIndexes
) => {
  const lang = options.lang;
  let result;
  const arrPromises = []; // array of promises of features

  if (!Array.isArray(featuresLike)) {
    result = Promise.resolve([]);
    return result;
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
        )
      } else {
        console.log('is optpoi');
      }
    });
    return new Promise((resolve, reject) => {
      Promise.all(arrPromises).then((values) => {
        for (let i = 0; i < values.length; i++) {
          if (values[i] === 'ERROR') {
            invalidMarkerIndexes.push(i);
          }
        }

        // reduce array of arrays to 1 array
        values = values.reduce((a, b) => {
          a = a.concat(b);
          munimap_utils.removeArrayDuplicates(a);
          return a;
        }, []);

        resolve(values);
      });
    });
  }
};

/**
 * @param {Options} options Options
 * @returns {Promise<Map>} initialized map
 */
export default async (options) => {
  assert(
    munimap_utils.isDefAndNotNull(options.target) &&
      munimap_utils.isString(options.target),
    'Target must be a string!'
  );
  const target = document.getElementById(options.target);

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
    assert(munimap_utils.isArray(options.markers));
    //munimap_utils.removeArrayDuplicates(options.markers);
    markerStrings = /** @type {Array.<string>} */ (options.markers);
  } else {
    markerStrings = /** @type {Array.<string>} */ ([]);
  }

  //options.lang = options.lang || Abbr.CZECH;
  const markers = await loadOrDecorateMarkers(options.markers, options, []);
  const zoomTos = zoomToStrings.length
    ? await munimap_load.featuresFromParam(zoomToStrings)
    : [];
  const map_size = /** @type {ol.size.Size} */ ([800, 400]);
  const view = calculateView(options, markers, zoomTos);

  // redux-related
  const initialState = {
    ...INITIAL_STATE,
    map_size,
    center: view.getCenter(),
    zoom: view.getZoom(),
    zoomTos: zoomToStrings,
    markers: markerStrings,
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

  // redux-related
  const render = () => {
    timer.stop();
    const state = store.getState();
    console.log('state', state);
    console.log('get_zoomToFeatures', slctr.get_zoomToFeatures(state));
  };
  store.subscribe(render);

  const munimapEl = document.createElement('div');
  munimapEl.className = 'munimap';
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
  return map;
};
