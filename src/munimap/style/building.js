/**
 * @module style/building
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_cluster from '../cluster/cluster.js';
import * as munimap_complex from '../feature/complex.js';
import * as munimap_floor from '../feature/floor.js';
import * as munimap_geom from '../utils/geom.js';
import * as munimap_markerStyle from './marker.js';
import * as munimap_range from '../utils/range.js';
import * as munimap_store from '../utils/store.js';
import * as munimap_style from './style.js';
import * as munimap_unit from '../feature/unit.js';
import * as munimap_utils from '../utils/utils.js';
import {Fill, Stroke, Style, Text} from 'ol/style';

/**
 * @typedef {import("./style").StyleFunctionOptions} StyleFunctionOptions
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/Map").default} ol.Map
 */

/**
 * @typedef {Object} LabelOptions
 * @property {string} lang lang
 * @property {boolean} showLabels wherther to show labels for MU objects
 */

/**
 * @type {Object.<string, Style|Array.<Style>>}
 * @protected
 * @const
 */
const LABEL_CACHE = {};

/**
 * Styles corresponding different resolutions.
 * @type {Object.<number, Style|Array.<Style>>}
 * @protected
 * @const
 */
const WHITE_TO_GREY_CACHE = {};

/**
 * @type {Fill}
 * @protected
 * @const
 */
const FILL = new Fill({
  color: '#ffffff',
});

/**
 * @type {Stroke}
 * @protected
 * @const
 */
const STROKE = new Stroke({
  color: '#0000dc',
  width: 1,
});

/**
 * @type {Style}
 * @protected
 * @const
 */
const STYLE = new Style({
  fill: FILL,
  stroke: STROKE,
});

/**
 * @type {Style}
 * @const
 */
const NO_GEOMETRY = new Style({
  fill: munimap_style.NO_GEOMETRY_FILL,
  stroke: STROKE,
});

/**
 * @type {number}
 */
const FONT_SIZE = 13;

/**
 * @type {number}
 */
const BIG_FONT_SIZE = 15;

/**
 * Filter function of a style fragment (type munimap.style.FilterFunction).
 *
 * @param {ol.Feature} feature feature
 * @param {?string} selectedFloorCode location code
 * @param {Array.<string>} activeFloorCodes active floor codes
 * @return {boolean} filter boolean
 */
const selectedFloorFilter = (feature, selectedFloorCode, activeFloorCodes) => {
  if (munimap_utils.isDefAndNotNull(selectedFloorCode)) {
    const locCode = /**@type {string}*/ (feature.get('polohKod'));
    return selectedFloorCode.startsWith(locCode);
  }
  return false;
};

/**
 * Style function of a style fragment (type munimap.style.Function).
 *
 * @param {StyleFunctionOptions} options opts
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Style|Array.<Style>} style
 */
const styleFunction = (options, feature, resolution) => {
  const resColor = munimap_style.RESOLUTION_COLOR.find((obj, i, arr) => {
    return resolution > obj.resolution || i === arr.length - 1;
  });

  let result;
  const marked = options.markers.indexOf(feature) >= 0;
  if (marked) {
    if (
      !munimap_range.contains(munimap_cluster.BUILDING_RESOLUTION, resolution)
    ) {
      if (munimap_building.hasInnerGeometry(feature)) {
        if (munimap_markerStyle.WHITE_TO_GREY_CACHE[resColor.resolution]) {
          result = munimap_markerStyle.WHITE_TO_GREY_CACHE[resColor.resolution];
        } else {
          result = new Style({
            fill: new Fill({
              color: resColor.color,
            }),
            stroke: munimap_markerStyle.BUILDING_STROKE,
          });
          munimap_markerStyle.WHITE_TO_GREY_CACHE[resColor.resolution] = result;
        }
      } else {
        result = munimap_markerStyle.NO_GEOMETRY_BUILDING;
      }
    } else {
      result = STYLE;
    }
  } else {
    if (munimap_building.hasInnerGeometry(feature)) {
      if (WHITE_TO_GREY_CACHE[resColor.resolution]) {
        result = WHITE_TO_GREY_CACHE[resColor.resolution];
      } else {
        result = new Style({
          fill: new Fill({
            color: resColor.color,
          }),
          stroke: STROKE,
        });
        WHITE_TO_GREY_CACHE[resColor.resolution] = result;
      }
    } else {
      result = NO_GEOMETRY;
    }
  }
  return result;
};

/**
 * Style function of a style fragment (type munimap.style.Function).
 *
 * @param {StyleFunctionOptions} options options
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Style|Array.<Style>} style
 */
const selectedFloorFunction = (options, feature, resolution) => {
  const style = /** @type {Style}*/ (styleFunction(
    options,
    feature,
    resolution
  ));
  const selectedFill = new Fill({
    color: style.getFill().getColor(),
  });
  const selectedStroke = new Stroke({
    color: style.getStroke().getColor(),
    width: 2 * style.getStroke().getWidth(),
  });
  return new Style({
    fill: selectedFill,
    stroke: selectedStroke,
  });
};

/**
 * @param {ol.Map} map map
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} lang lang
 * @return {Style|Array<Style>} style
 * @protected
 */
