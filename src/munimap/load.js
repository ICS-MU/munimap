import * as building from './building.js';
import * as ol_proj from 'ol/proj';
import assert from './assert.js';
import {EsriJSON} from 'ol/format';

/**
 * @typedef {import("./type.js").Options} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/source").Vector} ol.source.Vector
 */

/**
 * @typedef {Object} features.Options
 * @property {ol.source.Vector} source
 * @property {TypeOptions} type
 * @property {string} [where]
 */

/**
 * @typedef {Object} featuresByCode.Options
 * @property {Array<string>} codes
 * @property {TypeOptions} type
 */

/**
 * @typedef {Object} buildingsByCode.Options
 * @property {Array<string>} codes
 */

/**
 * @type {EsriJSON}
 * @protected
 */
const FORMAT = new EsriJSON();

/**
 * @param {features.Options} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const features = async (options) => {
  const type = options.type;
  const url = type.serviceUrl + type.layerId + '/query?';
  assert(
    !options.where || options.where.indexOf('"') < 0,
    'Use single quotes instead of double quotes.'
  );
  const returnGeom = true;
  const params = {
    'f': 'json',
    'returnGeometry': returnGeom.toString(),
    'outFields': '*',
    'outSR': '3857',
    'where': options.where || '1=1',
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value);
  }
  const response = await fetch(url, {
    method: 'post',
    body: formData,
  });
  assert(response.status === 200);
  const json = await response.json();

  const projection = ol_proj.get('EPSG:3857');
  const features = FORMAT.readFeatures(json, {
    featureProjection: projection,
    extent: undefined,
  });

  options.source.addFeatures(features);

  return features;
};

/**
 * @param {featuresByCode.Options} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const featuresByCode = async (options) => {
  assert(
    options.type === building.TYPE,
    'Feature type should be' + ' building, room or door type.'
  );

  const codes = options.codes || [];

  const parts = [];
  if (codes.length) {
    const codesPart = "polohKod in ('" + codes.join("','") + "')";
    parts.push(codesPart);
  }
  let where;
  if (parts.length) {
    where = parts.join(' OR ');
  } else {
    where = '1=1';
  }
  return await features({
    source: options.type.store,
    type: options.type,
    where: where,
  });
};

/**
 * @param {buildingsByCode.Options} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const buildingsByCode = async (options) => {
  return await featuresByCode({
    codes: options.codes,
    type: building.TYPE,
  });
};

/**
 * @param {Array.<string>} paramValues zoomTos or markers
 * @return {Promise.<Array<ol.Feature>>} promise of features contained
 * in server response
 */
export const featuresFromParam = async (paramValues) => {
  const firstParamValue = paramValues[0];
  assert(building.isCodeOrLikeExpr(firstParamValue));
  const buildings = await buildingsByCode({
    codes: paramValues,
  });
  return buildings;
};
