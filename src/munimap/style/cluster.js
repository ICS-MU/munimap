/**
 * @module style/cluster
 */

import * as mm_assert from '../assert/assert.js';
import * as mm_building from '../feature/building.js';
import * as mm_cluster from '../feature/cluster.js';
import * as mm_geom from '../utils/geom.js';
import * as mm_lang from '../lang.js';
import * as mm_marker from '../feature/marker.js';
import * as mm_style from '../style/style.js';
import * as mm_style_constants from './constants.js';
import * as mm_style_marker from '../style/marker.js';
import * as mm_unit from '../feature/unit.js';
import * as mm_utils from '../utils/utils.js';
import Feature from 'ol/Feature.js';
import {BUILDING_FONT_SIZE} from './constants.js';
import {Circle, Fill, Icon, Stroke, Style, Text} from 'ol/style.js';
import {MultiPolygon} from 'ol/geom.js';
import {calculateIconAnchor, extendTitleOffset} from './icon.js';
import {getLabel} from '../feature/marker.custom.js';
import {getMarkerStore} from '../source/constants.js';
import {isBuilding, isCustomMarker, isDoor, isRoom} from '../feature/utils.js';
import {localeCompare} from '../utils/string.js';

/**
 * @typedef {import("./icon.js").IconOptions} IconOptions
 * @typedef {import("../style/marker.js").LabelFunction} LabelFunction
 * @typedef {import("../style/style.js").LabelWithPinOptions} LabelWithPinOptions
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/geom/Point").default} ol.geom.Point
 * @typedef {import("ol/style/Style").StyleFunction} ol.style.StyleFunction
 * @typedef {import("../feature/cluster.js").ClusterOptions} ClusterOptions
 */

/**
 * @typedef {object} StyleFunctionOptions
 * @property {string} targetId targetId
 * @property {string} lang language
 * @property {boolean} [locationCodes] whether to show only location codes
 * @property {LabelFunction} [markerLabel] marker label function
 * @property {boolean} [clusterFacultyAbbr] whether to cluster faculty abbrs
 */

/**
 * @typedef {object} PinFunctionOptions
 * @property {Feature} feature feature
 * @property {LabelWithPinOptions} pinOpts pinOpts
 * @property {boolean} isMarked isMarked
 * @property {string} [title] title
 * @property {ClusterOptions} [clusterOptions] clusterOptions
 */

/**
 * @param {Feature} feature feature
 * @param {number} resolution resoltuion
 * @param {string} lang language
 * @return {string} label
 * @protected
 */
const getUnmarkedDefaultLabel = (feature, resolution, lang) => {
  mm_assert.assertInstanceof(feature, Feature);
  let titleParts = [];
  let units;

  const clusteredFeatures = mm_cluster.getFeatures(feature);
  const clusteredBuildings =
    clusteredFeatures && clusteredFeatures.filter((f) => isBuilding(f));

  if (!clusteredBuildings || clusteredBuildings.length < 1) {
    return null;
  }

  const range = mm_cluster.getResolutionRange(resolution);
  if (range === mm_cluster.Resolutions.MARKERS_AND_FACULTIES) {
    units = mm_building.getFacultiesOfBuildings(clusteredBuildings);
    if (units.length >= 10) {
      return mm_lang.getMsg(mm_lang.Translations.CLUSTER_MU_LABEL, lang);
    }
  } else {
    units = mm_building.getUnitsOfBuildings(clusteredBuildings);
  }
  titleParts = mm_unit.getTitleParts(units, lang);
  return titleParts.join('\n');
};

/**
 * Clustered features are buildings only.
 * @param {StyleFunctionOptions} options options
 * @param {Array<Feature>} allMarkers all markers
 * @param {Feature} feature feature
 * @param {number} resolution resolution
 * @return {string} label
 * @protected
 */
