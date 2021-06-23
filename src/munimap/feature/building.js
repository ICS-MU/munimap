/**
 * @module building
 */
import * as munimap_assert from '../assert/assert.js';
import * as munimap_complex from './complex.js';
import * as munimap_floor from './floor.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_load from '../load.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_style from '../style/style.js';
import * as munimap_unit from './unit.js';
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {MUNIMAP_URL} from '../conf.js';
import {Vector as ol_layer_Vector} from 'ol/layer';
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy';
import {Vector as ol_source_Vector} from 'ol/source';
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid';

/**
 * @typedef {import("./type.js").Options} TypeOptions
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("../load.js").featuresForMap.Options} featuresForMapOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("../load.js").Processor.Options} Processor.Options
 * @typedef {import("ol/featureloader")} ol.FeatureLoader
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 */

/**
 * @type {RegExp}
 * @protected
 */
const CODE_REGEX = /^[A-Z]{3}[0-9]{2}$/gi;

/**
 * @type {RegExp}
 * @protected
 */
const LIKE_EXPR_REGEX = /^[A-Z_]{3}[0-9_]{2}$/gi;

/**
 * @type {string}
 */
const LOCATION_CODE_FIELD_NAME = 'polohKod';

/**
 * @type {string}
 * @protected
 */
const COMPLEX_FIELD_NAME = 'areal';

/**
 * @type {string}
 */
const COMPLEX_ID_FIELD_NAME = 'arealId';

/**
 * @type {string}
 */
const UNITS_FIELD_NAME = 'pracoviste';

/**
 * @type {string}
 * @const
 */
const LAYER_ID = 'building';

/**
 * @type {string}
 * @const
 */
const LABEL_LAYER_ID = 'building-label';

/**
 * @param {Processor.Options} options opts
 * @return {Promise<Processor.Options>} opts
 */
