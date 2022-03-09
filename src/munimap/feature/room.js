/**
 * @module feature/room
 */
import * as actions from '../redux/action.js';
import * as munimap_assert from '../assert/assert.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import {alignRoomTitleToRows} from '../style/room.js';
import {isAllowed} from '../identify/identify.js';
import {isCode} from './room.constants.js';
import {wrapText} from '../style/style.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("../conf.js").PopupContentOptions} PopupContentOptions
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("./feature.js").FeatureClickHandlerOptions} FeatureClickHandlerOptions
 * @typedef {import("./feature.js").IsClickableOptions} IsClickableOptions
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

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

// /**
//  * @param {string} code code
//  */
// const assertCode = (code) => {
//   munimap_assert.assert(
//     !!isCode(code),
//     'Location code of room should consist of 3 letters and 2 digits, ' +
//       "one of the letters 'N', 'M', 'P', 'S' or 'Z' " +
//       'followed by 5 digits, and optionally 1 letter.'
//   );
// };

// /**
//  * @param {ol.Feature} feature feature
//  */
// const assertRoom = (feature) => {
//   munimap_assert.assert(
//     !!isRoom(feature),
//     "Feature does not have value of room's primary key."
//   );
// };

// /**
//  * @param {string} code code
//  */
// const assertCodeOrLikeExpr = (code) => {
//   munimap_assert.assert(
//     !!code.match(LIKE_EXPR_REGEX),
//     'Location code of building should consist of 3 letters and 2 digits, ' +
//       "one of the letters 'N', 'M', 'P', 'S' or 'Z' " +
//       'followed by 5 digits, and optionally 1 letter. ' +
//       'Any of these characters might be replaced with _ wildcard.'
//   );
// };

/**
 * @param {IsClickableOptions} options options
 * @return {boolean} whether is clickable
 */
const isClickable = (options) => {
  const {feature, selectedFeature, isIdentifyEnabled, identifyTypes} = options;
  const result = !isInSelectedFloor(feature, selectedFeature);
  if (isIdentifyEnabled && isAllowed(feature, identifyTypes)) {
    return true;
  }
  return result;
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
 * @param {string} lang lang
 * @return {Array<ol.Feature>} features with added properties
 */
const addPoiDetail = (rooms, pois, lang) => {
  const result = [];

  const buildingsWithFictiveRooms = [];
  const alreadyInitialized = (code) => {
    return buildingsWithFictiveRooms.includes(code);
  };

  rooms.forEach((room) => {
    const roomCode = room.get('polohKod');
    const buildingCode = roomCode.substring(0, 5);
    const isFictiveRoom = room.getGeometry().getType() === 'Point';
    if (isFictiveRoom && alreadyInitialized(buildingCode)) {
      // building should have only one fictional room with all pois set
      room.set('detailsMoved', true);
      return false;
    } else if (isFictiveRoom) {
      buildingsWithFictiveRooms.push(buildingCode);
    }

    const filteredPois = pois.filter((poi) => {
      const poiCode = poi.get('polohKodLokace');
      return isFictiveRoom
        ? poiCode.substring(0, 5) === buildingCode
        : poiCode === roomCode;
    });

    const popupDetails = /** @type {Array<PopupContentOptions>}*/ ([]);
    let workplace;
    let title;
    let titleEn;
    let detailHtml = '';
    let numberOfDetails = 0;
    filteredPois.forEach((poi) => {
      const url = poi.get('url');
      let name;
      let open;
      workplace = poi.get('pracoviste');
      title = wrapText(poi.get('nazev_cs'));
      titleEn = wrapText(poi.get('nazev_en'));

      if (lang === munimap_lang.Abbr.CZECH) {
        name = poi.get('nazev_cs');
        open = poi.get('provozniDoba_cs') ? poi.get('provozniDoba_cs') : '';
      } else if (lang === munimap_lang.Abbr.ENGLISH) {
        name = poi.get('nazev_en') ? poi.get('nazev_en') : poi.get('nazev_cs');
        open = poi.get('provozniDoba_en') ? poi.get('provozniDoba_en') : '';
      }

      if (munimap_utils.isDefAndNotNull(name)) {
        name = wrapText(name, '</br>');
        if (url) {
          name = `<a href="${url}" target="_blank">${name}</a>`;
        }
        open = open.replace(/,/g, '<br>');
        name = `<div class="munimap-bubble-title">${name}</div>`;
        open =
          open === '' ? '' : `<div class="munimap-bubble-text">${open}</div>`;

        popupDetails.push({name, open});
        numberOfDetails += 1;
      }
    });

    if (munimap_utils.isDefAndNotNull(title)) {
      const popupDetailsCleaned = munimap_utils.removeObjectDuplicatesFromArray(
        popupDetails,
        'name'
      );
      const duplicatesCount = popupDetails.length - popupDetailsCleaned.length;
      popupDetailsCleaned.forEach(
        (opts) => (detailHtml += `${opts.name}${opts.open}`)
      );

      room.setProperties({
        'title': wrapText(room.get('title')),
        'detail': detailHtml !== '' ? detailHtml : undefined,
        'numberOfDetails': numberOfDetails - duplicatesCount,
        'pracoviste': workplace,
        'nazev_cs': title,
        'nazev_en': titleEn,
      });
    }
    result.push(room);
  });
  return result;
};

export {
  addPoiDetail,
  featureClickHandler,
  getDefaultLabel,
  isClickable,
  isInSelectedFloor,
  isRoom,
};
