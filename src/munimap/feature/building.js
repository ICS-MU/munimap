/**
 * @module feature/building
 */
import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_complex from './complex.js';
import * as munimap_floor from './floor.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_style from '../style/style.js';
import * as munimap_unit from './unit.js';
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {MUNIMAP_URL} from '../conf.js';
import {getStore as getBuildingStore} from '../source/building.js';
import {getStore as getMarkerStore} from '../source/marker.js';
import {isDoor} from './door.js';
import {isRoom} from './room.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("ol/source").Vector} ol.source.Vector
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/proj/Projection").default} ol.proj.Projection
 * @typedef {import("../load.js").FeaturesForMapOptions} featuresForMapOptions
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 * @typedef {import("ol/layer/Vector").default} ol.layer.Vector
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("../load.js").ProcessorOptions} ProcessorOptions
 * @typedef {import("ol/featureloader")} ol.FeatureLoader
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("../feature/floor.js").Options} FloorOptions
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @typedef {Object} TitleOptions
 * @property {string} selectedFeature selectedFeature
 * @property {string} lang lang
 * @property {string} targetId targetId
 *
 * @typedef {Object} TitleResult
 * @property {string} bldgTitle title
 * @property {string} complexTitle title
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
 *
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} Type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: LOCATION_CODE_FIELD_NAME,
      serviceUrl: MUNIMAP_URL,
      layerId: 2,
      name: 'building',
    };
  }
  return TYPE;
};

/**
 * @param {string} maybeCode location code
 * @return {boolean} if it it location code or not
 */
