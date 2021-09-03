/**
 * @module load
 */
import * as actions from './redux/action.js';
import * as munimap_assert from './assert/assert.js';
import * as munimap_building from './feature/building.js';
import * as munimap_complex from './feature/complex.js';
import * as munimap_unit from './feature/unit.js';
import * as munimap_utils from './utils/utils.js';
import * as slctr from './redux/selector.js';
import VectorSource from 'ol/source/Vector';
import {EsriJSON} from 'ol/format';
import {FEATURE_TYPE_PROPERTY_NAME} from './feature/feature.js';
import {ROOM_TYPES, getType as getRoomType} from './feature/room.js';
import {
  getActiveStore as getActiveRoomStore,
  getDefaultStore as getDefaultRoomStore,
  getStore as getRoomStore,
} from './source/room.js';
import {getStore as getBuildingStore} from './source/building.js';
import {getStore as getComplexStore} from './source/complex.js';
import {getStore as getFloorStore} from './source/floor.js';
import {getType as getFloorType} from './feature/floor.js';
import {getNotYetAddedFeatures} from './utils/store.js';
import {getStore as getUnitStore} from './source/unit.js';

/**
 * @typedef {import("./feature/feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/source/Vector").VectorSourceEvent} ol.source.Vector.Event
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @typedef {Object} FeaturesOptions
 * @property {ol.source.Vector} source
 * @property {TypeOptions} type
 * @property {string} [where]
 * @property {string} [method]
 * @property {boolean} [returnGeometry]
 * @property {Processor} [processor]
 */

/**
 * @typedef {Object} FeaturesByCodeOptions
 * @property {Array<string>} codes
 * @property {TypeOptions} type
 * @property {ol.source.Vector} source
 * @property {Array<string>} [likeExprs]
 * @property {Processor} [processor]
 */

/**
 * @typedef {Object} BuildingsByCodeOptions
 * @property {Array<string>} codes
 * @property {Array<string>} likeExprs
 */

/**
 * @typedef {Object} ComplexByIdsOptions
 * @property {Array<number>} ids
 * @property {Processor} [processor]
 */

/**
 * @typedef {Object} FeaturesForMapOptions
 * @property {ol.source.Vector} source
 * @property {TypeOptions|function(): TypeOptions} type
 * @property {string} [where]
 * @property {string} [method]
 * @property {Processor} [processor]
 * @property {Function} [callback]
 */

/**
 * @typedef {Object} LoadActiveOptions
 * @property {Function} [callback]
 * @property {redux.Store} [store]
 */

/**
 * @typedef {Object} FeaturesFromUrlOptions
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
 * @typedef {Object} WaitForNewProcessedFeaturesOptions
 * @property {ol.source.Vector} source
 * @property {Array<ol.Feature>} loadedNewProcessedFeatures
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
 * @typedef {Object} ProcessorOptions
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
 * @param {ProcessorOptions} options opts
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
 * @param {WaitForNewProcessedFeaturesOptions} options opts
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
 * @param {FeaturesForMapOptions} options opts
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
 * @param {FeaturesOptions} options options
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
 * @param {FeaturesByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const featuresByCode = async (options) => {
  munimap_assert.assert(
    JSON.stringify(options.type) == JSON.stringify(munimap_building.getType()),
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
 * @param {ComplexByIdsOptions} options opts
 * @return {Promise<Array<ol.Feature>>} complexes
 * @protected
 */
const complexByIds = async (options) => {
  return features({
    source: getComplexStore(),
    type: munimap_complex.getType(),
    method: 'POST',
    returnGeometry: true,
    where: 'inetId IN (' + options.ids.join() + ')',
    processor: options.processor,
  });
};

/**
 * @param {FeaturesForMapOptions} options options
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
const buildingFeaturesForMap = async (
  options,
  extent,
  resolution,
  projection
) => {
  const buildings = await featuresForMap(
    options,
    extent,
    resolution,
    projection
  );

  if (options.callback) {
    options.callback(actions.buildings_loaded);
  }
  return buildings;
};

/**
 * @param {FeaturesForMapOptions} options opts
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
const pubtranFeaturesForMap = async (options, extent, resolution, projection) =>
  await featuresForMap(options, extent, resolution, projection);

/**
 * @param {string} where where
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const loadUnits = async (where) => {
  return features({
    source: getUnitStore(),
    type: munimap_unit.getType(),
    method: 'POST',
    returnGeometry: false,
    where: where,
  });
};

/**
 * @param {Array<number>} buildingIds ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadUnitsByHeadquartersIds = async (buildingIds) => {
  const where = 'budova_sidelni_id IN (' + buildingIds.join() + ')';
  return loadUnits(where);
};

/**
 * @param {Array<number>} complexIds complex ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadUnitsByHeadquartersComplexIds = async (complexIds) => {
  const where = 'areal_sidelni_id IN (' + complexIds.join() + ')';
  return loadUnits(where);
};

/**
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} opts
 */
