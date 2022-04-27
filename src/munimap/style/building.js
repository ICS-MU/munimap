/**
 * @module style/building
 */

import * as mm_assert from '../assert/assert.js';
import * as mm_building from '../feature/building.js';
import * as mm_cluster from '../feature/cluster.js';
import * as mm_geom from '../utils/geom.js';
import * as mm_markerStyle from './marker.js';
import * as mm_range from '../utils/range.js';
import * as mm_store from '../utils/store.js';
import * as mm_style from './style.js';
import * as mm_style_constants from './constants.js';
import * as mm_unit from '../feature/unit.js';
import * as mm_utils from '../utils/utils.js';
import {COMPLEX_RESOLUTION, FLOOR_RESOLUTION} from '../feature/constants.js';
import {Fill, Stroke, Style, Text} from 'ol/style';
import {RESOLUTION_COLOR} from './constants.js';
import {getBuildingCount} from '../feature/complex.js';
import {getMarkerStore} from '../source/constants.js';

/**
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("ol/extent").Extent} ol.Extent
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 */

/**
 * @typedef {Object} LabelOptions
 * @property {string} targetId targetId
 * @property {string} lang lang
 * @property {boolean} showLabels wherther to show labels for MU objects
 * @property {ol.Extent} extent map extent based on current state
 */

/**
 * @typedef {Object} StyleFunctionOptions
 * @property {string} targetId targetId
 * @property {string} selectedFloorCode selected floor code
 * @property {boolean} inFloorResolutionRange inFloorResolutionRange
 */

/**
 * @typedef {Object} LabelStyleFunctionOptions
 * @property {string} selectedFloorCode selected floor code
 * @property {boolean} inFloorResolutionRange inFloorResolutionRange
 */

/**
 * @type {Object<string, Style|Array<Style>>}
 * @protected
 * @const
 */
const LABEL_CACHE = {};

/**
 * Styles corresponding different resolutions.
 * @type {Object<number, Style|Array<Style>>}
 * @protected
 * @const
 */
const WHITE_TO_GREY_CACHE = {};

/**
 *
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} targetId targetId
 * @param {boolean} showSelected whether tho show building as selected
 * @return {Style|Array<Style>} style
 */
const styleFunction = (feature, resolution, targetId, showSelected) => {
  const resColor = RESOLUTION_COLOR.find((obj, i, arr) => {
    return resolution > obj.resolution || i === arr.length - 1;
  });

  let result;
  const marked = getMarkerStore(targetId).getFeatures().indexOf(feature) >= 0;
  if (marked) {
    if (!mm_range.contains(mm_cluster.BUILDING_RESOLUTION, resolution)) {
      if (mm_building.hasInnerGeometry(feature)) {
        if (mm_markerStyle.WHITE_TO_GREY_CACHE[resColor.resolution]) {
          result = mm_markerStyle.WHITE_TO_GREY_CACHE[resColor.resolution];
        } else {
          result = new Style({
            fill: new Fill({
              color: resColor.color,
            }),
            stroke: mm_style_constants.MARKER_BUILDING_STROKE,
          });
          mm_markerStyle.WHITE_TO_GREY_CACHE[resColor.resolution] = result;
        }
      } else {
        result = mm_style_constants.MARKER_BUILDING_NO_GEOMETRY;
      }
    } else {
      result = mm_style_constants.BUILDING_STYLE;
    }
  } else {
    if (mm_building.hasInnerGeometry(feature)) {
      if (mm_utils.isDef(WHITE_TO_GREY_CACHE[resColor.resolution])) {
        result = WHITE_TO_GREY_CACHE[resColor.resolution];
      } else {
        result = new Style({
          fill: new Fill({
            color: resColor.color,
          }),
          stroke: mm_style_constants.BUILDING_STROKE,
        });
        WHITE_TO_GREY_CACHE[resColor.resolution] = result;
      }
    } else {
      result = mm_style_constants.BUILDING_NO_GEOMETRY;
    }
  }

  if (result instanceof Style && showSelected) {
    return new Style({
      fill: new Fill({
        color: result.getFill().getColor(),
      }),
      stroke: new Stroke({
        color: result.getStroke().getColor(),
        width: 2 * result.getStroke().getWidth(),
      }),
    });
  } else {
    return result;
  }
};

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @param {ol.Extent} extent map extent
 * @param {string} lang lang
 * @return {Style|Array<Style>} style
 * @protected
 */
const defaultLabelFunction = (feature, resolution, extent, lang) => {
  const uid = mm_store.getUid(feature);
  if (uid) {
    mm_assert.assertString(uid);
    if (mm_utils.isDef(mm_style.LABEL_CACHE[uid])) {
      return mm_style.LABEL_CACHE[uid];
    }
  }

  const title = mm_style.getDefaultLabel(feature, resolution, lang);
  const textStyle = new Style({
    geometry: mm_utils.partial(
      mm_geom.INTERSECT_CENTER_GEOMETRY_FUNCTION,
      extent
    ),
    text: new Text({
      font: 'bold ' + mm_style_constants.BUILDING_FONT_SIZE + 'px arial',
      fill: mm_style_constants.TEXT_FILL,
      stroke: mm_style_constants.TEXT_STROKE,
      text: title,
      overflow: true,
    }),
    zIndex: 4,
  });

  if (uid) {
    mm_assert.assertString(uid);
    mm_style.LABEL_CACHE[uid] = textStyle;
  }
  return textStyle;
};

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {ol.Extent} extent map extent
 * @param {string} lang lang
 * @return {Array<Style>|Style} style
 * @protected
 */
