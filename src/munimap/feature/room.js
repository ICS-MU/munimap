/**
 * @module feature/room
 */
import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import {MUNIMAP_URL} from '../conf.js';
import {alignRoomTitleToRows} from '../style/room.js';
import {wrapText} from '../style/style.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @enum {string}
 * @const
 */
const ROOM_TYPES = {
  DEFAULT: 'default',
  ACTIVE: 'active',
};

/**
 * @type {RegExp}
 * @protected
 */
const CODE_REGEX = /^[A-Z]{3}[0-9]{2}[NMPSZ]{1}[0-9]{5}[a-z]?$/gi;

/**
 * @type {RegExp}
 * @protected
 */
const LIKE_EXPR_REGEX = /^[A-Z_]{3}[0-9_]{2}[NMPSZ_]{1}[0-9_]{5}[a-z_]?$/gi;

/**
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'polohKod',
      serviceUrl: MUNIMAP_URL,
      layerId: 1,
      name: 'room',
    };
  }
  return TYPE;
};

/**
 * @param {string} maybeCode code
 * @return {boolean} whether is room code
 */
const isCode = (maybeCode) => !!maybeCode.match(CODE_REGEX);

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {boolean} whether is room feature
 */
const isRoom = (feature) => {
  const code = feature.get('polohKod');
  return munimap_utils.isString(code) && isCode(/** @type {string}*/ (code));
};

/**
 * @param {ol.Feature} room room
 * @param {string} selectedFeature selected feature
 * @return {boolean} whether is room in selected floor
 */
const isInSelectedFloor = (room, selectedFeature) => {
  munimap_assert.assert(isRoom(room));
  const locCode = /**@type {string}*/ (room.get('polohKod'));
  return selectedFeature ? locCode.startsWith(selectedFeature) : false;
};

/**
 * @param {string} code code
 */
const assertCode = (code) => {
  munimap_assert.assert(
    !!isCode(code),
    'Location code of room should consist of 3 letters and 2 digits, ' +
      "one of the letters 'N', 'M', 'P', 'S' or 'Z' " +
      'followed by 5 digits, and optionally 1 letter.'
  );
};

/**
 * @param {ol.Feature} feature feature
 */
const assertRoom = (feature) => {
  munimap_assert.assert(
    !!isRoom(feature),
    "Feature does not have value of room's primary key."
  );
};

/**
 * @param {string} maybeLikeExpr expression
 * @return {boolean} whether is room like expression
 */
const isLikeExpr = (maybeLikeExpr) => {
  return (
    !!maybeLikeExpr.match(LIKE_EXPR_REGEX) && maybeLikeExpr.indexOf('_') >= 0
  );
};

/**
 * @param {string} maybeCodeOrLikeExpr code or expression
 * @return {boolean} whether is room code or like expression
 */
const isCodeOrLikeExpr = (maybeCodeOrLikeExpr) => {
  return isCode(maybeCodeOrLikeExpr) || isLikeExpr(maybeCodeOrLikeExpr);
};

/**
 * @param {string} code code
 */
const assertCodeOrLikeExpr = (code) => {
  munimap_assert.assert(
    !!code.match(LIKE_EXPR_REGEX),
    'Location code of building should consist of 3 letters and 2 digits, ' +
      "one of the letters 'N', 'M', 'P', 'S' or 'Z' " +
      'followed by 5 digits, and optionally 1 letter. ' +
      'Any of these characters might be replaced with _ wildcard.'
  );
};

/**
 * @param {IsClickableOptions} options options
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const {feature, selectedFeature} = options;
  return !isInSelectedFloor(feature, selectedFeature);
};

/**
 * @param {redux.Dispatch} dispatch dispatch
 * @param {FeatureClickHandlerOptions} options options
 */
const featureClickHandler = (dispatch, options) => {
  dispatch(actions.roomClicked(options));
};

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {string} lang language
 * @return {string|undefined} name part
 * @protected
 */
