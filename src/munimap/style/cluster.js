/**
 * @module style/cluster
 */

import * as munimap_assert from '../assert/assert.js';
import * as munimap_building from '../feature/building.js';
import * as munimap_cluster from '../cluster/cluster.js';
import * as munimap_geom from '../utils/geom.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_marker from '../feature/marker.js';
import * as munimap_marker_custom from '../feature/marker.custom.js';
import * as munimap_style from '../style/style.js';
import * as munimap_style_building from './building.js';
import * as munimap_style_marker from '../style/marker.js';
import * as munimap_unit from '../feature/unit.js';
import * as munimap_utils from '../utils/utils.js';
import Feature from 'ol/Feature';
import {Circle, Fill, Stroke, Style, Text} from 'ol/style';
import {localeCompare} from '../utils/string.js';

/**
 * @typedef {import("../style/marker.js").LabelFunctionOptions} LabelFunctionOptions
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 */

/**
 * @typedef {Object} ExtraLabelFunctionOptions
 * @property {boolean} clusterFacultyAbbr
 */

/**
 * @typedef {LabelFunctionOptions & ExtraLabelFunctionOptions} ClusterLabelFunctionOptions
 */

/**
 * @type {number}
 * @protected
 * @const
 */
const RADIUS = 12;

/**
 * @type {Style}
 * @protected
 * @const
 */
const MULTIPLE = new Style({
  image: new Circle({
    radius: RADIUS,
    fill: munimap_style.TEXT_FILL,
    stroke: new Stroke({
      color: '#ffffff',
      width: 2,
    }),
  }),
});

/**
 * @type {Style}
 * @protected
 * @const
 */
const MULTIPLE_MARKED = new Style({
  image: new Circle({
    radius: RADIUS,
    fill: munimap_style_marker.FILL,
    stroke: new Stroke({
      color: '#ffffff',
      width: 3,
    }),
  }),
});

/**
 *
 * @param {Array<Feature>} minorFeatures minor features
 * @param {boolean} isMarked whether is marked
 * @param {string} lang language
 * @return {string|undefined} minor title parts
 */
const getMinorTitleParts = (minorFeatures, isMarked, lang) => {
  let minorTitle;
  if (isMarked) {
    if (minorFeatures.length > 0) {
      const units = munimap_unit.getFacultiesOfBuildings(minorFeatures);
      const titleParts = [];

      units.forEach((unit) => {
        const abbr = munimap_unit.getAbbr(unit, lang);
        if (abbr) {
          titleParts.push(abbr);
        }
      });
      titleParts.sort();
      if (titleParts.length > 5) {
        let result = [];
        for (let i = 0, len = titleParts.length; i < len; i += 5) {
          result.push(titleParts.slice(i, i + 5));
        }
        result = result.map((item) => item.join(', '));
        minorTitle = result.join('\n');
      } else {
        minorTitle = titleParts.join(', ');
      }
    }
  }

  return minorTitle;
};

/**
 * Clustered features are buildings only.
 * @param {Feature} feature feature
 * @param {number} resolution resoltuion
 * @param {string} lang language
 * @return {string} label
 * @protected
 */
const getUnmarkedDefaultLabel = (feature, resolution, lang) => {
  munimap_assert.assertInstanceof(feature, Feature);
  let titleParts = [];
  let units;
  const clusteredBuildings = munimap_cluster.getFeatures(feature);

  const range = munimap_cluster.getResolutionRange(resolution);
  if (range === munimap_cluster.Resolutions.MARKERS_AND_FACULTIES) {
    units = munimap_unit.getFacultiesOfBuildings(clusteredBuildings);
    if (units.length >= 10) {
      return munimap_lang.getMsg(
        munimap_lang.Translations.CLUSTER_MU_LABEL,
        lang
      );
    }
  } else {
    units = munimap_unit.getUnitsOfBuildings(clusteredBuildings);
  }
  titleParts = munimap_unit.getTitleParts(units, lang);
  return titleParts.join('\n');
};

/**
 * Clustered features are buildings only.
 * @param {ClusterLabelFunctionOptions} options options
 * @param {Array<Feature>} allMarkers all markers
 * @param {Feature} feature feature
 * @param {number} resolution resolution
 * @return {string} label
 * @protected
 */