const getMarkedDefaultLabel = (options, allMarkers, feature, resolution) => {
  const lang = options.lang;
  const clusteredFeatures = mm_cluster.getFeatures(feature);
  let markers = clusteredFeatures.filter((feat) => allMarkers.includes(feat));

  const titleParts = [];

  if (markers.length > 3) {
    let markerType;
    if (markers.every((el) => isBuilding(el))) {
      markerType = mm_lang.getMsg(mm_lang.Translations.BUILDING, lang);
    } else if (markers.every((el) => isRoom(el))) {
      markerType = mm_lang.getMsg(mm_lang.Translations.ROOM, lang);
    } else if (markers.every((el) => isDoor(el))) {
      markerType = mm_lang.getMsg(mm_lang.Translations.DOOR, lang);
    } else {
      markerType = mm_lang.getMsg(mm_lang.Translations.LOCATION, lang);
    }
    titleParts.push(markers.length + 'x ' + markerType);
  } else {
    if (mm_utils.isDefAndNotNull(options.markerLabel)) {
      markers = markers.filter((marker) => {
        const title = options.markerLabel(marker, resolution);
        if (mm_utils.isDefAndNotNull(title)) {
          if (title) {
            titleParts.push(title);
          }
          return false;
        } else {
          return true;
        }
      });
    }
    if (markers.length) {
      markers.forEach((marker) => {
        if (isBuilding(marker)) {
          const range = mm_cluster.getResolutionRange(resolution);
          const units = [];
          const unitsFunc =
            range === mm_cluster.Resolutions.MARKERS_AND_FACULTIES
              ? mm_building.getFaculties
              : mm_building.getUnits;
          const buildingsWithoutUnits = [];
          const uns = unitsFunc(marker);
          if (uns.length) {
            units.push(...uns);
          } else {
            buildingsWithoutUnits.push(marker);
          }
          if (mm_unit.getTitleParts(units, lang).length > 0) {
            titleParts.push(mm_unit.getTitleParts(units, lang)[0]);
          }
          buildingsWithoutUnits.forEach((building) => {
            let buildingTitle;
            const bUnits = mm_building.getUnits(building);
            if (bUnits.length) {
              buildingTitle = mm_unit.getTitleParts(bUnits, lang);
            } else {
              buildingTitle = mm_building.getDefaultLabel(
                building,
                resolution,
                lang
              );
            }
            titleParts.push(buildingTitle);
          });
        } else if (isCustomMarker(marker)) {
          const cmTitle = getLabel(marker);
          if (mm_utils.isDefAndNotNull(cmTitle)) {
            titleParts.push(cmTitle);
          }
          titleParts.sort(localeCompare);
        } else if (isRoom(marker)) {
          const showLocationCodes = options.locationCodes;
          const roomTitle = showLocationCodes
            ? /**@type {string}*/ (marker.get('polohKod'))
            : mm_style.getDefaultLabel(marker, resolution, lang);
          if (mm_utils.isDefAndNotNull(roomTitle)) {
            titleParts.push(roomTitle);
          }
        }
      });
    }
  }
  return titleParts.join('\n');
};

/**
 * @param {boolean} isMarked whether is marked
 * @param {string?} markedColor cluster marked icon color
 * @param {string?} unmarkedColor cluster unmarked color icon
 * @param {string} [opt_color] custom marker color
 * @return {Fill} fill
 */
const getFill = (isMarked, markedColor, unmarkedColor, opt_color) => {
  let fill;
  if (opt_color) {
    fill = new Fill({color: opt_color});
  } else if (isMarked) {
    fill = markedColor
      ? new Fill({color: markedColor})
      : mm_style_constants.MARKER_TEXT_FILL;
  } else {
    fill = unmarkedColor
      ? new Fill({color: unmarkedColor})
      : mm_style_constants.TEXT_FILL;
  }

  return fill;
};

/**
 * @param {boolean} isMarked is marked
 * @param {string} [opt_color] color
 * @param {ClusterOptions} [opt_clusterOptions] opts
 * @return {Fill} fill
 */
const getFillForPin = (isMarked, opt_color, opt_clusterOptions) => {
  const markedColor = mm_cluster.getSingleMarkedColor(opt_clusterOptions);
  const unmarkedColor = mm_cluster.getSingleUnmarkedColor(opt_clusterOptions);

  return getFill(isMarked, markedColor, unmarkedColor, opt_color);
};

/**
 * @param {boolean} isMarked is marked
 * @param {ClusterOptions} [opt_clusterOptions] opts
 * @return {Fill} fill
 */
const getFillForMultipleLabel = (isMarked, opt_clusterOptions) => {
  const markedColor = mm_cluster.getMultipleMarkedColor(opt_clusterOptions);
  const unmarkedColor = mm_cluster.getMultipleUnmarkedColor(opt_clusterOptions);

  return getFill(isMarked, markedColor, unmarkedColor);
};

/**
 * @param {IconOptions} icon icon
 * @param {ol.geom.Point|
 *  function((Feature|ol.render.Feature)): ol.geom.Point} geom geom
 * @param {number} [opt_zIndex] zindex
 * @return {Style} style
 */
const iconFunction = (icon, geom, opt_zIndex) => {
  const anchor = calculateIconAnchor(icon);
  return new Style({
    geometry: geom,
    image: new Icon({
      src: icon.url,
      anchor: anchor,
    }),
    zIndex: opt_zIndex,
  });
};

