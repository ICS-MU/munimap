// @ts-nocheck

/**
 * @module source/cluster
 */
import * as mm_utils from '../utils/utils.js';
import ClusterSource from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import {Point} from 'ol/geom';
import {Translations, getMsg} from '../lang/lang.js';
import {
  buffer,
  createEmpty,
  createOrUpdateFromCoordinate,
  getCenter,
} from 'ol/extent';
import {getUid} from 'ol/util';
import {isMarker} from '../feature/marker.js';
import {setClusterStore} from './_constants.js';

/**
 * @typedef {import("ol/source/Cluster").Options} ClusterSourceOptions
 * @typedef {import("ol/Feature").default} Feature
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/source/Vector")} ol.source.Vector
 */

/**
 * @typedef {ClusterSourceOptions &
 *    {compareFn: function(Feature, Feature): number}
 * } EnhancedClusterSourceOptions
 */

/**
 * @typedef {Object} CreateStoreOptions
 * @property {string} targetId targetId
 * @property {ol.AttributionLike} muAttrs attributions
 * @property {string} lang language
 * @property {number} [distance] distance
 */

class EnhancedClusterSource extends ClusterSource {
  /**
   * @param {EnhancedClusterSourceOptions} options options
   */
  constructor(options) {
    super(options);

    /**
     * @type {function(Feature, Feature): number|undefined}
     * @protected
     */
    this.compareFn = options.compareFn;
  }

  /**
   * @protected
   */
  cluster() {
    if (this.resolution === undefined || !this.source) {
      return;
    }
    const extent = createEmpty();
    const mapDistance = this.distance * this.resolution;
    const features = this.source.getFeatures();
    if (this.compareFn) {
      features.sort(this.compareFn);
    }

    /**
     * @type {!Object<string, boolean>}
     */
    const clustered = {};

    for (let i = 0, ii = features.length; i < ii; i++) {
      const feature = features[i];
      if (!(getUid(feature) in clustered)) {
        const geometry = this.geometryFunction(feature);
        if (geometry) {
          const coordinates = geometry.getCoordinates();
          createOrUpdateFromCoordinate(coordinates, extent);
          buffer(extent, mapDistance, extent);

          let neighbors = this.source.getFeaturesInExtent(extent);
          neighbors = neighbors.filter(function (neighbor) {
            const uid = getUid(neighbor);
            if (!(uid in clustered)) {
              clustered[uid] = true;
              return true;
            } else {
              return false;
            }
          });
          this.features.push(this.createCluster(neighbors));
        }
      }
    }
  }
}

/**
 * @param {string} targetId targetId
 * @param {string} lang language
 * @param {Feature} f1 feature1
 * @param {Feature} f2 feature2
 * @return {number} comparation number
 */
const clusterCompareFn = (targetId, lang, f1, f2) => {
  const m1 = isMarker(targetId, f1) ? 1 : 0;
  const m2 = isMarker(targetId, f2) ? 1 : 0;
  let result = m2 - m1;
  if (!result) {
    const n1 =
      f1.get(getMsg(Translations.BUILDING_TITLE_FIELD_NAME, lang)) ||
      f1.get('polohKod') ||
      f1.get('label') ||
      '';
    const n2 =
      f2.get(getMsg(Translations.BUILDING_TITLE_FIELD_NAME, lang)) ||
      f2.get('polohKod') ||
      f2.get('label') ||
      '';
    result = n1.localeCompare(n2);
  }
  return result;
};

/**
 * Create store for clusters.
 * @param {Array<ol.Feature>} clusterFeatures features
 * @param {CreateStoreOptions} options options
 * @return {EnhancedClusterSource} store
 */
const createStore = (clusterFeatures, options) => {
  const {targetId, muAttrs, lang, distance} = options;
  const clusterStore = new EnhancedClusterSource({
    attributions: muAttrs,
    source: new VectorSource({
      features: clusterFeatures,
    }),
    compareFn: mm_utils.partial(clusterCompareFn, targetId, lang),
    geometryFunction: (feature) => {
      let result = null;
      const geom = feature.getGeometry();
      if (geom instanceof Point) {
        result = geom;
      } else if (geom) {
        result = new Point(getCenter(geom.getExtent()));
      }
      return result;
    },
    distance: mm_utils.isDefAndNotNull(distance) ? distance : 80,
  });
  setClusterStore(targetId, clusterStore);
  return clusterStore;
};

export {EnhancedClusterSource, clusterCompareFn, createStore};