const smallScaleLabelFunction = (feature, resolution, extent, lang) => {
  let result = null;
  const units = mm_building.getUnits(feature);
  if (units.length > 0) {
    if (resolution < mm_cluster.BUILDING_RESOLUTION.min) {
      let title;
      const complex = mm_building.getComplex(feature);
      if (
        mm_range.contains(COMPLEX_RESOLUTION, resolution) &&
        mm_utils.isDefAndNotNull(complex) &&
        getBuildingCount(complex) > 1
      ) {
        title = mm_unit.getTitleParts(units, lang).join('\n');
      } else {
        title = mm_building.getDefaultLabel(feature, resolution, lang);
      }
      if (mm_utils.isDef(title)) {
        const geometryFunction = mm_utils.partial(
          mm_geom.INTERSECT_CENTER_GEOMETRY_FUNCTION,
          extent
        );
        const options = {
          fill: mm_style_constants.TEXT_FILL,
          fontSize: mm_style_constants.BUILDING_FONT_SIZE,
          geometry: geometryFunction,
          title: title,
        };
        result = mm_style.getLabelWithPin(options);
      }
    }
  } else if (resolution < COMPLEX_RESOLUTION.min) {
    result = defaultLabelFunction(feature, resolution, extent, lang);
  }
  return result;
};

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {ol.Extent} extent map extent
 * @param {string} lang lang
 * @return {Array<Style>|Style} style
 * @protected
 */
const largeScaleLabelFunction = (feature, resolution, extent, lang) => {
  const uid = mm_store.getUid(feature);
  if (uid) {
    mm_assert.assertString(uid);
    if (mm_utils.isDef(LABEL_CACHE[lang + uid])) {
      return LABEL_CACHE[lang + uid];
    }
  }

  let result;
  const title = mm_building.getDefaultLabel(feature, resolution, lang);

  if (mm_utils.isDef(title)) {
    const geometryFunction = mm_utils.partial(
      mm_geom.INTERSECT_CENTER_GEOMETRY_FUNCTION,
      extent
    );
    const units = mm_building.getUnits(feature);
    if (units.length > 0) {
      const options = {
        fill: mm_style_constants.TEXT_FILL,
        fontSize: mm_style_constants.BUILDING_FONT_SIZE,
        geometry: geometryFunction,
        title: title,
      };
      result = mm_style.getLabelWithPin(options);
    } else {
      result = new Style({
        geometry: geometryFunction,
        text: new Text({
          font:
            'bold ' + mm_style_constants.BUILDING_BIG_FONT_SIZE + 'px arial',
          fill: mm_style_constants.TEXT_FILL,
          stroke: mm_style_constants.TEXT_STROKE,
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
    mm_assert.assertString(uid);
    LABEL_CACHE[lang + uid] = result;
  }
  return result;
};

/**
 * @param {LabelOptions} labelOptions label opts
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Style|Array<Style>} style
 */
const labelFunction = (labelOptions, feature, resolution) => {
  const {lang, showLabels, extent, targetId} = labelOptions;

  if (!extent) {
    return null;
  }

  let result = null;
  const marked = getMarkerStore(targetId).getFeatures().indexOf(feature) >= 0;
  if (!marked && resolution < COMPLEX_RESOLUTION.max) {
    if (!mm_range.contains(FLOOR_RESOLUTION, resolution)) {
      result = smallScaleLabelFunction(feature, resolution, extent, lang);
    } else {
      result = largeScaleLabelFunction(feature, resolution, extent, lang);
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

/**
 * @param {StyleFunctionOptions} options options
 * @return {ol.style.StyleFunction} style fn
 */
const getStyleFunction = (options) => {
  const {targetId, inFloorResolutionRange, selectedFloorCode} = options;
  const selectedFloor = inFloorResolutionRange ? selectedFloorCode : null;
  const styleFce = (feature, res) => {
    const showSelected =
      inFloorResolutionRange && mm_building.isSelected(feature, selectedFloor);
    const style = styleFunction(feature, res, targetId, showSelected);
    return style;
  };

  return styleFce;
};

/**
 * @param {LabelOptions} options options
 * @return {ol.style.StyleFunction} label style
 */
const getPartialLabelFunction = (options) => {
  return mm_utils.partial(labelFunction, options);
};

/**
 * @param {ol.style.StyleFunction} labelFn label fn
 * @param {LabelStyleFunctionOptions} options options
 * @return {ol.style.StyleFunction} style fn
 */
const getLabelStyleFunction = (labelFn, options) => {
  const {inFloorResolutionRange, selectedFloorCode} = options;
  const selectedFloor = inFloorResolutionRange ? selectedFloorCode : null;
  const styleFce = (feature, res) => {
    const showSelected =
      inFloorResolutionRange && mm_building.isSelected(feature, selectedFloor);
    if (showSelected) {
      return null;
    } else {
      const style = labelFn(feature, res);
      return style;
    }
  };

  return styleFce;
};

export {getPartialLabelFunction, getLabelStyleFunction, getStyleFunction};