/**
 * @param {IconOptions?} icon icon
 * @param {ol.geom.Point} geom geom
 * @return {Style} style
 */
const multipleSymbolFunction = (icon, geom) => {
  let style;
  if (icon) {
    style = iconFunction(icon, geom);
  } else {
    style = new Style({
      geometry: geom,
      image: new Circle({
        radius: mm_style_constants.CLUSTER_RADIUS,
        fill: mm_style_constants.MARKER_FILL,
        stroke: new Stroke({
          color: '#ffffff',
          width: 3,
        }),
      }),
      zIndex: 7,
    });
  }
  return style;
};

/**
 * @param {IconOptions?} icon icon
 * @param {ol.geom.Point|function((Feature|ol.render.Feature)): ol.geom.Point
 *    } geom geom
 * @return {Style} style
 */
const singleSymbolFunction = (icon, geom) => {
  return icon ? iconFunction(icon, geom) : mm_style_constants.CLUSTER_MULTIPLE;
};

/**
 * @param {PinFunctionOptions} options options
 * @return {Array<Style>} pin fn
 */
const pinFunction_ = (options) => {
  const {isMarked, title, pinOpts: opts, clusterOptions, feature} = options;
  const color = /**@type {string}*/ (feature.get('color'));
  let styleArray = [];

  const markedIcon = mm_cluster.getSingleMarkedIconOptions(clusterOptions);
  const unmarkedIcon = mm_cluster.getSingleUnmarkedIconOptions(clusterOptions);

  if (color && !markedIcon) {
    //create pin with color from custom marker
    styleArray = mm_style.getLabelWithPin(opts);
  } else {
    if (isMarked && markedIcon) {
      //cluster with markers and with custom icon
      if (title) {
        opts.icon = markedIcon;
        const textStyle = mm_style.getTextStyleWithOffsetY(opts);
        styleArray = styleArray.concat(textStyle);
      }
      styleArray.push(
        iconFunction(markedIcon, mm_geom.CENTER_GEOMETRY_FUNCTION(feature), 6)
      );
    } else if (!isMarked && unmarkedIcon) {
      //cluster without markers and custom icon
      if (title) {
        opts.icon = unmarkedIcon;
        const textStyle = mm_style.getTextStyleWithOffsetY(opts);
        styleArray = styleArray.concat(textStyle);
      }
      styleArray.push(
        iconFunction(unmarkedIcon, mm_geom.CENTER_GEOMETRY_FUNCTION(feature), 6)
      );
    } else {
      //default style - default marked or unmarked pin
      if (title) {
        const textStyle = mm_style.getTextStyleWithOffsetY(opts);
        styleArray = styleArray.concat(textStyle);
      }
      const pin = isMarked
        ? mm_style_marker.createPinFromGeometry(opts.geometry)
        : mm_style.PIN;
      styleArray.push(pin);
    }
  }
  return styleArray;
};

/**
 * @param {StyleFunctionOptions} options opts
 * @param {ClusterOptions} clusterOptions opts
 * @param {Feature} clusterFeature cluster feature
 * @param {Feature} feature feature
 * @param {number} resolution resolution
 * @return {Array<Style>} style
 * @protected
 */
