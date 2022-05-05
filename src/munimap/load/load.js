/**
 * @module
 */

import * as mm_assert from '../assert/assert.js';
import * as mm_utils from '../utils/utils.js';
import {
  BUILDING_TYPE,
  DOOR_TYPE,
  FEATURE_TYPE_PROPERTY_NAME,
  ROOM_TYPE,
} from '../feature/constants.js';
import {EsriJSON} from 'ol/format';
import {getUid} from 'ol';

/**
 * @typedef {import("../feature/feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/source/Vector").VectorSourceEvent} ol.source.Vector.Event
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 */

/**
 * @typedef {object} FeaturesOptions
 * @property {ol.source.Vector} source source
 * @property {TypeOptions} type type
 * @property {string} [where] where
 * @property {string} [method] method
 * @property {boolean} [returnGeometry] whether to return geometry
 * @property {Processor} [processor] processor
 */

/**
 * @typedef {object} FeaturesByCodeOptions
 * @property {Array<string>} codes codes
 * @property {TypeOptions} type type
 * @property {ol.source.Vector} source source
 * @property {Array<string>} [likeExprs] like expressions
 * @property {Processor} [processor] processor
 */

/**
 * @typedef {object} FeaturesForMapOptions
 * @property {ol.source.Vector} source source
 * @property {TypeOptions|function(): TypeOptions} type type
 * @property {string} [where] where
 * @property {string} [method] method
 * @property {Processor} [processor] processor
 * @property {Function} [callback] callback
 */

/**
 * @typedef {object} FeaturesFromUrlOptions
 * @property {ol.source.Vector} source source
 * @property {TypeOptions} type type
 * @property {string} url url
 * @property {ol.proj.Projection} [projection] projection
 * @property {string} [method] method
 * @property {FormData} [postContent] post content
 * @property {Processor} [processor] processor
 * @property {Array<ol.Feature>} [newProcessedFeatures] new features
 */

/**
 * @typedef {object} WaitForNewProcessedFeaturesOptions
 * @property {ol.source.Vector} source source
 * @property {Array<ol.Feature>} loadedNewProcessedFeatures new features
 */

/**
 * Processor must return the same options object as was the input.
 * It is not allowed to change any options arrays (all, new, existing), but
 * it can change elements of those arrays (that's why processor exists).
 * @typedef {function(ProcessorOptions): Promise<ProcessorOptions>} Processor
 */

/**
 * Explanation of options:
 * all: features that were loaded in this request
 * new: features that were loaded in this request and are not yet in the store
 * existing: features that were loaded in this request and are already in the
 *   store
 * @typedef {object} ProcessorOptions
 * @property {Array<ol.Feature>} all all features
 * @property {Array<ol.Feature>} new new features
 * @property {Array<ol.Feature>} existing existing features
 */

/**
 * newProcessedFeatures: Cache of new features that are currently being
 * processed, but are not yet stored in the store.
 * @type {Object<string, {
 *  type: TypeOptions,
 *  newProcessedFeatures: Array<ol.Feature>
 * }>}
 * @protected
 */
const ProcessorCache = {};

/**
 * @param {TypeOptions} type type
 * @param {string} sourceUid source uid (from OL)
 * @return {Array<ol.Feature>} new processed features
 */
const getNewProcessedFeatures = (type, sourceUid) => {
  let cache = ProcessorCache[sourceUid];
  if (!cache) {
    cache = {
      type: type,
      newProcessedFeatures: [],
    };
    ProcessorCache[sourceUid] = cache;
  }
  return cache.newProcessedFeatures;
};

/**
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} options
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
 * @param {WaitForNewProcessedFeaturesOptions} options opts
 * @return {Promise<Function|boolean>} result
 */
const waitForNewProcessedFeatures = async (options) => {
  const loadedNewProcessedFeatures =
    options.loadedNewProcessedFeatures.concat();
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
 * @param {FeaturesFromUrlOptions} options opts
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

  mm_assert.assert(response.status === 200);
  const json = await response.json();
  mm_assert.assert(!!json);

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
 * @param {FeaturesForMapOptions} options opts
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 * @return {Promise<Array<ol.Feature>>} promise of features contained in response
 */
const featuresForMap = async (options, extent, resolution, projection) => {
  mm_assert.assertExists(options.source, 'Source must be defined!');
  const type = mm_utils.isFunction(options.type)
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
    newProcessedFeatures: getNewProcessedFeatures(type, getUid(options.source)),
  });
};

/**
 * @param {FeaturesOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const features = async (options) => {
  const type = options.type;
  const url = type.serviceUrl + type.layerId + '/query?';
  mm_assert.assertExists(options.source, 'Source must be defined!');
  mm_assert.assert(
    !options.where || options.where.indexOf('"') < 0,
    'Use single quotes instead of double quotes.'
  );
  const returnGeom = mm_utils.isDef(options.returnGeometry)
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
    newProcessedFeatures: getNewProcessedFeatures(type, getUid(options.source)),
  });
};

/**
 * @param {FeaturesByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const featuresByCode = async (options) => {
  mm_assert.assert(
    JSON.stringify(options.type) == JSON.stringify(BUILDING_TYPE) ||
      JSON.stringify(options.type) == JSON.stringify(ROOM_TYPE) ||
      JSON.stringify(options.type) == JSON.stringify(DOOR_TYPE),
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

export {features, featuresByCode, featuresForMap, featuresFromUrl};
