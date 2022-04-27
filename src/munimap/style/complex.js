/**
 * @module style/complex
 */

import * as mm_assert from '../assert/assert.js';
import * as mm_complex from '../feature/complex.js';
import * as mm_lang from '../lang.js';
import * as mm_style from './style.js';
import * as mm_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {
  COMPLEX_FONT_SIZE,
  COMPLEX_ID_FIELD_NAME,
} from '../feature/constants.js';
import {Style, Text} from 'ol/style';
import {TEXT_FILL, TEXT_STROKE} from './constants.js';
import {alignTextToRows} from './utils.js';
import {getMarkerStore} from '../source/constants.js';
import {getUid as getStoreUid} from '../utils/store.js';
import {isBuilding} from '../feature/utils.js';

/**
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 */

/**
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution res
 * @param {Array<Feature>} markers markers
 * @param {string} lang language
 * @return {Style|Array<Style>} style
 */
const styleFunction = (feature, resolution, markers, lang) => {
  let showLabel = true;

  mm_assert.assertInstanceof(feature, Feature);
  const bldgCount = mm_complex.getBuildingCount(/**@type {Feature}*/ (feature));
  if (bldgCount === 1) {
    showLabel =
      mm_complex.getUnits(/**@type {Feature}*/ (feature)).length === 0;
    if (showLabel) {
      if (markers.length && isBuilding(markers[0])) {
        const complexId =
          /**@type {number}*/
          (feature.get(COMPLEX_ID_FIELD_NAME));
        const isMarked = markers.some((marker) => {
          const markerComplexId = marker.get('arealId');
          if (mm_utils.isDefAndNotNull(markerComplexId)) {
            mm_assert.assertNumber(markerComplexId);
            return markerComplexId === complexId;
          }
          return false;
        });
        showLabel = !isMarked;
      }
    }
  }
  if (showLabel) {
    mm_assert.assertInstanceof(feature, Feature);
    let title;
    const uid = getStoreUid(feature);
    mm_assert.assertString(uid);
    if (mm_utils.isDef(mm_style.LABEL_CACHE[lang + uid])) {
      return mm_style.LABEL_CACHE[lang + uid];
    }

    title = /**@type {string}*/ (
      feature.get(
        mm_lang.getMsg(mm_lang.Translations.COMPLEX_TITLE_FIELD_NAME, lang)
      )
    );
    title = title.split(', ')[0];
    title = alignTextToRows(title.split(' '), ' ');
    const style = new Style({
      geometry: CENTER_GEOMETRY_FUNCTION,
      text: new Text({
        font: 'bold ' + COMPLEX_FONT_SIZE + 'px arial',
        fill: TEXT_FILL,
        stroke: TEXT_STROKE,
        text: title,
        overflow: true,
      }),
      zIndex: 1,
    });
    const result = style;

    mm_style.LABEL_CACHE[lang + uid] = result;
    return result;
  }
  return null;
};

/**
 * @param {string} targetId targetId
 * @param {string} lang lang
 * @return {ol.style.StyleFunction} style fn
 */
const getStyleFunction = (targetId, lang) => {
  const markers = getMarkerStore(targetId).getFeatures();
  const styleFce = (feature, res) => {
    const style = styleFunction(feature, res, markers, lang);
    return style;
  };

  return styleFce;
};

export {getStyleFunction};