const pinFunction = (
  options,
  clusterOptions,
  clusterFeature,
  feature,
  resolution
) => {
  const {lang, locationCodes, clusterFacultyAbbr, targetId} = options;

  const color = /**@type {string}*/ (feature.get('color'));
  const isMarked = mm_marker.isMarker(targetId, feature);
  const isCustom = isCustomMarker(feature);
  let geometry = feature.getGeometry();
  if (geometry instanceof MultiPolygon) {
    geometry = mm_geom.getLargestPolygon(geometry);
  }
  mm_assert.assert(!!geometry);

  const fill = getFillForPin(isMarked, color, clusterOptions);
  let styleArray = [];
  let title;
  let minorTitle;

  if (mm_utils.isDefAndNotNull(options.markerLabel)) {
    title = options.markerLabel(clusterFeature, resolution);
  }

  if (locationCodes) {
    title = /**@type {string}*/ (feature.get('polohKod'));
  }

  if (!mm_utils.isDefAndNotNull(title)) {
    if (isMarked) {
      const allMarkers = getMarkerStore(targetId).getFeatures();
      title = getMarkedDefaultLabel(
        options,
        allMarkers,
        clusterFeature,
        resolution
      );
    } else {
      title = getUnmarkedDefaultLabel(clusterFeature, resolution, lang);
    }
  }

  if (clusterFacultyAbbr) {
    const minorFeatures = mm_cluster.getMinorFeatures(targetId, clusterFeature);
    minorTitle = mm_cluster.getMinorTitleParts(minorFeatures, isMarked, lang);
  }

  const opts = /** @type {LabelWithPinOptions}*/ ({
    fill: fill,
    fontSize: BUILDING_FONT_SIZE,
    geometry: geometry,
    title: /**@type {!string|undefined}*/ (title),
    zIndex: 6,
    minorTitle: minorTitle,
  });

  const icon = /** @type {IconOptions}*/ (feature.get('icon'));

  //create style for cluster with one custom marker
  if (isCustom && icon) {
    const anchor = calculateIconAnchor(icon);
    styleArray.push(
      new Style({
        geometry: geometry,
        image: new Icon({
          src: icon.url,
          anchor: anchor,
        }),
      })
    );
    if (mm_utils.isDefAndNotNull(opts.title)) {
      opts.icon = icon;
      const textStyle = mm_style.getTextStyleWithOffsetY(opts);
      styleArray = styleArray.concat(textStyle);
    }
    return styleArray;
  }

  //create style
  const optsInternal = /** @type {PinFunctionOptions}*/ ({
    feature,
    pinOpts: opts,
    isMarked,
    title,
    clusterOptions,
  });
  styleArray = pinFunction_(optsInternal);
  return styleArray;
};

/**
 * @param {boolean} isMarked whether is marked
 * @param {number} fontSize font size
 * @param {string} title title
 * @param {ClusterOptions} [opt_clusterOptions] opts
 * @return {number} offset
 */
const calculateOffset = (isMarked, fontSize, title, opt_clusterOptions) => {
  const markedIcon =
    mm_cluster.getMultipleMarkedIconOptions(opt_clusterOptions);
  const unmarkedIcon =
    mm_cluster.getMultipleUnmarkedIconOptions(opt_clusterOptions);

  let offY = mm_style.getLabelHeight(title, fontSize) / 2;
  if (isMarked && markedIcon) {
    offY = extendTitleOffset(markedIcon, offY);
  } else if (!isMarked && unmarkedIcon) {
    offY = extendTitleOffset(unmarkedIcon, offY);
  } else {
    offY += mm_style_constants.CLUSTER_RADIUS + 2;
  }
  return offY;
};

/**
 * @param {number} offsetY offsetY
 * @param {boolean} isMarked whether is marked
 * @param {number} fontSize font size
 * @param {string} title title
 * @param {ClusterOptions} [opt_clusterOptions] opts
 * @return {number} offset
 */
const calculateMinorOffset = (
  offsetY,
  isMarked,
  fontSize,
  title,
  opt_clusterOptions
) => {
  const markedIcon =
    mm_cluster.getMultipleMarkedIconOptions(opt_clusterOptions);
  const unmarkedIcon =
    mm_cluster.getMultipleUnmarkedIconOptions(opt_clusterOptions);

  let offY = mm_style.getLabelHeight(title, fontSize) / 2;
  if (isMarked && markedIcon) {
    offY = extendTitleOffset(markedIcon, offY);
    if (markedIcon.position !== mm_style_constants.IconPosition.ORIGIN) {
      offY += offsetY;
    }
  } else if (!isMarked && unmarkedIcon) {
    offY = extendTitleOffset(unmarkedIcon, offY);
    if (unmarkedIcon.position !== mm_style_constants.IconPosition.ORIGIN) {
      offY += offsetY;
    }
  } else {
    offY += mm_style_constants.CLUSTER_RADIUS - 2;
  }

  return offsetY + offY;
};

/**
 * @param {StyleFunctionOptions} options opts
 * @param {ClusterOptions} clusterOptions opts
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Array<Style>} style
 * @protected
 */