const getMarkedDefaultLabel = (options, allMarkers, feature, resolution) => {
  const lang = options.lang;
  const clusteredFeatures = munimap_cluster.getFeatures(feature);
  let markers = clusteredFeatures.filter((feat) => allMarkers.includes(feat));

  const titleParts = [];

  if (markers.length > 3) {
    let markerType;
    if (markers.every((el) => munimap_building.isBuilding(el))) {
      markerType = munimap_lang.getMsg(
        munimap_lang.Translations.BUILDING,
        lang
      );
      // } else if (markers.every((el) => munimap.room.isRoom(el))) {
      //   markerType = munimap_lang.getMsg(munimap_lang.Translations.ROOM, lang);
      // } else if (markers.every((el) => munimap.door.isDoor(el))) {
      //   markerType = munimap_lang.getMsg(munimap_lang.Translations.DOOR, lang);
    } else {
      markerType = munimap_lang.getMsg(
        munimap_lang.Translations.LOCATION,
        lang
      );
    }
    titleParts.push(markers.length + 'x ' + markerType);
  } else {
    if (munimap_utils.isDefAndNotNull(options.markerLabel)) {
      markers = markers.filter((marker) => {
        const title = options.markerLabel(marker, resolution);
        if (munimap_utils.isDefAndNotNull(title)) {
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
        if (munimap_building.isBuilding(marker)) {
          const range = munimap_cluster.getResolutionRange(resolution);
          const units = [];
          const unitsFunc =
            range === munimap_cluster.Resolutions.MARKERS_AND_FACULTIES
              ? munimap_building.getFaculties
              : munimap_building.getUnits;
          const buildingsWithoutUnits = [];
          const uns = unitsFunc(marker);
          if (uns.length) {
            units.push(...uns);
          } else {
            buildingsWithoutUnits.push(marker);
          }
          if (munimap_unit.getTitleParts(units, lang).length > 0) {
            titleParts.push(munimap_unit.getTitleParts(units, lang)[0]);
          }
          buildingsWithoutUnits.forEach((building) => {
            let buildingTitle;
            const bUnits = munimap_building.getUnits(building);
            if (bUnits.length) {
              buildingTitle = munimap_unit.getTitleParts(bUnits, lang);
            } else {
              buildingTitle = munimap_building.getDefaultLabel(
                building,
                resolution,
                lang
              );
            }
            titleParts.push(buildingTitle);
          });
        } else if (munimap_marker_custom.isCustom(marker)) {
          const cmTitle = munimap_marker_custom.getLabel(marker);
          if (munimap_utils.isDefAndNotNull(cmTitle)) {
            titleParts.push(cmTitle);
          }
          titleParts.sort(localeCompare);
        }
        // else if (munimap.room.isRoom(marker)) {
        //   const showLocationCodes = munimap.getProps(options.map).locationCodes;
        //   const roomTitle = (showLocationCodes) ?
        //     /**@type {string}*/ (marker.get('polohKod')) :
        //     munimap_style.getDefaultLabel(marker, resolution, lang);
        //   if (munimap_utils.isDefAndNotNull(roomTitle)) {
        //     titleParts.push(roomTitle);
        //   }
        // }
      });
    }
  }
  return titleParts.join('\n');
};

/**
 * @param {ClusterLabelFunctionOptions} options options
 * @param {Feature} clusterFeature cluster feature
 * @param {Feature} feature feature
 * @param {number} resolution resolution
 * @return {Array.<Style>} style
 * @protected
 */
const pinFunction = (options, clusterFeature, feature, resolution) => {
  const {lang, clusterFacultyAbbr, locationCodes} = options;

  const color = /**@type {string}*/ (feature.get('color'));
  const isMarked = munimap_marker.isMarker(options.map, feature);
  const geometry = feature.getGeometry();
  munimap_assert.assert(!!geometry);

  let styleArray = [];
  let fill;
  let title;
  let minorTitle;

  if (munimap_utils.isDefAndNotNull(options.markerLabel)) {
    title = options.markerLabel(clusterFeature, resolution);
  }

  if (locationCodes) {
    title = /**@type {string}*/ (feature.get('polohKod'));
  }

  if (!munimap_utils.isDefAndNotNull(title)) {
    if (isMarked) {
      const allMarkers = options.markerSource.getFeatures();
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

  if (color) {
    fill = new Fill({
      color: color,
    });
  } else if (isMarked) {
    fill = munimap_style_marker.TEXT_FILL;
  } else {
    fill = munimap_style.TEXT_FILL;
  }

  if (clusterFacultyAbbr) {
    const minorFeatures = munimap_cluster.getMinorFeatures(
      options.map,
      clusterFeature
    );
    minorTitle = getMinorTitleParts(minorFeatures, isMarked, lang);
  }

  const opts = {
    fill: fill,
    fontSize: munimap_style_building.FONT_SIZE,
    geometry: geometry,
    title: /**@type {!string|undefined}*/ (title),
    zIndex: 6,
    minorTitle: minorTitle,
  };
  if (color) {
    styleArray = munimap_style.getLabelWithPin(opts);
  } else {
    if (title) {
      const textStyle = munimap_style.getTextStyleWithOffsetY(opts);
      styleArray = styleArray.concat(textStyle);
    }
    const pin = isMarked
      ? munimap_style_marker.createPinFromGeometry(geometry)
      : munimap_style.PIN;
    styleArray.push(pin);
  }
  return styleArray;
};

/**
 * @param {ClusterLabelFunctionOptions} options options
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Array.<Style>!} style
 * @protected
 */
const multipleLabelFunction = (options, feature, resolution) => {
  munimap_assert.assertInstanceof(feature, Feature);
  const {map, lang, clusterFacultyAbbr} = options;

  const features = munimap_cluster.getMainFeatures(
    map,
    /**@type {Feature}*/ (feature)
  );
  const minorFeatures = munimap_cluster.getMinorFeatures(
    options.map,
    /**@type {Feature}*/ (feature)
  );
  const marked = munimap_marker.isMarker(map, features[0]);
  const textStyle = [];

  let allMarkers;
  let title;
  let minorTitle;

  if (marked) {
    allMarkers = options.markerSource.getFeatures();
  }

  if (munimap_utils.isDefAndNotNull(options.markerLabel)) {
    title = options.markerLabel(feature, resolution);
  }

  if (!munimap_utils.isDefAndNotNull(title)) {
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
    const offsetY =
      munimap_style.getLabelHeight(title, fontSize) / 2 + RADIUS + 2;
    const fill = marked
      ? munimap_style_marker.TEXT_FILL
      : munimap_style.TEXT_FILL;
    const geometry = marked
      ? munimap_geom.getGeometryCenterOfFeatures(features)
      : munimap_geom.CENTER_GEOMETRY_FUNCTION;

    if (clusterFacultyAbbr) {
      minorTitle = getMinorTitleParts(minorFeatures, marked, lang);
    }

    textStyle.push(
      new Style({
        geometry: geometry,
        text: new Text({
          font: 'bold ' + fontSize + 'px arial',
          fill: fill,
          offsetY: offsetY,
          stroke: munimap_style.TEXT_STROKE,
          text: title,
          overflow: true,
        }),
        zIndex: marked ? 7 : 4,
      })
    );

    if (clusterFacultyAbbr) {
      minorTitle = getMinorTitleParts(minorFeatures, marked, lang);

      if (minorTitle) {
        const minorOffsetY =
          RADIUS +
          2 +
          munimap_style.getLabelHeight(title, fontSize) +
          munimap_style.getLabelHeight(minorTitle, fontSize) / 2;

        textStyle.push(
          new Style({
            geometry: geometry,
            text: new Text({
              font: 'bold ' + fontSize + 'px arial',
              fill: munimap_style.TEXT_FILL,
              offsetY: minorOffsetY,
              stroke: munimap_style.TEXT_STROKE,
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
 * @param {ClusterLabelFunctionOptions} options opts
 * @param {Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Style|Array.<Style>} style
 */
const styleFunction = (options, feature, resolution) => {
  munimap_assert.assertInstanceof(feature, Feature);
  let result;
  const features = munimap_cluster.getMainFeatures(
    options.map,
    /** @type {Feature}*/ (feature)
  );
  const firstFeature = features[0];
  const marked = munimap_marker.isMarker(options.map, firstFeature);
  if (features.length === 1) {
    result = pinFunction(
      options,
      /** @type {Feature}*/ (feature),
      firstFeature,
      resolution
    );
  } else {
    result = [];
    let circleStyle;
    const labelStyle = multipleLabelFunction(options, feature, resolution);
    result.push(...labelStyle);
    if (marked) {
      circleStyle = new Style({
        geometry: munimap_geom.getGeometryCenterOfFeatures(features),
        image: new Circle({
          radius: RADIUS,
          fill: munimap_style_marker.FILL,
          stroke: new Stroke({
            color: '#ffffff',
            width: 3,
          }),
        }),
        zIndex: 7,
      });
    } else {
      circleStyle = MULTIPLE;
    }
    result.push(circleStyle);
  }
  return result;
};

export {styleFunction};