const isCode = (maybeCode) => {
  return !!maybeCode.match(CODE_REGEX);
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
 * @param {Feature|ol.render.Feature} feature feature
 * @return {boolean} isBuilding
 */
const isBuilding = (feature) => {
  const code = feature.get(LOCATION_CODE_FIELD_NAME);
  return munimap_utils.isString(code) && isCode(/** @type {string}*/ (code));
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
 * @param {Feature|ol.render.Feature} building building
 * @return {boolean} hasInnerGeom
 */
const hasInnerGeometry = (building) => {
  const hasInnerGeometry = /**@type {number}*/ (
    building.get('maVnitrniGeometrii')
  );
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
 * @param {Feature|ol.render.Feature} building building
 * @param {string} selectedFeature selected feature
 * @return {boolean} whereas is selected
 */
const isSelected = (building, selectedFeature) => {
  munimap_assert.assert(isBuilding(building));
  const locCode = getLocationCode(building);
  //selectedFeature doesn't have to be only building
  return selectedFeature ? locCode === selectedFeature.substring(0, 5) : false;
};

/**
 * @param {string} newCode new code
 * @param {string} oldCode old code
 * @return {boolean} whether is selected different code
 */
const isSameCode = (newCode, oldCode) =>
  newCode && oldCode && newCode.slice(0, 5) !== oldCode.slice(0, 5);

/**
 * @param {IsClickableOptions} options options
 * @return {boolean} isClickable
 */
const isClickable = (options) => {
  const {feature, resolution, selectedFeature, isIdentifyEnabled, targetId} =
    options;

  if (munimap_range.contains(munimap_floor.RESOLUTION, resolution)) {
    return isIdentifyEnabled
      ? !isSelected(feature, selectedFeature)
      : !isSelected(feature, selectedFeature) && hasInnerGeometry(feature);
  } else if (hasInnerGeometry(feature) || isIdentifyEnabled) {
    const markers = getMarkerStore(targetId).getFeatures();
    return (
      markers.indexOf(feature) >= 0 ||
      resolution < munimap_complex.RESOLUTION.max
    );
  }
  return false;
};

/**
 * @param {redux.Dispatch} dispatch dispatch
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (dispatch, options) => {
  dispatch(actions.buildingClicked(options));
};

/**
 * @param {string} targetId targetId
 * @param {string} code code
 * @return {Feature} building
 */
const getByCode = (targetId, code) => {
  code = code.substring(0, 5);
  const features = getBuildingStore(targetId).getFeatures();
  const building = features.find((feature) => {
    const idProperty = TYPE.primaryKey;
    return feature.get(idProperty) === code;
  });
  return building || null;
};

/**
 * @param {string} code code
 * @param {string} targetId targetId
 * @param {ol.extent.Extent} extent extent
 * @return {boolean} whether is in extent
 */
const isInExtent = (code, targetId, extent) => {
  munimap_assert.assertString(code);
  const building = getByCode(targetId, code);
  const geom = building.getGeometry();
  return geom.intersectsExtent(extent);
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
 * @param {Array<Feature>} buildings bldgs
 * @return {Array<Feature>} hedquaters
 */
const filterHeadquaters = (buildings) => {
  return buildings.filter((bldg) => {
    return getUnits(bldg).length > 0;
  });
};

/**
 * @param {Array<Feature>} buildings bldgs
 * @return {Array<Feature>} faculty headquaters
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
 * @param {string} [opt_separator] separator
 * @return {string} building title without organizational unit
 */
const getTitleWithoutOrgUnit = (building, lang, opt_separator) => {
  let result;
  const title = /**@type {string}*/ (
    building.get(
      munimap_lang.getMsg(
        munimap_lang.Translations.BUILDING_TITLE_FIELD_NAME,
        lang
      )
    )
  );
  result = title.split(', ');
  result.shift();
  result.reverse();
  result = result.join(opt_separator || ', ');
  return result;
};

/**
 * @param {string} targetId targetId
 * @param {Feature} building building
 * @return {string} floor code
 */
const getSelectedFloorCode = (targetId, building) => {
  let floorCode;
  const markerSource = getMarkerStore(targetId);
  const markedFeatures = markerSource.getFeatures();
  if (markedFeatures.length > 0) {
    const firstMarked = markedFeatures.find((marked) => {
      if (isRoom(marked) || isDoor(marked)) {
        const buildingLocCode = getLocationCode(building);
        const locationCode = /**@type {string}*/ (marked.get('polohKod'));
        return locationCode.substring(0, 5) === buildingLocCode;
      } else {
        return false;
      }
    });

    if (firstMarked) {
      const firstMarkedCode = /**@type {string}*/ (firstMarked.get('polohKod'));
      floorCode = firstMarkedCode.substring(0, 8);
    }
  }
  if (!floorCode) {
    floorCode = building.get('vychoziPodlazi');
  }

  return floorCode;
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

/**
 * @param {TitleOptions} options options
 * @return {TitleResult} result
 */
const getTitle = (options) => {
  const {selectedFeature, targetId, lang} = options;
  if (!selectedFeature) {
    return {bldgTitle: '', complexTitle: ''};
  }

  let bldgTitle = '';
  let complexTitle = '';
  const building = getByCode(targetId, selectedFeature);
  if (building) {
    bldgTitle = /**@type {string}*/ (
      building.get(
        munimap_lang.getMsg(
          munimap_lang.Translations.BUILDING_TITLE_FIELD_NAME,
          lang
        )
      )
    );
    const complex = getComplex(building);
    if (munimap_utils.isDefAndNotNull(complex)) {
      complexTitle = /**@type {string}*/ (
        complex.get(
          munimap_lang.getMsg(
            munimap_lang.Translations.COMPLEX_TITLE_FIELD_NAME,
            lang
          )
        )
      );
      const buildingType = /**@type {string}*/ (
        building.get(
          munimap_lang.getMsg(
            munimap_lang.Translations.BUILDING_TYPE_FIELD_NAME,
            lang
          )
        )
      );
      const buildingTitle = /**@type {string}*/ (
        building.get(
          munimap_lang.getMsg(
            munimap_lang.Translations.BUILDING_ABBR_FIELD_NAME,
            lang
          )
        )
      );
      if (
        munimap_utils.isDefAndNotNull(buildingType) &&
        munimap_utils.isDefAndNotNull(buildingTitle)
      ) {
        bldgTitle = buildingType + ' ' + buildingTitle;
      } else {
        if (munimap_complex.getBuildingCount(complex) === 1) {
          bldgTitle = getNamePart(building, lang);
        } else {
          bldgTitle = getTitleWithoutOrgUnit(building, lang);
        }
      }
    } else {
      bldgTitle = getTitleWithoutOrgUnit(building, lang);
    }
  }
  return {bldgTitle, complexTitle};
};

export {
  COMPLEX_FIELD_NAME,
  COMPLEX_ID_FIELD_NAME,
  UNITS_FIELD_NAME,
  featureClickHandler,
  filterFacultyHeadquaters,
  filterHeadquaters,
  getAddressPart,
  getByCode,
  getComplex,
  getDefaultLabel,
  getFaculties,
  getLocationCode,
  getSelectedFloorCode,
  getTitle,
  getType,
  getUnits,
  hasInnerGeometry,
  isBuilding,
  isClickable,
  isCode,
  isInExtent,
  isLikeExpr,
  isSameCode,
  isSelected,
};
