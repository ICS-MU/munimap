import * as actions from './action.js';
import * as load from './load.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import Timer from 'timer.js';
import assert from './assert.js';
import {INITIAL_STATE} from './conf.js';
import {Map, View} from 'ol';
import {createStore} from './store.js';
import {ofFeatures as extentOfFeatures} from './extent.js';
import * as slctr from './selector.js';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/size").Size} ol.size.Size
 */

/**
 * @typedef {Object} Options
 * @property {string} target
 * @property {number} [zoom]
 * @property {ol.coordinate.Coordinate} [center]
 * @property {Array.<string>|string} [zoomTo]
 * @property {Array.<string>|Array.<ol.Feature>} [markers]
 */

/**
 * @param {Options} options options
 * @param {Array<ol.Feature>} zoomTos zoomTos
 * @param {ol.size.Size} map_size map_size
 * @return {View} view
 */
const calculateView = (options, zoomTos, map_size) => {
  // var target = goog.dom.getElement(options.target);
  const center = ol_proj.transform(
    [16.605390495656977, 49.1986567194723],
    ol_proj.get('EPSG:4326'),
    ol_proj.get('EPSG:3857')
  );
  const zoom = 13;
  const view = new View({
    center: center,
    maxZoom: 23,
    minZoom: 0,
    zoom: zoom,
  });
  if (zoomTos.length) {
    const extent = extentOfFeatures(zoomTos);
    if (options.zoom === undefined && options.center === undefined) {
      view.fit(extent, {
        size: map_size,
      });
      const res = view.getResolution();
      assert(res);
      ol_extent.buffer(extent, /** @type {number} */ (res) * 30, extent);
      view.fit(extent, {
        size: map_size,
      });
    } else if (options.center === undefined) {
      view.setCenter(ol_extent.getCenter(extent));
    }
  }
  return view;
};

/**
 * @param {Options} opts Options
 * @returns {Promise<Map>} initialized map
 */
export default async (opts) => {
  let zoomToStrings;
  if(opts.zoomTo && opts.zoomTo.length) {
    zoomToStrings = /** @type {Array.<string>} */ (typeof opts.zoomTo ===
      'string' || opts.zoomTo instanceof String
      ? [opts.zoomTo]
      : opts.zoomTo);
  } else {
    zoomToStrings = [];
  }
  const zoomTos = zoomToStrings.length ? await load.featuresFromParam(zoomToStrings) : [];
  const map_size = /** @type {ol.size.Size} */ ([800, 400]);
  const view = calculateView(opts, zoomTos, map_size);

  // redux-related
  const initialState = {
    ...INITIAL_STATE,
    map_size,
    center: view.getCenter(),
    zoom: view.getZoom(),
    zoomTos: zoomToStrings,
  };
  const store = createStore(initialState);

  // map-related
  const timer = new Timer();
  const handleViewChange = () => {
    timer.start(0.1);
  };
  const handleTimerEnd = () => {
    store.dispatch(actions.ol_map_view_change({
      center: view.getCenter(),
      center_proj: 'EPSG:3857',
      zoom: view.getZoom(),
    }));
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
  }
  store.subscribe(render);

  const map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view,
  });
  return map;
};