const unitLoadProcessor = async (options) => {
  const newBuildings = options.new;
  const buildingIdsToLoad = newBuildings.map((building) => {
    return building.get('inetId');
  });

  if (buildingIdsToLoad.length) {
    const units = await loadUnitsByHeadquartersIds(buildingIdsToLoad);
    newBuildings.forEach((building) => {
      const buildingUnits = units.filter((unit) => {
        return unit.get('budova_sidelni_id') === building.get('inetId');
      });
      building.set(munimap_building.UNITS_FIELD_NAME, buildingUnits);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} promise
 * @protected
 */
const complexLoadProcessorWithUnits = async (options) => {
  const newComplexes = options.new;
  const complexIdsToLoad = newComplexes.map((complex) => {
    return complex.get(munimap_complex.ID_FIELD_NAME);
  });

  if (complexIdsToLoad.length) {
    const units = await loadUnitsByHeadquartersComplexIds(complexIdsToLoad);
    newComplexes.forEach((complex) => {
      const complexUnits = units.filter((unit) => {
        return (
          unit.get('areal_sidelni_id') ===
          complex.get(munimap_complex.ID_FIELD_NAME)
        );
      });
      complex.set(munimap_complex.UNITS_FIELD_NAME, complexUnits);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} processor
 * @protected
 */
const complexLoadProcessor = async (options) => {
  const newBuildings = options.new;
  let complexIdsToLoad = [];
  const buildingsToLoadComplex = [];
  newBuildings.forEach((building) => {
    const complexId = building.get(munimap_building.COMPLEX_ID_FIELD_NAME);
    if (munimap_utils.isNumber(complexId)) {
      munimap_assert.assertNumber(complexId);
      const complex = munimap_complex.getById(complexId);
      if (complex) {
        building.set(munimap_building.COMPLEX_FIELD_NAME, complex);
      } else {
        complexIdsToLoad.push(complexId);
        buildingsToLoadComplex.push(building);
      }
    } else {
      building.set(munimap_building.COMPLEX_FIELD_NAME, null);
    }
  });

  complexIdsToLoad = [...new Set(complexIdsToLoad)];
  if (complexIdsToLoad.length) {
    const complexes = await complexByIds({
      ids: complexIdsToLoad,
      processor: complexLoadProcessorWithUnits,
    });
    buildingsToLoadComplex.forEach((building) => {
      const complexId = building.get(munimap_building.COMPLEX_ID_FIELD_NAME);
      const complex = munimap_complex.getById(complexId, complexes);
      if (!complex) {
        throw new Error('Complex ' + complexId + ' not found.');
      }
      building.set(munimap_building.COMPLEX_FIELD_NAME, complex || null);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} opts
 */
const buildingLoadProcessor = async (options) => {
  const result = await Promise.all([
    complexLoadProcessor(options),
    unitLoadProcessor(options),
  ]);
  munimap_assert.assertArray(result);
  result.forEach((opts) => {
    munimap_assert.assert(opts === options);
    munimap_assert.assert(munimap_utils.arrayEquals(opts.all, options.all));
    munimap_assert.assert(munimap_utils.arrayEquals(opts.new, options.new));
    munimap_assert.assert(
      munimap_utils.arrayEquals(opts.existing, options.existing)
    );
  });
  return result[0];
};

/**
 * @param {BuildingsByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const buildingsByCode = async (options) => {
  return featuresByCode({
    codes: options.codes,
    type: munimap_building.getType(),
    source: getBuildingStore(),
    likeExprs: options.likeExprs,
    processor: buildingLoadProcessor,
  });
};

/**
 *
 * @param {string} where where
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadFloors = (where) => {
  return features({
    source: getFloorStore(),
    type: getFloorType(),
    returnGeometry: false,
    where: where,
  });
};

/**
 * @param {Array.<string>|string|undefined} paramValue zoomTo or markers
 * @return {Promise.<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const featuresFromParam = async (paramValue) => {
  const values = /**@type {Array.<string>}*/ (munimap_utils.isString(paramValue)
    ? [paramValue]
    : paramValue);
  const firstParamValue = values[0];
  let codes;
  let likeExprs;

  if (paramValue && paramValue.length) {
    if (munimap_building.isCodeOrLikeExpr(firstParamValue)) {
      codes = values.filter(munimap_building.isCode);
      likeExprs = values.filter(munimap_building.isLikeExpr);
      return await buildingsByCode({
        codes: codes,
        likeExprs: likeExprs,
      });
    }
  }
  return [];
};

/**
 *
 * @param {FeaturesForMapOptions} options options
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 */
const loadDefaultRooms = async (options, extent, resolution, projection) => {
  const rooms = await featuresForMap(options, extent, resolution, projection);
  const defaultRoomStore = getDefaultRoomStore();
  const roomsToAdd = getNotYetAddedFeatures(defaultRoomStore, rooms);
  defaultRoomStore.addFeatures(roomsToAdd);

  if (options.callback) {
    options.callback(actions.rooms_loaded, ROOM_TYPES.DEFAULT);
  }
};

/**
 *
 * @param {LoadActiveOptions} options options
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 */
const loadActiveRooms = async (
  {store, callback},
  extent,
  resolution,
  projection
) => {
  const activeFloorCodes = slctr.getActiveFloorCodes(store.getState());

  let where;
  if (activeFloorCodes.length > 0) {
    const conditions = [];
    activeFloorCodes.forEach((floorCode) =>
      conditions.push(`polohKod LIKE '${floorCode}%'`)
    );
    where = conditions.join(' OR ');
    const opts = {
      source: getRoomStore(),
      type: getRoomType(),
      where: where,
      method: 'POST',
    };
    const rooms = await featuresForMap(opts, extent, resolution, projection);
    const activeStore = getActiveRoomStore();
    munimap_assert.assertInstanceof(activeStore, VectorSource);
    const roomsFromActiveFloor = rooms.filter((room) =>
      activeFloorCodes.includes(room.get('polohKod').substr(0, 8))
    );
    const roomsToAdd = getNotYetAddedFeatures(
      activeStore,
      roomsFromActiveFloor
    );
    activeStore.addFeatures(roomsToAdd);

    if (callback) {
      callback(actions.rooms_loaded, ROOM_TYPES.ACTIVE);
    }
  }
};

export {
  buildingFeaturesForMap,
  buildingLoadProcessor,
  featuresForMap,
  features,
  featuresFromParam,
  loadFloors,
  pubtranFeaturesForMap,
  loadDefaultRooms,
  loadActiveRooms,
};
