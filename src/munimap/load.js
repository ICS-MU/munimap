/**
 * @module load
 */
import * as munimap_assert from './assert/assert.js';
import * as munimap_building from './feature/building.js';
import * as munimap_utils from './utils/utils.js';
import {EsriJSON} from 'ol/format';
import {FEATURE_TYPE_PROPERTY_NAME} from './feature/feature.js';

/**
 * @typedef {import("./feature/feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/source/Vector").VectorSourceEvent} ol.source.Vector.Event
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 */

/**
 * @typedef {Object} features.Options
 * @property {ol.source.Vector} source
 * @property {TypeOptions} type
 * @property {string} [where]
 * @property {string} [method]
 * @property {boolean} [returnGeometry]
 * @property {Processor} [processor]
 */

/**
 * @typedef {Object} featuresByCode.Options
 * @property {Array<string>} codes
 * @property {TypeOptions} type
 * @property {ol.source.Vector} source
 * @property {Array<string>} [likeExprs]
 * @property {Processor} [processor]
 */

/**
 * @typedef {Object} buildingsByCode.Options
 * @property {Array<string>} codes
 * @property {Array<string>} likeExprs
 */

/**
 * @typedef {Object} featuresForMap.Options
 * @property {ol.source.Vector} source
 * @property {TypeOptions|function(): TypeOptions} type
 * @property {string} [where]
 * @property {string} [method]
 * @property {Processor} [processor]
 */

/**
 * @typedef {Object} featuresFromUrl.Options
 * @property {ol.source.Vector} source
 * @property {TypeOptions} type
 * @property {string} url
 * @property {ol.proj.Projection} [projection]
 * @property {string} [method]
 * @property {FormData} [postContent]
 * @property {Processor} [processor]
 * @property {Array<ol.Feature>} [newProcessedFeatures]
 */

/**
 * @typedef {Object} waitForNewProcessedFeatures.Options
 * @property {ol.source.Vector} source
 * @property {Array<ol.Feature>} loadedNewProcessedFeatures
 */

/**
 * Processor must return the same options object as was the input.
 * It is not allowed to change any options arrays (all, new, existing), but
 * it can change elements of those arrays (that's why processor exists).
 * @typedef {function(Processor.Options): Promise<Processor.Options>} Processor
 */

/**
 * Explanation of options:
 * all: features that were loaded in this request
 * new: features that were loaded in this request and are not yet in the store
 * existing: features that were loaded in this request and are already in the
 *   store
 * @typedef {Object} Processor.Options
 * @property {Array.<ol.Feature>} all
 * @property {Array.<ol.Feature>} new
 * @property {Array.<ol.Feature>} existing
 */

/**
 * newProcessedFeatures: Cache of new features that are currently being
 * processed, but are not yet stored in the store.
 * @type {Array<{
 *  type: TypeOptions,
 *  newProcessedFeatures: Array<ol.Feature>
 * }>}
 * @protected
 */
const ProcessorCache = [];

/**
 * @param {TypeOptions} type type
 * @return {Array<ol.Feature>} new processed features
 */
const getNewProcessedFeatures = (type) => {
  let cache = ProcessorCache.find((c) => {
    return c.type === type;
  });
  if (!cache) {
    cache = {
      type: type,
      newProcessedFeatures: [],
    };
    ProcessorCache.push(cache);
  }
  return cache.newProcessedFeatures;
};

/**
 * @param {Processor.Options} options opts
 * @protected
 */
const defaultProcessor = async (options) => {
  return options;
};

/**
 * @type {EsriJSON}
 * @protected
 */
const FORMAT = new EsriJSON();

/**
 * @param {waitForNewProcessedFeatures.Options} options opts
 */
