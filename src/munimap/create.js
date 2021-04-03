import * as load from './load.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import assert from './assert.js';
import {Map, View} from 'ol';
import {ofFeatures as extentOfFeatures} from './extent.js';

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
  const zoomTos = opts.zoomTo ? await load.featuresFromParam(opts.zoomTo) : [];
  const map_size = [800, 400];
  const view = calculateView(
    opts,
    zoomTos,
    /** @type {ol.size.Size} */ (map_size)
  );
  return new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view,
  });
};
