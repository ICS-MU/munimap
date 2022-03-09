/**
 * @module source/building
 */
import * as munimap_load from '../load.js';
import * as munimap_utils from '../utils/utils.js';
import VectorSource from 'ol/source/Vector';
import {GeoJSON} from 'ol/format';
import {MultiPolygon, Polygon} from 'ol/geom';
import {featureExtentIntersect} from '../utils/geom.js';
import {
  getType as getBuildingType,
  hasInnerGeometry,
} from '../feature/building.js';
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy';
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("../conf.js").State} State
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 */

/**
 * @type {Object<string, VectorSource>}
 */
const BUILDING_STORES = {};

/**
 * Create store for buildings.
 * @param {string} targetId targetId
 * @param {Function} callback callback
 * @return {VectorSource} store
 */
const createStore = (targetId, callback) => {
  const buildingStore = new VectorSource({
    strategy: ol_loadingstrategy_tile(
      ol_tilegrid_createXYZ({
        tileSize: 512,
      })
    ),
  });
  buildingStore.setLoader(
    munimap_utils.partial(munimap_load.buildingFeaturesForMap, {
      source: buildingStore,
      type: getBuildingType(),
      processor: munimap_utils.partial(
        munimap_load.buildingLoadProcessor,
        targetId
      ),
      callback: callback,
    })
  );
  BUILDING_STORES[targetId] = buildingStore;
  return buildingStore;
};

/**
 * Get building store.
 * @param {string} targetId targetId
 * @return {VectorSource} store
 */
const getStore = (targetId) => {
  return BUILDING_STORES[targetId];
};

/**
 * @param {string} targetId targetId
 * @param {ol.extent.Extent} extent extent
 * @return {ol.Feature} marker
 */
const getLargestInExtent = (targetId, extent) => {
  let selectFeature;
  let maxArea;
  const format = new GeoJSON();
  const buildingStore = getStore(targetId);
  buildingStore.forEachFeatureIntersectingExtent(extent, (building) => {
    if (hasInnerGeometry(building)) {
      const intersect = featureExtentIntersect(building, extent, format);
      const geom = intersect.getGeometry();
      if (geom instanceof Polygon || geom instanceof MultiPolygon) {
        const area = geom.getArea();
        if (!munimap_utils.isDef(maxArea) || area > maxArea) {
          maxArea = area;
          selectFeature = building;
        }
      }
    }
  });
  return selectFeature || null;
};

export {createStore, getLargestInExtent, getStore};
