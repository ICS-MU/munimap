/**
 * @module layer/basemap
 */

/**
 *
 * @enum {string}
 */
const BASEMAPS = {
  OSM: 'osm',
  OSM_BW: 'osm-bw',
  ARCGIS: 'arcgis',
  ARCGIS_BW: 'arcgis-bw',
};

/**
 * @param {string} id id
 * @return {boolean} isArcGISBasemap
 */
const isArcGISBasemap = (id) => {
  return id === BASEMAPS.ARCGIS || id === BASEMAPS.ARCGIS_BW;
};

/**
 * @param {string} id id
 * @return {boolean} isOSMBasemap
 */
const isOSMBasemap = (id) => {
  return id === BASEMAPS.OSM || id === BASEMAPS.OSM_BW;
};

/**
 * @param {string} id id
 * @return {boolean} isBlackAndWhiteBasemap
 */
const isBWBasemap = (id) => {
  return id === BASEMAPS.ARCGIS_BW || id === BASEMAPS.OSM_BW;
};

/**
 * @param {string} id id
 * @return {string} basemap in pair
 */
const getPairedBasemap = (id) => {
  switch (id) {
    case BASEMAPS.ARCGIS:
      return BASEMAPS.OSM;
    case BASEMAPS.ARCGIS_BW:
      return BASEMAPS.OSM_BW;
    case BASEMAPS.OSM:
      return BASEMAPS.ARCGIS;
    case BASEMAPS.OSM_BW:
      return BASEMAPS.ARCGIS_BW;
    default:
      return undefined;
  }
};

export {BASEMAPS, isArcGISBasemap, isOSMBasemap, isBWBasemap, getPairedBasemap};
