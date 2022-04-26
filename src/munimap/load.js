/**
 * @module load
 */
import * as actions from './redux/action.js';
import * as mm_assert from './assert/assert.js';
import * as mm_complex from './feature/complex.js';
import * as mm_utils from './utils/utils.js';
import * as slctr from './redux/selector.js';
import * as srcs from './source/constants.js';
import VectorSource from 'ol/source/Vector';
import {
  BUILDING_COMPLEX_FIELD_NAME,
  BUILDING_COMPLEX_ID_FIELD_NAME,
  BUILDING_TYPE,
  BUILDING_UNITS_FIELD_NAME,
  COMPLEX_ID_FIELD_NAME,
  COMPLEX_TYPE,
  COMPLEX_UNITS_FIELD_NAME,
  DOOR_TYPE,
  FEATURE_TYPE_PROPERTY_NAME,
  FLOOR_TYPE,
  OPT_POI_TYPE,
  OptPoiIds,
  OptPoiLabels,
  POI_TYPE,
  PoiPurpose,
  ROOM_TYPE,
  UNIT_TYPE,
} from './feature/constants.js';
import {EsriJSON} from 'ol/format';
import {MARKER_LABEL_STORE, REQUIRED_CUSTOM_MARKERS} from './constants.js';
import {addPoiDetail} from './feature/room.js';
import {
  createMarkerStringsArray,
  createZoomToStringsArray,
} from './utils/param.js';
import {decorate as decorateCustomMarker} from './feature/marker.custom.js';
import {getByCode as getBldgByCode} from './feature/building.js';
import {getFloorLayerIdByCode} from './feature/floor.js';
import {getGeometryCenter} from './utils/geom.js';
import {getLoadedTypes} from './redux/reducer/utils.js';
import {getNotYetAddedFeatures} from './utils/store.js';
import {
  isBuildingCode,
  isBuildingCodeOrLikeExpr,
  isBuildingLikeExpr,
  isCustomMarker,
  isDoorCode,
  isDoorCodeOrLikeExpr,
  isDoorLikeExpr,
  isOptPoiCtgUid,
  isRoomCode,
  isRoomCodeOrLikeExpr,
  isRoomLikeExpr,
} from './feature/utils.js';
import {markerLabel as optPoiMarkerLabel} from './style/optpoi.js';
import {refreshFloorBasedStores} from './source/source.js';

/**
 * @typedef {import("./feature/feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/source/Vector").VectorSourceEvent} ol.source.Vector.Event
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("./conf.js").RequiredOptions} RequiredOptions
 * @typedef {import("./conf.js").State} State
 */

/**
 * @typedef {Object} FeaturesOptions
 * @property {ol.source.Vector} source source
 * @property {TypeOptions} type type
 * @property {string} [where] where
 * @property {string} [method] method
 * @property {boolean} [returnGeometry] whether to return geometry
 * @property {Processor} [processor] processor
 */

/**
 * @typedef {Object} FeaturesByCodeOptions
 * @property {Array<string>} codes codes
 * @property {TypeOptions} type type
 * @property {ol.source.Vector} source source
 * @property {Array<string>} [likeExprs] like expressions
 * @property {Processor} [processor] processor
 */

/**
 * @typedef {Object} BuildingsByCodeOptions
 * @property {Array<string>} codes codes
 * @property {Array<string>} likeExprs like expressions
 */

/**
 * @typedef {Object} RoomsByCodeOptions
 * @property {Array<string>} codes codes
 * @property {Array<string>} likeExprs like expressions
 */

/**
 * @typedef {Object} DoorsByCodeOptions
 * @property {Array<string>} codes codes
 * @property {Array<string>} likeExprs like expressions
 */

/**
 * @typedef {Object} ComplexByIdsOptions
 * @property {Array<number>} ids ids
 * @property {Processor} [processor] processor
 */

/**
 * @typedef {Object} FeaturesForMapOptions
 * @property {ol.source.Vector} source source
 * @property {TypeOptions|function(): TypeOptions} type type
 * @property {string} [where] where
 * @property {string} [method] method
 * @property {Processor} [processor] processor
 * @property {Function} [callback] callback
 */

/**
 * @typedef {Object} OptPoiLoadOptions
 * @property {Array<string>} [ids] ids
 * @property {Array<string>} [labels] labels
 * @property {Array<string>} [workplaces] workplaces
 * @property {Array<string>} [poiFilter] poiFilter
 */