const waitForNewProcessedFeatures = async (options) => {
  const loadedNewProcessedFeatures = options.loadedNewProcessedFeatures.concat();
  if (!loadedNewProcessedFeatures.length) {
    return true;
  }
  return async () => {
    const source = options.source;
    /**
     * @param {ol.source.Vector.Event} evt evt
     * @return {boolean} done
     */
    const addFeatureHandler = (evt) => {
      const feature = evt.feature;
      const idx = loadedNewProcessedFeatures.findIndex((f) => f === feature);
      loadedNewProcessedFeatures.splice(idx, 1);
      if (!loadedNewProcessedFeatures.length) {
        source.un('addfeature', addFeatureHandler);
        return true;
      }
    };
    source.on('addfeature', addFeatureHandler);
  };
};

/**
 * @param {featuresFromUrl.Options} options opts
 * @return {Promise<Array<ol.Feature>>} promise of features contained in response
 */
const featuresFromUrl = async (options) => {
  const source = options.source;
  const primaryKey = options.type.primaryKey;
  const url = options.url;
  const projection = options.projection;
  const method = options.method || 'GET';
  const body = options.postContent;

  const response = await fetch(url, {
    method: method,
    body: body,
  });

  munimap_assert.assert(response.status === 200);
  const json = await response.json();
  munimap_assert.assert(!!json);

  const allStoredFeatures = source.getFeatures();
  const loadedStoredFeatures = [];
  json.features = json.features.filter((fObject) => {
    const pkValue = fObject.attributes[primaryKey];
    return !allStoredFeatures.find((feature) => {
      const equals = feature.get(primaryKey) === pkValue;
      if (equals) {
        loadedStoredFeatures.push(feature);
      }
      return equals;
    });
  });

  const allNewProcessedFeatures = options.newProcessedFeatures || [];
  const loadedNewProcessedFeatures = [];
  json.features = json.features.filter((fObject) => {
    const pkValue = fObject.attributes[primaryKey];
    return !allNewProcessedFeatures.find((feature) => {
      const equals = feature.get(primaryKey) === pkValue;
      if (equals) {
        loadedNewProcessedFeatures.push(feature);
      }
      return equals;
    });
  });

  const newLoadedFeatures = FORMAT.readFeatures(json, {
    featureProjection: projection,
    extent: null,
  });
  newLoadedFeatures.forEach((feature) => {
    feature.set(FEATURE_TYPE_PROPERTY_NAME, options.type);
    const featureId = /** @type {string|number} */ (feature.get(primaryKey));
    feature.setId(featureId);
  });
  allNewProcessedFeatures.push(...newLoadedFeatures);

  await waitForNewProcessedFeatures({
    source: source,
    loadedNewProcessedFeatures: loadedNewProcessedFeatures,
  });

  const allLoadedFeatures = newLoadedFeatures.concat(
    loadedStoredFeatures,
    loadedNewProcessedFeatures
  );
  const processor = options.processor || defaultProcessor;
  const procOpts = {
    all: allLoadedFeatures,
    new: newLoadedFeatures,
    existing: loadedStoredFeatures.concat(loadedNewProcessedFeatures),
  };
  const procOptions = await processor(procOpts);

  const to_remove = [];
  allNewProcessedFeatures.forEach((f) => {
    if (newLoadedFeatures.includes(f)) {
      to_remove.push(f);
    }
  });

  to_remove.forEach((item) => {
    allNewProcessedFeatures.splice(allNewProcessedFeatures.indexOf(item), 1);
  });
  source.addFeatures(procOptions.new);
  return procOptions.all;
};

/**
 * @param {featuresForMap.Options} options opts
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 * @return {Promise<Array<ol.Feature>>} promise of features contained in response
 */
