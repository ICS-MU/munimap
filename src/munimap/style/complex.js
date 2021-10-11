/**
 * @module style/complex
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_complex from '../feature/complex.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_style from './style.js';
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {Style, Text} from 'ol/style';
import {getUid as getStoreUid} from '../utils/store.js';

/**
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/Map").default} ol.Map
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

  munimap_assert.assertInstanceof(feature, Feature);
  const bldgCount = munimap_complex.getBuildingCount(
    /**@type {Feature}*/ (feature)
  );
  if (bldgCount === 1) {
    showLabel =
      munimap_complex.getUnits(/**@type {Feature}*/ (feature)).length === 0;
    if (showLabel) {
      if (markers.length && munimap_building.isBuilding(markers[0])) {
        const complexId =
          /**@type {number}*/
          (feature.get(munimap_complex.ID_FIELD_NAME));
        const isMarked = markers.some((marker) => {
          const markerComplexId = marker.get('arealId');
          if (munimap_utils.isDefAndNotNull(markerComplexId)) {
            munimap_assert.assertNumber(markerComplexId);
            return markerComplexId === complexId;
          }
          return false;
        });
        showLabel = !isMarked;
      }
    }
  }
  if (showLabel) {
    munimap_assert.assertInstanceof(feature, Feature);
    let title;
    const uid = getStoreUid(feature);
    munimap_assert.assertString(uid);
    if (munimap_utils.isDef(munimap_style.LABEL_CACHE[lang + uid])) {
      return munimap_style.LABEL_CACHE[lang + uid];
    }

    title = /**@type {string}*/ (
      feature.get(
        munimap_lang.getMsg(
          munimap_lang.Translations.COMPLEX_TITLE_FIELD_NAME,
          lang
        )
      )
    );
    title = title.split(', ')[0];
    title = munimap_style.alignTextToRows(title.split(' '), ' ');
    const style = new Style({
      geometry: CENTER_GEOMETRY_FUNCTION,
      text: new Text({
        font: 'bold ' + munimap_complex.FONT_SIZE + 'px arial',
        fill: munimap_style.TEXT_FILL,
        stroke: munimap_style.TEXT_STROKE,
        text: title,
        overflow: true,
      }),
      zIndex: 1,
    });
    const result = style;

    munimap_style.LABEL_CACHE[lang + uid] = result;
    return result;
  }
  return null;
};

export {styleFunction};
