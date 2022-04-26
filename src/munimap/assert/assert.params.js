/* eslint-disable no-console */
/**
 * @module assert/assert.params
 */

import * as mm_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {Abbr} from '../lang/lang.js';
import {
  AssertionError,
  assert,
  assertArray,
  assertBoolean,
  assertElement,
  assertFunction,
  assertInstanceof,
} from './assert.js';
import {BasemapIds} from '../layer/constants.js';
import {IdentifyTypes} from '../identify/constants.js';
import {
  isBuildingCodeOrLikeExpr,
  isCustomMarkerSuitable,
  isDoorCodeOrLikeExpr,
  isOptPoiCtgUid,
  isRoomCodeOrLikeExpr,
} from '../feature/utils.js';

/**
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("../feature/feature.js").getMainFeatureAtPixelFunction} getMainFeatureAtPixelFunction
 * @typedef {import("../identify/identify.js").CallbackFunction} IdentifyCallbackFunction
 * @typedef {import("../create.js").Options} Options
 */

/**
 * @param {string|Element} target target
 */
const target = (target) => {
  if (mm_utils.isString(target)) {
    assertElement(
      document.getElementById(/**@type {string}*/ (target)),
      'Target element "' + target + '" not found in document.'
    );
  } else {
    assertElement(target);
    assert(
      document.body.contains(/**@type {Element}*/ (target)),
      'Target element is not in document.'
    );
  }
};

/**
 * @param {number|undefined} zoom zoom
 */
const zoom = (zoom) => {
  assert(
    zoom === undefined || (zoom >= 0 && zoom <= 30),
    'Zoom should be in range <0,30>.'
  );
};

/**
 * @param {Array<string>|string|undefined} zoomTo zoomTo
 */
const zoomTo = (zoomTo) => {
  if (zoomTo !== undefined) {
    assert(
      mm_utils.isArray(zoomTo) || mm_utils.isString(zoomTo),
      'ZoomTo should be string or array of strings.'
    );

    zoomTo = /**@type {Array.<string>}*/ (
      mm_utils.isString(zoomTo) ? [zoomTo] : zoomTo
    );

    const onlyBuildings = zoomTo.every(isBuildingCodeOrLikeExpr);
    if (!onlyBuildings) {
      const onlyRooms = zoomTo.every(isRoomCodeOrLikeExpr);
      if (!onlyRooms) {
        throw new AssertionError(
          'ZoomTo should contain only building or only room' +
            ' location codes or corresponding LIKE expressions.'
        );
      }
    }
  }
};

/**
 * @param {string|undefined} lang lang
 */
const lang = (lang) => {
  if (lang !== undefined) {
    if (mm_utils.isString(lang)) {
      switch (lang) {
        case Abbr.CZECH:
        case Abbr.ENGLISH:
          break;
        default:
          const values = [];
          for (const langCode in Abbr) {
            values.push(Abbr[langCode]);
          }
          throw new AssertionError(
            `Parameter lang contains unknown value. ` +
              `List of possible values:  ${values.join(', ')}.`
          );
      }
    } else {
      throw new AssertionError('Parameter lang should be string.');
    }
  }
};

/**
 * @param {Array<string>|Array<ol.Feature>|undefined} markers markers
 */
const markers = (markers) => {
  if (markers !== undefined) {
    assertArray(markers, 'Markers should be an array.');
    const featureMarkers = [];

    markers.forEach((el) => {
      if (mm_utils.isString(el)) {
        if (
          !isBuildingCodeOrLikeExpr(el) &&
          !isRoomCodeOrLikeExpr(el) &&
          !isDoorCodeOrLikeExpr(el) &&
          !isOptPoiCtgUid(el)
        ) {
          console.log(
            'Markers should contain 1. building, room or ' +
              'door location codes, or 2. corresponding LIKE expressions, or ' +
              '3. POI categories.'
          );
        }
      } else if (el instanceof Feature) {
        assertInstanceof(el, Feature);
        featureMarkers.push(el);
        assert(
          isCustomMarkerSuitable(el),
          'Custom marker represented by ol.Feature must have ol.Point geometry ' +
            'with appropriate longitude (-180;180) and latitude (-90, 90).'
        );
      } else {
        console.log(
          'Markers should contain only strings or only instances of ol.Feature'
        );
      }
    });
    if (markers.some((el) => isOptPoiCtgUid(el))) {
      if (markers.some((el) => !isOptPoiCtgUid(el))) {
        console.log(
          'Markers should contain 1. building, room or ' +
            'door location codes, or 2. corresponding LIKE expressions, or ' +
            '3. POI categories.'
        );
      } else if (markers.length > 1) {
        throw new AssertionError('Only one POI category is allowed.');
      }
    }
  }
};

/**
 * @param {string|undefined} baseMap basemap
 */