const defaultLabelFunction = (map, feature, resolution, lang) => {
  const uid = munimap_store.getUid(feature);
  if (uid) {
    munimap_assert.assertString(uid);
    if (munimap_style.LABEL_CACHE[uid]) {
      return munimap_style.LABEL_CACHE[uid];
    }
  }

  const title = munimap_style.getDefaultLabel(feature, resolution, lang);
  const textStyle = new Style({
    geometry: munimap_utils.partial(
      munimap_geom.INTERSECT_CENTER_GEOMETRY_FUNCTION,
      map
    ),
    text: new Text({
      font: 'bold ' + FONT_SIZE + 'px arial',
      fill: munimap_style.TEXT_FILL,
      stroke: munimap_style.TEXT_STROKE,
      text: title,
      overflow: true,
    }),
    zIndex: 4,
  });

  if (uid) {
    munimap_assert.assertString(uid);
    munimap_style.LABEL_CACHE[uid] = textStyle;
  }
  return textStyle;
};

/**
 * @param {ol.Map} map map
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} lang lang
 * @return {Array.<Style>|Style} style
 * @protected
 */
const smallScaleLabelFunction = (map, feature, resolution, lang) => {
  let result = null;
  const units = munimap_building.getUnits(feature);
  if (units.length > 0) {
    if (resolution < munimap_cluster.BUILDING_RESOLUTION.min) {
      let title;
      const complex = munimap_building.getComplex(feature);
      if (
        munimap_range.contains(munimap_complex.RESOLUTION, resolution) &&
        munimap_utils.isDefAndNotNull(complex) &&
        munimap_complex.getBuildingCount(complex) > 1
      ) {
        title = munimap_unit.getTitleParts(units, lang).join('\n');
      } else {
        title = munimap_building.getDefaultLabel(feature, resolution, lang);
      }
      if (munimap_utils.isDef(title)) {
        const geometryFunction = munimap_utils.partial(
          munimap_geom.INTERSECT_CENTER_GEOMETRY_FUNCTION,
          map
        );
        const options = {
          fill: munimap_style.TEXT_FILL,
          fontSize: FONT_SIZE,
          geometry: geometryFunction,
          title: title,
        };
        result = munimap_style.getLabelWithPin(options);
      }
    }
  } else if (resolution < munimap_complex.RESOLUTION.min) {
    result = defaultLabelFunction(map, feature, resolution, lang);
  }
  return result;
};

/**
 * @param {ol.Map} map map
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} lang lang
 * @return {Array.<Style>|Style} style
 * @protected
 */
const largeScaleLabelFunction = (map, feature, resolution, lang) => {
  const uid = munimap_store.getUid(feature);
  if (uid) {
    munimap_assert.assertString(uid);
    if (LABEL_CACHE[lang + uid]) {
      return LABEL_CACHE[lang + uid];
    }
  }

  let result;
  const title = munimap_building.getDefaultLabel(feature, resolution, lang);
  if (munimap_utils.isDef(title)) {
    const geometryFunction = munimap_utils.partial(
      munimap_geom.INTERSECT_CENTER_GEOMETRY_FUNCTION,
      map
    );
    const units = munimap_building.getUnits(feature);
    if (units.length > 0) {
      const options = {
        fill: munimap_style.TEXT_FILL,
        fontSize: FONT_SIZE,
        geometry: geometryFunction,
        title: title,
      };
      result = munimap_style.getLabelWithPin(options);
    } else {
      result = new Style({
        geometry: geometryFunction,
        text: new Text({
          font: 'bold ' + BIG_FONT_SIZE + 'px arial',
          fill: munimap_style.TEXT_FILL,
          stroke: munimap_style.TEXT_STROKE,
          text: title,
          overflow: true,
        }),
        zIndex: 4,
      });
    }
  } else {
    result = null;
  }
  if (uid) {
    munimap_assert.assertString(uid);
    LABEL_CACHE[lang + uid] = result;
  }
  return result;
};

/**
 * Style function of a style fragment (type munimap.style.Function).
 * @param {LabelOptions} labelOptions label opts
 * @param {StyleFunctionOptions} markerOptions opts
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Style|Array.<Style>} style
 */
const labelFunction = (labelOptions, markerOptions, feature, resolution) => {
  const {lang, showLabels} = labelOptions;
  let result = null;
  const marked = markerOptions.markers.indexOf(feature) >= 0;
  if (!marked && resolution < munimap_complex.RESOLUTION.max) {
    if (!munimap_range.contains(munimap_floor.RESOLUTION, resolution)) {
      result = smallScaleLabelFunction(
        markerOptions.map,
        feature,
        resolution,
        lang
      );
    } else {
      result = largeScaleLabelFunction(
        markerOptions.map,
        feature,
        resolution,
        lang
      );
    }
  }
  if (showLabels === false && result) {
    if (Array.isArray(result)) {
      result.forEach((el) => {
        const text = el.getText();
        if (text) {
          text.setText('');
        }
      });
    } else {
      const text = result.getText();
      if (text) {
        text.setText('');
      }
    }
    return result;
  }
  return result;
};

export {
  FONT_SIZE,
  BIG_FONT_SIZE,
  styleFunction,
  labelFunction,
  selectedFloorFilter,
  selectedFloorFunction,
};