const featuresForMap = async (options, extent, resolution, projection) => {
  munimap_assert.assertExists(options.source, 'Source must be defined!');
  const type = munimap_utils.isFunction(options.type)
    ? /**@type {function}*/ (options.type)()
    : options.type;
  const url = type.serviceUrl + type.layerId + '/query?';
  const geomString =
    '{"xmin":' +
    extent[0] +
    ',"ymin":' +
    extent[1] +
    ',"xmax":' +
    extent[2] +
    ',"ymax":' +
    extent[3] +
    ',"spatialReference":{"wkid":3857}}';

  const params = {
    'f': 'json',
    'returnGeometry': 'true',
    'spatialRel': 'esriSpatialRelIntersects',
    'geometry': geomString,
    'geometryType': 'esriGeometryEnvelope',
    'inSR': '3857',
    'outFields': '*',
    'outSR': '3857',
    'where': options.where || '1=1',
  };
  if (!options.method) {
    options.method = 'POST';
  }
  const isPost = options.method === 'POST';

  let queryParams;
  let formData;
  if (!isPost) {
    queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, value);
    }
  } else {
    formData = new FormData();
    for (const [key, value] of Object.entries(params)) {
      formData.append(key, value);
    }
  }

  return featuresFromUrl({
    source: options.source,
    type: type,
    url: !isPost ? url + queryParams.toString() : url,
    projection: projection,
    method: options.method,
    postContent: isPost ? formData : undefined,
    processor: options.processor,
    newProcessedFeatures: getNewProcessedFeatures(type),
  });
};

/**
 * @param {features.Options} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const features = async (options) => {
  const type = options.type;
  const url = type.serviceUrl + type.layerId + '/query?';
  munimap_assert.assert(
    !options.where || options.where.indexOf('"') < 0,
    'Use single quotes instead of double quotes.'
  );
  const returnGeom = munimap_utils.isDef(options.returnGeometry)
    ? options.returnGeometry
    : true;
  const params = {
    'f': 'json',
    'returnGeometry': returnGeom.toString(),
    'outFields': '*',
    'outSR': '3857',
    'where': options.where || '1=1',
  };
  if (!options.method) {
    options.method = 'POST';
  }
  const isPost = options.method === 'POST';

  // let response;
  let queryParams;
  let formData;
  if (!isPost) {
    queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, value);
    }
  } else {
    formData = new FormData();
    for (const [key, value] of Object.entries(params)) {
      formData.append(key, value);
    }
  }
  return featuresFromUrl({
    source: options.source,
    type: type,
    url: !isPost ? url + queryParams.toString() : url,
    method: options.method,
    postContent: isPost ? formData : undefined,
    processor: options.processor,
    newProcessedFeatures: getNewProcessedFeatures(type),
  });
};

/**
 * @param {featuresByCode.Options} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const featuresByCode = async (options) => {
  munimap_assert.assert(
    options.type === munimap_building.TYPE,
    'Feature type should be' + ' building, room or door type.'
  );

  const codes = options.codes || [];
  const likeExprs = options.likeExprs || [];

  const parts = [];
  if (codes.length) {
    const codesPart = "polohKod in ('" + codes.join("','") + "')";
    parts.push(codesPart);
  }
  if (likeExprs.length) {
    const likePart =
      "polohKod like '" + likeExprs.join("' OR polohKod like '") + "'";
    parts.push(likePart);
  }
  let where;
  if (parts.length) {
    where = parts.join(' OR ');
  } else {
    where = '1=1';
  }
  return features({
    source: options.source,
    type: options.type,
    where: where,
    processor: options.processor,
  });
};

/**
 * @param {buildingsByCode.Options} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const buildingsByCode = async (options) => {
  return featuresByCode({
    codes: options.codes,
    type: munimap_building.getType(),
    source: munimap_building.getStore(),
    likeExprs: options.likeExprs,
    processor: munimap_building.loadProcessor,
  });
};

/**
 * @param {Array.<string>|string|undefined} paramValue zoomTos or markers
 * @return {Promise.<Array<ol.Feature>>} promise of features contained
 * in server response
 */
export const featuresFromParam = async (paramValue) => {
  const values = /**@type {Array.<string>}*/ (munimap_utils.isString(paramValue)
    ? [paramValue]
    : paramValue);
  const firstParamValue = values[0];
  let codes;
  let likeExprs;

  if (munimap_building.isCodeOrLikeExpr(firstParamValue)) {
    codes = values.filter(munimap_building.isCode);
    likeExprs = values.filter(munimap_building.isLikeExpr);
    return await buildingsByCode({
      codes: codes,
      likeExprs: likeExprs,
    });
  }
  return [];
};

export {featuresForMap, features};