const baseMap = (baseMap) => {
  if (baseMap !== undefined) {
    if (mm_utils.isString(baseMap)) {
      const baseMaps = Object.values(BasemapIds);
      if (!baseMaps.includes(baseMap)) {
        throw new AssertionError(
          `Parameter baseMap contains unknown value. ` +
            `List of possible values: ${baseMaps.join(', ')}.`
        );
      }
    } else {
      throw new AssertionError('Parameter baseMap should be string.');
    }
  }
};

/**
 * @param {boolean|undefined} mapLinks maplinks
 */
const mapLinks = (mapLinks) => {
  if (mapLinks !== undefined) {
    assertBoolean(
      mapLinks,
      'Parameter mapLinks should be boolean (true or false).'
    );
  }
};

/**
 * @param {boolean|undefined} locationCodes codes
 */
const locationCodes = (locationCodes) => {
  if (locationCodes !== undefined) {
    assertBoolean(
      locationCodes,
      'Parameter locationCodes should be boolean (true or false).'
    );
  }
};

/**
 * @param {boolean|undefined} labels labels
 */
const labels = (labels) => {
  if (labels !== undefined) {
    assertBoolean(
      labels,
      'Parameter labels should be boolean (true or false).'
    );
  }
};

/**
 * @param {boolean|undefined} pubTran pubtran
 */
const pubTran = (pubTran) => {
  if (pubTran !== undefined) {
    assertBoolean(
      pubTran,
      'Parameter pubTran should be boolean (true or false).'
    );
  }
};

/**
 * @param {Array<string>|undefined} filterArray filterArray
 */
const markerFilter = (filterArray) => {
  if (filterArray !== undefined) {
    assert(
      mm_utils.isArray(filterArray),
      'Parameter markerFilter should be array of strings.'
    );
  }
};

/**
 * @param {Array<string>|undefined} filterArray filterArray
 */
const poiFilter = (filterArray) => {
  if (filterArray !== undefined) {
    assert(
      mm_utils.isArray(filterArray),
      'Parameter poiFilter should be array of strings.'
    );
  }
};

/**
 * @param {getMainFeatureAtPixelFunction|undefined} fn function
 */
const getMainFeatureAtPixel = (fn) => {
  if (mm_utils.isDef(fn)) {
    assertFunction(
      fn,
      'Parameter getMainFeatureAtPixel ' +
        'should be a function of type "getMainFeatureAtPixelFunction".'
    );
  }
};

/**
 * @param {Array<string>|undefined} types types
 */
const identifyTypes = (types) => {
  if (types !== undefined) {
    assert(Array.isArray(types), 'Identify types should be an array.');

    types.forEach((type) => {
      if (mm_utils.isString(type)) {
        const identifyTypes = Object.values(IdentifyTypes);
        if (!identifyTypes.includes(type)) {
          throw new AssertionError(
            'Parameter identifyTypes contains unknown value. ' +
              `List of possible values: ${identifyTypes.join(', ')}.`
          );
        }
      } else {
        throw new AssertionError('Identify type should be string.');
      }
    });
  }
};

/**
 * @param {IdentifyCallbackFunction|undefined} fce fce
 */
const identifyCallback = (fce) => {
  if (mm_utils.isDef(fce)) {
    assertFunction(fce, 'Parameter identifyCallback should be function.');
  }
};

/**
 * @param {Options} options opts
 */
const assertOptions = (options) => {
  target(options.target);
  assert(
    options.zoom === undefined || options.zoomTo === undefined,
    "Zoom and zoomTo options can't be defined together."
  );
  assert(
    options.center === undefined || options.zoomTo === undefined,
    "Center and zoomTo options can't be defined together."
  );
  zoom(options.zoom);
  zoomTo(options.zoomTo);
  getMainFeatureAtPixel(options.getMainFeatureAtPixel);
  markers(options.markers);
  // mm_assert.layers(options.layers);
  lang(options.lang);
  baseMap(options.baseMap);
  pubTran(options.pubTran);
  locationCodes(options.locationCodes);
  mapLinks(options.mapLinks);
  labels(options.labels);
  markerFilter(options.markerFilter);
  poiFilter(options.poiFilter);
  identifyTypes(options.identifyTypes);
  identifyCallback(options.identifyCallback);
  if (
    mm_utils.isDef(options.identifyTypes) &&
    !mm_utils.isDef(options.identifyCallback)
  ) {
    throw new AssertionError(
      'IdentifyTypes must be defined together with identifyCallback.'
    );
  }
};

export {
  assertOptions,
  baseMap,
  target,
  getMainFeatureAtPixel,
  identifyCallback,
  identifyTypes,
  labels,
  lang,
  locationCodes,
  mapLinks,
  markerFilter,
  markers,
  poiFilter,
  pubTran,
  zoom,
  zoomTo,
};