const multipleLabelFunction = (
  options,
  clusterOptions,
  feature,
  resolution
) => {
  mm_assert.assertInstanceof(feature, Feature);
  const {lang, targetId} = options;
  const appendFacultyAbbr = clusterOptions && clusterOptions.facultyAbbr;

  const features = mm_cluster.getMainFeatures(
    targetId,
    /**@type {Feature}*/ (feature)
  );
  const minorFeatures = mm_cluster.getMinorFeatures(
    targetId,
    /**@type {Feature}*/ (feature)
  );
  const marked = mm_marker.isMarker(targetId, features[0]);
  const textStyle = [];

  let allMarkers;
  let title;
  let minorTitle;

  if (marked) {
    allMarkers = getMarkerStore(targetId).getFeatures();
  }

  if (mm_utils.isDefAndNotNull(options.markerLabel)) {
    title = options.markerLabel(feature, resolution);
  }

  if (!mm_utils.isDefAndNotNull(title)) {
    if (marked) {
      title = getMarkedDefaultLabel(
        options,
        allMarkers || [],
        /**@type {Feature}*/ (feature),
        resolution
      );
    } else {
      title = getUnmarkedDefaultLabel(
        /**@type {Feature}*/ (feature),
        resolution,
        lang
      );
    }
  }

  if (title) {
    const fontSize = 13;
    const markedIcon = mm_cluster.getMultipleMarkedIconOptions(clusterOptions);
    const unmarkedIcon =
      mm_cluster.getMultipleUnmarkedIconOptions(clusterOptions);

    let minorFill = mm_style_constants.TEXT_FILL;
    let fill = getFillForMultipleLabel(marked, clusterOptions);

    if (appendFacultyAbbr) {
      const pos = mm_style_constants.IconPosition;
      minorTitle = mm_cluster.getMinorTitleParts(minorFeatures, marked, lang);
      if (
        !!minorTitle &&
        ((marked && markedIcon && markedIcon.position === pos.BELOW) ||
          (!marked && unmarkedIcon && unmarkedIcon.position === pos.BELOW))
      ) {
        [title, minorTitle] = [minorTitle, title];
        [fill, minorFill] = [minorFill, fill];
      }
    }
    const offsetY = calculateOffset(marked, fontSize, title, clusterOptions);
    const geometry = marked
      ? mm_geom.getGeometryCenterOfFeatures(features)
      : mm_geom.CENTER_GEOMETRY_FUNCTION;

    textStyle.push(
      new Style({
        geometry: geometry,
        text: new Text({
          font: 'bold ' + fontSize + 'px arial',
          fill: fill,
          offsetY: offsetY,
          stroke: mm_style_constants.TEXT_STROKE,
          text: title,
          overflow: true,
        }),
        zIndex: marked ? 7 : 4,
      })
    );

    if (appendFacultyAbbr) {
      if (minorTitle) {
        const minorOffY = calculateMinorOffset(
          offsetY,
          marked,
          fontSize,
          minorTitle,
          clusterOptions
        );

        textStyle.push(
          new Style({
            geometry: geometry,
            text: new Text({
              font: 'bold ' + fontSize + 'px arial',
              fill: minorFill,
              offsetY: minorOffY,
              stroke: mm_style_constants.TEXT_STROKE,
              text: minorTitle,
              overflow: true,
            }),
            zIndex: marked ? 7 : 4,
          })
        );
      }
    }
  }

  return textStyle;
};

/**
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @param {StyleFunctionOptions} markerOptions opts
 * @param {ClusterOptions} clusterOptions opts
 * @return {Style|Array<Style>} style
 */
const styleFunction = (feature, resolution, markerOptions, clusterOptions) => {
  mm_assert.assertInstanceof(feature, Feature);
  let result;
  const features = mm_cluster.getMainFeatures(
    markerOptions.targetId,
    /** @type {Feature}*/ (feature)
  );
  const firstFeature = features[0];
  const marked = mm_marker.isMarker(markerOptions.targetId, firstFeature);
  if (features.length === 1) {
    result = pinFunction(
      markerOptions,
      clusterOptions,
      /** @type {Feature}*/ (feature),
      firstFeature,
      resolution
    );
  } else {
    result = [];
    let symbolStyle;
    const labelStyle = multipleLabelFunction(
      markerOptions,
      clusterOptions,
      feature,
      resolution
    );
    result.push(...labelStyle);
    if (marked) {
      const multipleIcon =
        mm_cluster.getMultipleMarkedIconOptions(clusterOptions);
      symbolStyle = multipleSymbolFunction(
        multipleIcon,
        mm_geom.getGeometryCenterOfFeatures(features)
      );
    } else {
      const icon = mm_cluster.getMultipleUnmarkedIconOptions(clusterOptions);
      symbolStyle = singleSymbolFunction(
        icon,
        mm_geom.CENTER_GEOMETRY_FUNCTION
      );
    }

    if (symbolStyle) {
      result.push(symbolStyle);
    }
  }
  return result;
};

/**
 * @param {StyleFunctionOptions} options options
 * @param {ClusterOptions} clusterOptions options
 * @return {ol.style.StyleFunction} style function
 */
const getStyleFunction = (options, clusterOptions) => {
  const styleFce = (feature, res) => {
    const style = styleFunction(feature, res, options, clusterOptions);
    return style;
  };

  return styleFce;
};

export {getStyleFunction};
