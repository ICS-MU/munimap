/* eslint-disable no-console */

/**
 * @module assert/assert
 */

import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {Abbr} from '../lang/lang.js';
import {BASEMAPS} from '../layer/basemap.js';
import {isCodeOrLikeExpr as isBldgCodeOrLikeExpr} from '../feature/building.js';
import {isCodeOrLikeExpr as isRoomCodeOrLikeExpr} from '../feature/room.js';
import {assertSuitable as marker_custom_assertSuitable} from '../feature/marker.custom.js';

/**
 * @typedef {import("ol/Feature").default} ol.Feature
 */

/**
 * @extends {Error}
 */
class AssertionError extends Error {
  /**
   * @param {string} message msg
   */
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * @param {*} assertion Assertion we expected to be truthy.
 * @param {string} [opt_msg] optional message
 * @return {boolean} assertion
 * @throws {AssertionError} AssertionError
 */
const assert = (assertion, opt_msg) => {
  if (!assertion) {
    throw new AssertionError(opt_msg);
  }
  return assertion;
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] optional message
 * @return {string} asserted value
 */
const assertString = (val, opt_msg) => {
  if (!munimap_utils.isString(val)) {
    let m = `Expected string not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {string} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] optional message
 * @return {Array} asserted value
 */
const assertArray = (val, opt_msg) => {
  if (!munimap_utils.isArray(val)) {
    let m = `Expected array not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {Array} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] optional message
 * @return {boolean} asserted value
 */
const assertBoolean = (val, opt_msg) => {
  if (!munimap_utils.isBoolean(val)) {
    let m = `Expected boolean not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    console.log(m);
    throw new AssertionError(m);
  }
  return /**@type {boolean} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] optional message
 * @return {number} asserted value
 */
const assertNumber = (val, opt_msg) => {
  if (!munimap_utils.isNumber(val)) {
    let m = `Expected number not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {number} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] Error message.
 * @return {!Element} asserted value
 * @throws {AssertionError} When the value is not an Element.
 */
const assertElement = (val, opt_msg) => {
  if (!munimap_utils.isObject(val) || val.nodeType !== Node.ELEMENT_NODE) {
    let m = `Expected Element not ${munimap_utils.typeOf(val)}: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /** @type {!Element} */ (val);
};

/**
 * @param {*} val value
 * @param {Function} type type
 * @param {string} [opt_msg] optional message
 * @return {*} asserted value
 */
const assertInstanceof = (val, type, opt_msg) => {
  if (!(val instanceof type)) {
    let m = `Expected instanceof ${munimap_utils.typeOf(
      type
    )} not ${munimap_utils.typeOf(val)}.`;

    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /**@type {boolean} */ (val);
};

/**
 * @param {*} val value
 * @param {string} [opt_msg] Error message.
 * @return {any} asserted value
 * @throws {AssertionError} When the value is not an Element.
 */
const assertExists = (val, opt_msg) => {
  if (!munimap_utils.isDefAndNotNull) {
    let m = `Expected to exist: ${val}.`;
    if (opt_msg) {
      m += ` ${opt_msg}`;
    }
    throw new AssertionError(m);
  }
  return /** @type {any}*/ (val);
};

/**
 * @param {string|Element} target target
 */
const target = (target) => {
  if (munimap_utils.isString(target)) {
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
      munimap_utils.isArray(zoomTo) || munimap_utils.isString(zoomTo),
      'ZoomTo should be string or array of strings.'
    );

    zoomTo = /**@type {Array.<string>}*/ (
      munimap_utils.isString(zoomTo) ? [zoomTo] : zoomTo
    );

    const onlyBuildings = zoomTo.every(isBldgCodeOrLikeExpr);
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
    if (munimap_utils.isString(lang)) {
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
      if (munimap_utils.isString(el)) {
        if (
          !isBldgCodeOrLikeExpr(el) &&
          !isRoomCodeOrLikeExpr(el)
          /*!(building_isCodeOrLikeExpr(el)) &&
            !(munimap.room.isCodeOrLikeExpr(el)) &&
            !(munimap.door.isCodeOrLikeExpr(el)) &&
            !(munimap.optpoi.isCtgUid(el))*/
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
        marker_custom_assertSuitable(el);
      } else {
        console.log(
          'Markers should contain only strings or only instances of ol.Feature'
        );
      }
    });
    // if (markers.some(function(el) {
    //   return munimap.optpoi.isCtgUid(el);
    // })) {
    //   if (!(markers.every(function(el) {
    //     return munimap.optpoi.isCtgUid(el);
    //   }))) {
    //     console.log('Markers should contain 1. building, room or ' +
    //         'door location codes, or 2. corresponding LIKE expressions, or ' +
    //         '3. POI categories.');
    //   }
    // }
  }
};

/**
 * @param {Array<ol.Feature|string>} markers markers
 * @return {Array<ol.Feature>} markers as ol features
 */
const assertMarkerFeatures = (markers) => {
  const result = markers.filter((marker) => !(marker instanceof Feature));
  if (result.length) {
    throw new AssertionError(
      'Something is wrong. Some loaded marker is not ol/Feature.'
    );
  }
  return /**@type {Array<ol.Feature>}*/ (markers);
};

/**
 * @param {string|undefined} baseMap basemap
 */
const baseMap = (baseMap) => {
  if (baseMap !== undefined) {
    if (munimap_utils.isString(baseMap)) {
      const baseMaps = Object.values(BASEMAPS);
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

export {
  assert,
  assertArray,
  assertBoolean,
  assertString,
  assertNumber,
  assertInstanceof,
  assertExists,
  target,
  zoom,
  zoomTo,
  lang,
  markers,
  assertMarkerFeatures,
  baseMap,
  locationCodes,
  labels,
  mapLinks,
  pubTran,
};