/**
 * @typedef {Object} FeaturesFromUrlOptions
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
 * @typedef {Object} LoadFloorsOptions
 * @property {string} targetId targetId
 * @property {string} floorCode floorCode
 * @property {boolean} newSelectedIsActive whether is already active
 */

/**
 * @typedef {Object} WaitForNewProcessedFeaturesOptions
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
 * @typedef {Object} ProcessorOptions
 * @property {Array<ol.Feature>} all all features
 * @property {Array<ol.Feature>} new new features
 * @property {Array<ol.Feature>} existing existing features
 */

/**
 * @typedef {Object} LoadOrDecorateMarkersOptions
 * @property {Array<string>} [poiFilter] poi filter
 * @property {Array<string>} [markerFilter] marker filter
 * @property {string} [lang] language
 * @property {string} targetId target
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

/**
 * @param {string} targetId targetId
 * @param {ComplexByIdsOptions} options opts
 * @return {Promise<Array<ol.Feature>>} complexes
 * @protected
 */
const complexByIds = async (targetId, options) => {
  return features({
    source: srcs.getComplexStore(targetId),
    type: COMPLEX_TYPE,
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
 * @param {string} targetId targetId
 * @param {string} where where
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
const loadUnits = async (targetId, where) => {
  return features({
    source: srcs.getUnitStore(targetId),
    type: UNIT_TYPE,
    method: 'POST',
    returnGeometry: false,
    where: where,
  });
};

/**
 * @param {string} targetId targetId
 * @param {Array<number>} buildingIds ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadUnitsByHeadquartersIds = async (targetId, buildingIds) => {
  const where = 'budova_sidelni_id IN (' + buildingIds.join() + ')';
  return loadUnits(targetId, where);
};

/**
 * @param {string} targetId targetId
 * @param {Array<number>} complexIds complex ids
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadUnitsByHeadquartersComplexIds = async (targetId, complexIds) => {
  const where = 'areal_sidelni_id IN (' + complexIds.join() + ')';
  return loadUnits(targetId, where);
};

/**
 * @param {string} targetId targetId
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} opts
 */
const unitLoadProcessor = async (targetId, options) => {
  const newBuildings = options.new;
  const buildingIdsToLoad = newBuildings.map((building) => {
    return building.get('inetId');
  });

  if (buildingIdsToLoad.length) {
    const units = await loadUnitsByHeadquartersIds(targetId, buildingIdsToLoad);
    newBuildings.forEach((building) => {
      const buildingUnits = units.filter((unit) => {
        return unit.get('budova_sidelni_id') === building.get('inetId');
      });
      building.set(BUILDING_UNITS_FIELD_NAME, buildingUnits);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {string} targetId targetId
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} promise
 * @protected
 */
const complexLoadProcessorWithUnits = async (targetId, options) => {
  const newComplexes = options.new;
  const complexIdsToLoad = newComplexes.map((complex) => {
    return complex.get(COMPLEX_ID_FIELD_NAME);
  });

  if (complexIdsToLoad.length) {
    const units = await loadUnitsByHeadquartersComplexIds(
      targetId,
      complexIdsToLoad
    );
    newComplexes.forEach((complex) => {
      const complexUnits = units.filter((unit) => {
        return (
          unit.get('areal_sidelni_id') === complex.get(COMPLEX_ID_FIELD_NAME)
        );
      });
      complex.set(COMPLEX_UNITS_FIELD_NAME, complexUnits);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {string} targetId targetId
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} processor
 * @protected
 */
const complexLoadProcessor = async (targetId, options) => {
  const newBuildings = options.new;
  let complexIdsToLoad = [];
  const buildingsToLoadComplex = [];
  newBuildings.forEach((building) => {
    const complexId = building.get(BUILDING_COMPLEX_ID_FIELD_NAME);
    if (mm_utils.isNumber(complexId)) {
      mm_assert.assertNumber(complexId);
      const complex = mm_complex.getById(targetId, complexId);
      if (complex) {
        building.set(BUILDING_COMPLEX_FIELD_NAME, complex);
      } else {
        complexIdsToLoad.push(complexId);
        buildingsToLoadComplex.push(building);
      }
    } else {
      building.set(BUILDING_COMPLEX_FIELD_NAME, null);
    }
  });

  complexIdsToLoad = [...new Set(complexIdsToLoad)];
  if (complexIdsToLoad.length) {
    const complexes = await complexByIds(targetId, {
      ids: complexIdsToLoad,
      processor: mm_utils.partial(complexLoadProcessorWithUnits, targetId),
    });
    buildingsToLoadComplex.forEach((building) => {
      const complexId = building.get(BUILDING_COMPLEX_ID_FIELD_NAME);
      const complex = mm_complex.getById(targetId, complexId, complexes);
      if (!complex) {
        throw new Error('Complex ' + complexId + ' not found.');
      }
      building.set(BUILDING_COMPLEX_FIELD_NAME, complex || null);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {string} targetId targetId
 * @param {ProcessorOptions} options opts
 * @return {Promise<ProcessorOptions>} opts
 */
const buildingLoadProcessor = async (targetId, options) => {
  const result = await Promise.all([
    complexLoadProcessor(targetId, options),
    unitLoadProcessor(targetId, options),
  ]);
  mm_assert.assertArray(result);
  result.forEach((opts) => {
    mm_assert.assert(opts === options);
    mm_assert.assert(mm_utils.arrayEquals(opts.all, options.all));
    mm_assert.assert(mm_utils.arrayEquals(opts.new, options.new));
    mm_assert.assert(mm_utils.arrayEquals(opts.existing, options.existing));
  });
  return result[0];
};

/**
 * @param {string} targetId targetId
 * @param {BuildingsByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const buildingsByCode = async (targetId, options) => {
  return featuresByCode({
    codes: options.codes,
    type: BUILDING_TYPE,
    source: srcs.getBuildingStore(targetId),
    likeExprs: options.likeExprs,
    processor: mm_utils.partial(buildingLoadProcessor, targetId),
  });
};

/**
 * @param {string} targetId targetId
 * @param {RoomsByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const roomsByCode = async (targetId, options) => {
  return featuresByCode({
    codes: options.codes,
    type: ROOM_TYPE,
    source: srcs.getRoomStore(targetId),
    likeExprs: options.likeExprs,
  });
};

/**
 * @param {string} targetId targetId
 * @param {DoorsByCodeOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const doorsByCode = async (targetId, options) => {
  return featuresByCode({
    codes: options.codes,
    likeExprs: options.likeExprs,
    type: DOOR_TYPE,
    source: srcs.getDoorStore(targetId),
  });
};

/**
 * @param {string} targetId targetId
 * @param {string} where where
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const loadFloors = (targetId, where) => {
  return features({
    source: srcs.getFloorStore(targetId),
    type: FLOOR_TYPE,
    returnGeometry: false,
    where: where,
  });
};

/**
 * @param {string} targetId targetId
 * @param {Array<string>|string|undefined} paramValue zoomTo or markers
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const featuresFromParam = async (targetId, paramValue) => {
  const values = /**@type {Array.<string>}*/ (
    mm_utils.isString(paramValue) ? [paramValue] : paramValue
  );
  const firstParamValue = values[0];
  let codes;
  let likeExprs;

  if (paramValue && paramValue.length) {
    if (isBuildingCodeOrLikeExpr(firstParamValue)) {
      codes = values.filter(isBuildingCode);
      likeExprs = values.filter(isBuildingLikeExpr);
      return await buildingsByCode(targetId, {
        codes: codes,
        likeExprs: likeExprs,
      });
    } else if (
      isRoomCodeOrLikeExpr(firstParamValue) ||
      isDoorCodeOrLikeExpr(firstParamValue)
    ) {
      const codeFilterFunction = isRoomCodeOrLikeExpr(firstParamValue)
        ? isRoomCode
        : isDoorCode;
      const likeExprFilterFunction = isRoomCodeOrLikeExpr(firstParamValue)
        ? isRoomLikeExpr
        : isDoorLikeExpr;
      codes = values.filter(codeFilterFunction);
      likeExprs = values.filter(likeExprFilterFunction);
      const buildingCodes = codes.map((code) => code.substring(0, 5));
      const buildingLikeExprs = [];
      likeExprs.forEach((expr) => {
        expr = expr.substring(0, 5);
        if (isBuildingCode(expr)) {
          buildingCodes.push(expr);
        } else if (isBuildingLikeExpr(expr)) {
          buildingLikeExprs.push(expr);
        }
      });
      mm_utils.removeArrayDuplicates(buildingCodes);
      mm_utils.removeArrayDuplicates(buildingLikeExprs);
      await buildingsByCode(targetId, {
        codes: buildingCodes,
        likeExprs: buildingLikeExprs,
      });
      const loadFunction = isRoomCodeOrLikeExpr(firstParamValue)
        ? roomsByCode
        : doorsByCode;
      const features = await loadFunction(targetId, {
        codes: codes,
        likeExprs: likeExprs,
      });
      features.forEach((feature, index) => {
        if (!mm_utils.isDefAndNotNull(feature.getGeometry())) {
          const locCode = /**@type {string}*/ (feature.get('polohKod'));
          const building = getBldgByCode(targetId, locCode);
          const bldgGeom = building.getGeometry();
          if (mm_utils.isDef(bldgGeom)) {
            mm_assert.assertExists(bldgGeom);
            feature.setGeometry(getGeometryCenter(bldgGeom, true));
          }
        }
      });
      return features;
    }
  }
  return [];
};

/**
 * @param {string} targetId targetId
 * @param {FeaturesForMapOptions} options options
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 */
const loadDefaultRooms = async (
  targetId,
  options,
  extent,
  resolution,
  projection
) => {
  const rooms = await featuresForMap(options, extent, resolution, projection);
  const defaultRoomStore = srcs.getDefaultRoomStore(targetId);
  const roomsToAdd = getNotYetAddedFeatures(defaultRoomStore, rooms);
  defaultRoomStore.addFeatures(roomsToAdd);
};

/**
 *
 * @param {redux.Store} store store
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 */
const loadActiveRooms = async (store, extent, resolution, projection) => {
  const activeFloorCodes = slctr.getActiveFloorCodes(store.getState());
  const targetId = slctr.getTargetId(store.getState());

  let where;
  if (activeFloorCodes.length > 0) {
    const conditions = [];
    activeFloorCodes.forEach((floorCode) =>
      conditions.push(`polohKod LIKE '${floorCode}%'`)
    );
    where = conditions.join(' OR ');
    const opts = {
      source: srcs.getRoomStore(targetId),
      type: ROOM_TYPE,
      where: where,
      method: 'POST',
    };
    const rooms = await featuresForMap(opts, extent, resolution, projection);
    const activeStore = srcs.getActiveRoomStore(targetId);
    mm_assert.assertInstanceof(activeStore, VectorSource);
    const roomsFromActiveFloor = rooms.filter((room) =>
      activeFloorCodes.includes(room.get('polohKod').substring(0, 8))
    );
    const roomsToAdd = getNotYetAddedFeatures(
      activeStore,
      roomsFromActiveFloor
    );
    activeStore.addFeatures(roomsToAdd);
  }
};

/**
 * @param {redux.Store} store store
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 */
const loadActiveDoors = async (store, extent, resolution, projection) => {
  const activeFloorCodes = slctr.getActiveFloorCodes(store.getState());
  const targetId = slctr.getTargetId(store.getState());
  let where;
  if (activeFloorCodes.length > 0) {
    const conditions = [];
    activeFloorCodes.forEach((floor) =>
      conditions.push(`polohKodPodlazi LIKE '${floor}%'`)
    );
    where = conditions.join(' OR ');
    const opts = {
      source: srcs.getDoorStore(targetId),
      type: DOOR_TYPE,
      where: where,
      method: 'POST',
    };
    const doors = await featuresForMap(opts, extent, resolution, projection);
    const activeStore = srcs.getActiveDoorStore(targetId);
    const doorsFromActiveFloor = doors.filter((door) =>
      activeFloorCodes.includes(door.get('polohKodPodlazi'))
    );
    const doorsToAdd = getNotYetAddedFeatures(
      activeStore,
      doorsFromActiveFloor
    );
    activeStore.addFeatures(doorsToAdd);
  }
};

/**
 * @param {redux.Store} store store
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 */
const loadActivePois = async (store, extent, resolution, projection) => {
  const activeFloorCodes = slctr.getActiveFloorCodes(store.getState());
  const targetId = slctr.getTargetId(store.getState());

  const entrances = [
    PoiPurpose.BUILDING_ENTRANCE,
    PoiPurpose.BUILDING_COMPLEX_ENTRANCE,
    PoiPurpose.COMPLEX_ENTRANCE,
  ];
  let where = `typ IN ('${entrances.join("', '")}')`;
  if (activeFloorCodes.length > 0) {
    const conditions = [];
    activeFloorCodes.forEach((floor) => {
      conditions.push(`polohKodPodlazi LIKE '${floor}%'`);
    });
    where += ' OR ' + conditions.join(' OR ');
  }
  where = '(' + where + ') AND volitelny = 0';
  const opts = {
    type: POI_TYPE,
    source: srcs.getPoiStore(targetId),
    where: where,
    method: 'POST',
  };
  const pois = await featuresForMap(opts, extent, resolution, projection);
  const activeStore = srcs.getActivePoiStore(targetId);
  const poisToAdd = getNotYetAddedFeatures(activeStore, pois);
  activeStore.addFeatures(poisToAdd);
};

/**
 * @param {string} targetId targetId
 * @param {OptPoiLoadOptions} options options
 * @return {Promise<Array<ol.Feature>>} load function
 */
const loadOptPois = (targetId, options) => {
  let labels = options.labels || [];
  const workplaces = options.workplaces || [];
  const poiFilter = options.poiFilter || [];
  const ids = options.ids || [];
  const idLabels = ids.map((id) => {
    const key = Object.keys(OptPoiIds).find((k) => OptPoiIds[k] === id);
    return OptPoiLabels[key];
  });
  labels = [...labels, ...idLabels];
  mm_utils.removeArrayDuplicates(labels);
  let where = `typ IN ('${labels.join("', '")}')`;
  where += ' AND volitelny=1';
  if (workplaces.length > 0) {
    where += ` AND pracoviste IN ('${workplaces.join("', '")}')`;
  }
  if (poiFilter.length > 0) {
    where += ` AND poznamka IN ('${poiFilter.join("', '")}')`;
  }
  const opts = {
    source: srcs.getOptPoiStore(targetId),
    type: OPT_POI_TYPE,
    where: where,
    method: 'POST',
    returnGeometry: false,
  };
  return features(opts);
};

/**
 * Load features by location codes or decorate custom markers.
 * @param {Array<string>|Array<ol.Feature>|undefined} featuresLike featuresLike
 * @param {LoadOrDecorateMarkersOptions} options options
 * @return {Promise<Array<ol.Feature>>} promise resolving with markers
 */
export const loadOrDecorateMarkers = async (featuresLike, options) => {
  const lang = options.lang;
  const targetId = options.targetId;
  const arrPromises = []; // array of promises of features

  if (!Array.isArray(featuresLike)) {
    return [];
  } else {
    featuresLike.forEach((el) => {
      if (!isOptPoiCtgUid(el)) {
        arrPromises.push(
          new Promise((resolve, reject) => {
            if (REQUIRED_CUSTOM_MARKERS[el]) {
              decorateCustomMarker(REQUIRED_CUSTOM_MARKERS[el]);
              resolve(REQUIRED_CUSTOM_MARKERS[el]);
            } else if (mm_utils.isString(el)) {
              featuresFromParam(targetId, el).then((results) => {
                resolve(results);
              });
            }
          })
        );
      } else {
        const workplaces = //HS
          options.markerFilter !== null ? [...options.markerFilter] : [];
        const ctgIds = [el.split(':')[1]];

        arrPromises.push(
          loadOptPois(targetId, {
            ids: ctgIds,
            workplaces: workplaces,
            poiFilter: options.poiFilter,
          }).then((features) => {
            const roomOptPois = features.filter((f) => {
              const lc = /**@type {string}*/ (f.get('polohKodLokace'));
              mm_assert.assertString(lc);
              return isRoomCode(lc);
            });
            const roomCodes = roomOptPois.map((f) => f.get('polohKodLokace'));
            MARKER_LABEL_STORE[`OPT_POI_MARKER_LABEL_${options.targetId}`] =
              optPoiMarkerLabel(ctgIds[0], roomCodes, lang);

            return new Promise((resolve, reject) => {
              featuresFromParam(targetId, roomCodes).then((rooms) => {
                resolve(addPoiDetail(rooms, features, lang));
              });
            });
          })
        );
      }
    });

    let markers = await Promise.all(arrPromises);
    // reduce array of arrays to 1 array
    markers = markers.reduce((a, b) => {
      a = a.concat(b);
      mm_utils.removeArrayDuplicates(a);
      return a;
    }, []);
    return markers;
  }
};

/**
 * @param {RequiredOptions} requiredOpts required options
 * @param {redux.Dispatch} asyncDispatch asynchronous dispatch method
 */
const loadMarkers = (requiredOpts, asyncDispatch) => {
  const requiredMarkers = requiredOpts.markerIds;
  const markerStrings = createMarkerStringsArray(requiredMarkers);
  loadOrDecorateMarkers(markerStrings, requiredOpts).then((res) => {
    mm_assert.assertMarkerFeatures(res);
    const loadedTypes = getLoadedTypes(res, requiredMarkers);
    const hasCustom = res.length && res.some((el) => isCustomMarker(el));
    asyncDispatch(actions.markers_loaded(hasCustom, loadedTypes));
  });
};

/**
 * @param {string} targetId targetId
 * @param {Array<string>|string} requiredZoomTo required zoom to
 * @param {redux.Dispatch} asyncDispatch asynchronous dispatch method
 */
const loadZoomTo = (targetId, requiredZoomTo, asyncDispatch) => {
  const zoomToStrings = createZoomToStringsArray(requiredZoomTo);
  featuresFromParam(targetId, zoomToStrings).then((res) => {
    const loadedTypes = getLoadedTypes(res);
    asyncDispatch(actions.zoomTo_loaded(loadedTypes));
  });
};

/**
 * @param {LoadFloorsOptions} options opts
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const loadFloorsByFloorLayer = (options, asyncDispatch) => {
  const {targetId, floorCode, newSelectedIsActive} = options;
  const flId = getFloorLayerIdByCode(targetId, floorCode);
  if (!newSelectedIsActive) {
    const where = 'vrstvaId = ' + flId;
    loadFloors(targetId, where).then((floors) => {
      if (floors) {
        refreshFloorBasedStores(targetId);
      }
      asyncDispatch(actions.floors_loaded(true));
    });
  }
};

/**
 * @param {string} targetId targetId
 * @param {State} newState new state
 * @param {Array<string>} requiredMarkers requred markers
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const clearAndLoadMarkers = (
  targetId,
  newState,
  requiredMarkers,
  asyncDispatch
) => {
  srcs.getMarkerStore(targetId).clear();
  srcs.getOptPoiStore(targetId).clear();
  srcs.getClusterStore(targetId).clear();

  const markerStrings = createMarkerStringsArray(requiredMarkers);
  loadOrDecorateMarkers(markerStrings, newState.requiredOpts).then((res) => {
    mm_assert.assertMarkerFeatures(res);
    const loadedTypes = getLoadedTypes(res, requiredMarkers);
    srcs.getMarkerStore(targetId).addFeatures(res);
    const hasCustom = res.length && res.some((el) => isCustomMarker(el));
    asyncDispatch(actions.markers_loaded(hasCustom, loadedTypes));
  });
};

/**
 * @param {string} locationCode location code
 * @param {State} state state
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const loadFloorsForMarker = (locationCode, state, asyncDispatch) => {
  const targetId = slctr.getTargetId(state);
  const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
  const activeFloorCodes = slctr.getActiveFloorCodes(state);
  loadFloors(targetId, where).then((floors) =>
    asyncDispatch(
      actions.floors_loaded(activeFloorCodes.includes(locationCode))
    )
  );
};

/**
 * @param {string} locationCode location code
 * @param {State} state state
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const loadFloorsForRoom = (locationCode, state, asyncDispatch) => {
  const targetId = slctr.getTargetId(state);
  const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
  loadFloors(targetId, where).then((floors) =>
    asyncDispatch(actions.floors_loaded(true))
  );
};

/**
 * @param {string} locationCode location code
 * @param {State} state state
 * @param {redux.Dispatch} asyncDispatch async dispatch
 */
const loadFloorsForBuilding = (locationCode, state, asyncDispatch) => {
  const targetId = slctr.getTargetId(state);
  const where = `polohKod LIKE '${locationCode.substring(0, 5)}%'`;
  loadFloors(targetId, where).then((floors) =>
    asyncDispatch(actions.floors_loaded(false))
  );
};

export {
  buildingFeaturesForMap,
  buildingLoadProcessor,
  clearAndLoadMarkers,
  featuresForMap,
  features,
  featuresFromParam,
  loadActiveDoors,
  loadActivePois,
  loadActiveRooms,
  loadDefaultRooms,
  loadFloors,
  loadFloorsByFloorLayer,
  loadFloorsForBuilding,
  loadFloorsForMarker,
  loadFloorsForRoom,
  loadMarkers,
  loadOptPois,
  loadZoomTo,
  pubtranFeaturesForMap,
};