const unitsProcessor = async (options) => {
  const newBuildings = options.new;
  const buildingIdsToLoad = newBuildings.map((building) => {
    return building.get('inetId');
  });

  if (buildingIdsToLoad.length) {
    const units = await munimap_unit.loadByHeadquartersIds(buildingIdsToLoad);
    newBuildings.forEach((building) => {
      const buildingUnits = units.filter((unit) => {
        return unit.get('budova_sidelni_id') === building.get('inetId');
      });
      building.set(UNITS_FIELD_NAME, buildingUnits);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {Processor.Options} options opts
 * @return {Promise<Processor.Options>} promise
 * @protected
 */
const complexUnitsProcessor = async (options) => {
  const newComplexes = options.new;
  const complexIdsToLoad = newComplexes.map((complex) => {
    return complex.get(munimap_complex.ID_FIELD_NAME);
  });

  if (complexIdsToLoad.length) {
    const units = await munimap_unit.loadByHeadquartersComplexIds(
      complexIdsToLoad
    );
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
 * @param {Processor.Options} options opts
 * @return {Promise<Processor.Options>} processor
 * @protected
 */
const complexProcessor = async (options) => {
  const newBuildings = options.new;
  let complexIdsToLoad = [];
  const buildingsToLoadComplex = [];
  newBuildings.forEach((building) => {
    const complexId = building.get(COMPLEX_ID_FIELD_NAME);
    if (munimap_utils.isNumber(complexId)) {
      munimap_assert.assertNumber(complexId);
      const complex = munimap_complex.getById(complexId);
      if (complex) {
        building.set(COMPLEX_FIELD_NAME, complex);
      } else {
        complexIdsToLoad.push(complexId);
        buildingsToLoadComplex.push(building);
      }
    } else {
      building.set(COMPLEX_FIELD_NAME, null);
    }
  });

  complexIdsToLoad = [...new Set(complexIdsToLoad)];
  if (complexIdsToLoad.length) {
    const complexes = await munimap_complex.loadByIds({
      ids: complexIdsToLoad,
      processor: complexUnitsProcessor,
    });
    buildingsToLoadComplex.forEach((building) => {
      const complexId = building.get(COMPLEX_ID_FIELD_NAME);
      const complex = munimap_complex.getById(complexId, complexes);
      if (!complex) {
        throw new Error('Complex ' + complexId + ' not found.');
      }
      building.set(COMPLEX_FIELD_NAME, complex || null);
    });
    return options;
  } else {
    return options;
  }
};

/**
 * @param {Processor.Options} options opts
 * @return {Promise<Processor.Options>} opts
 */
const loadProcessor = async (options) => {
  const result = await Promise.all([
    complexProcessor(options),
    unitsProcessor(options),
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
 * @param {featuresForMapOptions} options options
 * @param {ol.extent.Extent} extent extent
 * @param {number} resolution resolution
 * @param {ol.proj.Projection} projection projection
 * @return {Promise<Array<Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
const featuresForMap = async (options, extent, resolution, projection) => {
  const buildings = await munimap_load.featuresForMap(
    options,
    extent,
    resolution,
    projection
  );

  // if (buildings.length) {
  //   munimap_LIST.forEach((map) => {
  //     const view = map.getView();
  //     const res = view ? view.getResolution() : null;
  //     if (res) {
  //       munimap_cluster.updateClusteredFeatures(map, res);
  //     }
  //   });
  // }
  return buildings;
};

/**
 *
 * @type {TypeOptions}
 */
export const TYPE = {
  primaryKey: LOCATION_CODE_FIELD_NAME,
  serviceUrl: MUNIMAP_URL,
  layerId: 2,
  name: 'building',
};

/**
 * @type {ol.source.Vector}
 * @const
 */
const STORE = new ol_source_Vector({
  strategy: ol_loadingstrategy_tile(
    ol_tilegrid_createXYZ({
      tileSize: 512,
    })
  ),
});
STORE.setLoader(
  munimap_utils.partial(featuresForMap, {
    source: STORE,
    type: TYPE,
    processor: loadProcessor,
  })
);

/**
 * @param {string} maybeCode location code
 * @return {boolean} if it it location code or not
 */
const isCode = (maybeCode) => {
  return !!maybeCode.match(CODE_REGEX);
};

/**
 * @param {string} code code
 */
const assertCode = (code) => {
  munimap_assert.assert(
    !!isCode(code),
    'Location code of building should consist of 3 letters and 2 digits.'
  );
};

/**
 * @param {string} maybeLikeExpr maybeLikeExpr
 * @return {boolean} isLikeExpr
 */
const isLikeExpr = (maybeLikeExpr) => {
  return (
    !!maybeLikeExpr.match(LIKE_EXPR_REGEX) && maybeLikeExpr.indexOf('_') >= 0
  );
};

/**
 * @param {string} maybeCodeOrLikeExpr location code or like expression
 * @return {boolean} if it it location code or not
 */
export const isCodeOrLikeExpr = (maybeCodeOrLikeExpr) => {
  return isCode(maybeCodeOrLikeExpr) || isLikeExpr(maybeCodeOrLikeExpr);
};

/**
 * @param {string} code code
 */
const assertCodeOrLikeExpr = (code) => {
  munimap_assert.assert(
    !!code.match(LIKE_EXPR_REGEX),
    'Location code of building should consist of 3 letters and 2 digits. ' +
      'Any of these characters might be replaced with _ wildcard.'
  );
};

/**
 * @return {ol.source.Vector} Store
 */
export const getStore = () => {
  return STORE;
};

/**
 * @return {TypeOptions} Type
 */
export const getType = () => {
  return TYPE;
};

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === LAYER_ID;
};

/**
 * @param {ol.Map} map map
 * @return {ol.layer.Vector|undefined} vector
 */
const getLayer = (map) => {
  const layers = map.getLayers().getArray();
  const result = layers.find(isLayer);
  if (result) {
    munimap_assert.assert(
      result instanceof ol_layer_Vector,
      'Expected instanceof ol/layer/Vector.'
    );
  }
  return /**@type {ol.layer.Vector|undefined}*/ (result);
};

/**
 * @param {Feature|ol.render.Feature} feature feature
 * @return {boolean} isBuilding
 */
const isBuilding = (feature) => {
  const code = feature.get(LOCATION_CODE_FIELD_NAME);
  return munimap_utils.isString(code) && isCode(/** @type {string}*/ (code));
};

/**
 * @param {feature.clickHandlerOptions} options options
 * @return {boolean} isClickable
 */
const isClickable = (options) => {
  // const feature = options.feature;
  // const map = options.map;
  // const resolution = options.resolution;

  // if (range.contains(floor.RESOLUTION, resolution)) {
  //   return !isSelected(feature, map) && hasInnerGeometry(feature);
  // } else if (hasInnerGeometry(feature)) {
  //   var markers = marker.getStore(map).getFeatures();
  //   return markers.indexOf(feature) >= 0 || resolution < complex.RESOLUTION.max;
  // }
  return false;
};

/**
 * @param {feature.clickHandlerOptions} options options
 */
const featureClickHandler = (options) => {
  console.log('Yot implemented yet');
  // var feature = options.feature;
  // var map = options.map;
  // var pixel = options.pixel;
  // var resolution = options.resolution;
  // var identifyCallback = getProps(map).options.identifyCallback;

  // var isVisible = range.contains(floor.RESOLUTION, resolution);
  // if (!isVisible && !munimap_utils.isDef(identifyCallback)) {
  //   var point = feature.getClosestPointToPixel(map, feature, pixel);
  //   munimap_map.zoomToPoint(map, point, floor.RESOLUTION.max);
  // }
  // changeFloor(map, feature);
  // if (isVisible) {
  //   info.refreshVisibility(map);
  // }
};

/**
 * @param {Feature} building building
 * @return {boolean} hasInnerGeom
 */
const hasInnerGeometry = (building) => {
  const hasInnerGeometry = /**@type {number}*/ (building.get(
    'maVnitrniGeometrii'
  ));
  let result;
  switch (hasInnerGeometry) {
    case 1:
      result = true;
      break;
    default:
      result = false;
  }
  return result;
};

/**
 * @param {string} code code
 * @return {Feature} building
 */
const getByCode = (code) => {
  code = code.substr(0, 5);
  const features = STORE.getFeatures();
  const building = features.find((feature) => {
    const idProperty = TYPE.primaryKey;
    return feature.get(idProperty) === code;
  });
  return building || null;
};

/**
 * @param {Feature|ol.render.Feature} building building
 * @return {string} location code
 */
const getLocationCode = (building) => {
  const result = building.get(LOCATION_CODE_FIELD_NAME);
  munimap_assert.assertString(
    result,
    'Something is wrong! Location code of building should be a string!'
  );
  return /** @type {string}*/ (result);
};

/**
 * @param {Feature} building bldg
 * @return {Array<Feature>} units
 */
const getUnits = (building) => {
  const result = building.get(UNITS_FIELD_NAME);
  munimap_assert.assertArray(result);
  return /**@type {Array<Feature>}*/ (result);
};

/**
 * @param {Array.<Feature>} buildings bldgs
 * @return {Array.<Feature>} hedquaters
 */
const filterHeadquaters = (buildings) => {
  return buildings.filter((bldg) => {
    return getUnits(bldg).length > 0;
  });
};

/**
 * @param {Array.<Feature>} buildings bldgs
 * @return {Array.<Feature>} faculty headquaters
 */
const filterFacultyHeadquaters = (buildings) => {
  return buildings.filter((bldg) => {
    return getUnits(bldg).some((unit) => {
      return munimap_unit.getPriority(unit) > 0;
    });
  });
};

/**
 * @param {Feature} building bldg
 * @param {string} lang lang
 * @param {string=} opt_separator separator
 * @return {string} building title without organizational unit
 */
const getTitleWithoutOrgUnit = (building, lang, opt_separator) => {
  let result;
  const title = /**@type {string}*/ (building.get(
    munimap_lang.getMsg(
      munimap_lang.Translations.BUILDING_TITLE_FIELD_NAME,
      lang
    )
  ));
  result = title.split(', ');
  result.shift();
  result.reverse();
  result = result.join(opt_separator || ', ');
  return result;
};

/**
 * @param {Feature|ol.render.Feature} building building
 * @param {ol.Map} map map
 * @return {boolean} whereas is selected
 */
const isSelected = (building, map) => {
  return false; //not implemented yet
  // munimap_assert.assert(isBuilding(building));
  // const locCode = getLocationCode(building);
  // const selectedBuilding = munimap.getProps(map).selectedBuilding;
  // return locCode === selectedBuilding;
};

/**
 * @param {Feature} feature feature
 * @param {string} lang lang
 * @param {number} [opt_resolution] resolution
 * @return {string} name part
 */
const getNamePart = (feature, lang, opt_resolution) => {
  const units = getUnits(feature);
  const titleParts = munimap_unit.getTitleParts(units, lang);
  return titleParts.join('\n');
};

/**
 * @param {Feature} building bldg
 * @return {Feature} complex
 */
const getComplex = (building) => {
  const result = building.get(COMPLEX_FIELD_NAME);
  munimap_assert.assert(result === null || result instanceof Feature);
  return result;
};

/**
 * @param {Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} lang language
 * @return {string} address part
 */
const getAddressPart = (feature, resolution, lang) => {
  const titleParts = [];
  if (munimap_utils.isDefAndNotNull(getComplex(feature))) {
    const bldgAbbr = feature.get(
      munimap_lang.getMsg(
        munimap_lang.Translations.BUILDING_ABBR_FIELD_NAME,
        lang
      )
    );
    if (munimap_utils.isDefAndNotNull(bldgAbbr)) {
      if (munimap_range.contains(munimap_floor.RESOLUTION, resolution)) {
        const bldgType = feature.get(
          munimap_lang.getMsg(
            munimap_lang.Translations.BUILDING_TYPE_FIELD_NAME,
            lang
          )
        );
        if (munimap_utils.isDefAndNotNull(bldgType)) {
          munimap_assert.assertString(bldgAbbr);
          munimap_assert.assertString(bldgType);
          const units = getUnits(feature);
          if (units.length === 0) {
            titleParts.push(
              munimap_style.alignTextToRows([bldgType, bldgAbbr], ' ')
            );
          } else {
            titleParts.push(bldgType + ' ' + bldgAbbr);
          }
        }
      } else {
        titleParts.push(bldgAbbr);
      }
    } else {
      titleParts.push(getTitleWithoutOrgUnit(feature, lang, '\n'));
    }
  } else {
    titleParts.push(getTitleWithoutOrgUnit(feature, lang, '\n'));
  }
  return titleParts.join('\n');
};

/**
 * @param {Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} lang lang
 * @return {string} label
 */
const getDefaultLabel = (feature, resolution, lang) => {
  const result = [];
  const namePart = getNamePart(feature, lang, resolution);
  if (namePart) {
    result.push(namePart);
  }

  const complex = getComplex(feature);
  if (
    !namePart ||
    !complex ||
    munimap_complex.getBuildingCount(complex) === 1 ||
    resolution < munimap_complex.RESOLUTION.min
  ) {
    const addressPart = getAddressPart(feature, resolution, lang);
    if (addressPart) {
      result.push(addressPart);
    }
  }
  return result.join('\n');
};

/**
 * @param {Feature} building bldg
 * @return {Array<Feature>} faculties
 */
const getFaculties = (building) => {
  const units = getUnits(building);
  const result = units.filter((unit) => munimap_unit.getPriority(unit) > 0);
  return result;
};

export {
  LAYER_ID,
  LABEL_LAYER_ID,
  STORE,
  isClickable,
  featureClickHandler,
  isCode,
  isLikeExpr,
  loadProcessor,
  isBuilding,
  hasInnerGeometry,
  isSelected,
  getDefaultLabel,
  getUnits,
  getFaculties,
  getAddressPart,
  getComplex,
};