const getNamePart = (feature, lang) => {
  let title;
  const fTitle = feature.get(
    munimap_lang.getMsg(munimap_lang.Translations.ROOM_TITLE_FIELD_NAME, lang)
  );
  const fNumber = feature.get('cislo');
  if (fTitle || fNumber) {
    if (fTitle) {
      title = munimap_assert.assertString(fTitle);
      title = alignRoomTitleToRows(title);
      if (fNumber) {
        const re = new RegExp('(^| )' + fNumber.toLowerCase() + '( |$)', 'g');
        if (!re.test(fTitle.toLowerCase())) {
          title = fNumber + '\n' + title;
        }
      }
    } else {
      title = munimap_assert.assertString(fNumber);
    }
  }
  return title || undefined;
};

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {string} lang language
 * @return {string|undefined} default label
 */
const getDefaultLabel = (feature, lang) => getNamePart(feature, lang);

/**
 * Add text detail for POI.
 * @param {Array<ol.Feature>} rooms // rooms
 * @param {Array<ol.Feature>} pois  // POIs
 * @param {string} lang
 * @return {Array<ol.Feature>} features with added properties
 */

const addPoiDetail = (rooms, pois, lang) => {
  const result = [];
  let text = '';
  const noGeometry = [];
  rooms.forEach((feature) => {
    const featurePolKod = feature.get('polohKod');
    const polKodBuilding = featurePolKod.substr(0, 5);
    const isPoint = feature.getGeometry().getType() === 'Point';
    let featureBuilding;
    if (isPoint) {
      featureBuilding = featurePolKod.substr(0, 5);
    }
    if (isPoint && noGeometry.indexOf(polKodBuilding) !== -1) {
      return false;
    }
    if (isPoint) {
      noGeometry.push(polKodBuilding); //??
    }
    let numberOfDetails = 0;
    let pracoviste = undefined;
    let nazev_cs = undefined;
    let nazev_en = undefined;
    let detail_text = undefined;
    let poiPolKod;
    let name = undefined;
    let open, url;
    pois.forEach((poi) => {
      poiPolKod = poi.get('polohKodLokace');
      if (
        featurePolKod === poiPolKod ||
        (isPoint && featureBuilding === poiPolKod.substr(0, 5))
      ) {
        pracoviste = poi.get('pracoviste');
        nazev_cs = wrapText(poi.get('nazev_cs'));
        nazev_en = wrapText(poi.get('nazev_en'));
        if (lang === munimap_lang.Abbr.CZECH) {
          name = poi.get('nazev_cs');
          open = munimap_utils.isDefAndNotNull(poi.get('provozniDoba_cs'))
            ? poi.get('provozniDoba_cs')
            : '';
        } else if (lang === munimap_lang.Abbr.ENGLISH) {
          name = munimap_utils.isDefAndNotNull(poi.get('nazev_en'))
            ? poi.get('nazev_en')
            : poi.get('nazev_cs');
          open = munimap_utils.isDefAndNotNull(poi.get('provozniDoba_en'))
            ? poi.get('provozniDoba_en')
            : '';
        }
        url = poi.get('url');
        name = wrapText(name, '</br>');
        if (url) {
          name = `<a href="${url}" target="_blank">${name}</a>`;
        }
        open = open.replace(/,/g, '<br>');
        name = `<div class="munimap-bubble-title">${name}</div>`;
        open =
          open === '' ? '' : `<div class="munimap-bubble-text">${open}</div>`;

        if (detail_text === undefined) {
          numberOfDetails += 1;
          text = name + open;
          detail_text = text;
        } else {
          if (detail_text.indexOf(name + open) < 0) {
            numberOfDetails += 1;
            text = detail_text + name + open;
            detail_text = text;
          }
        }
      }
    });
    result.push(feature);

    if (nazev_cs !== undefined) {
      const title = wrapText(feature.get('title'));

      feature.setProperties({
        'title': title,
        'detail': detail_text,
        'numberOfDetails': numberOfDetails,
        'pracoviste': pracoviste,
        'nazev_cs': nazev_cs,
        'nazev_en': nazev_en,
      });
    }
  });
  return result;
};

export {
  ROOM_TYPES,
  addPoiDetail,
  featureClickHandler,
  getDefaultLabel,
  getType,
  isCode,
  isCodeOrLikeExpr,
  isClickable,
  isInSelectedFloor,
  isLikeExpr,
  isRoom,
};
