/**
 * @module ui/info
 */

import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import * as ol_extent from 'ol/extent';
import {FloorTypes} from '../feature/floor.js';
import {GeoJSON} from 'ol/format';
import {featureExtentIntersect} from '../utils/geom.js';
import {getByCode as getBuildingByCode} from '../feature/building.js';
import {getElementSize} from '../utils/dom.js';

/**
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("../view/info.js").PopupPositionOptions} PopupPositionOptions
 * @typedef {import("../conf.js").State} State
 */

/**
 * @typedef {Object} InfoPositionOptions
 * @property {ol.extent.Extent} [extent] extent
 * @property {number} [resolution] resolution
 * @property {string} [selectedFeature] selectedFeature
 */

/**
 * Equal to 2 * border-width of ol.popup:after.
 * @type {number}
 * @const
 */
const POPUP_TALE_HEIGHT = 10;

/**
 * Equal to left positioning (- 11px of margin) of ol.popup:after.
 * @type {number}
 * @const
 */
const POPUP_TALE_INDENT = 8;

/**
 * Get label of given floor code.
 * @param {string} floorCode 3 characters long floor code
 * @param {string} lang language
 * @return {string} floor label
 */
const getLabel = (floorCode, lang) => {
  const letter = floorCode.substr(0, 1);
  const num = parseInt(floorCode.substr(1), 10);
  let numLabel = '';
  if (lang === munimap_lang.Abbr.ENGLISH) {
    switch (num) {
      case 1:
        numLabel = num + 'st ';
        break;
      case 2:
        numLabel = num + 'nd ';
        break;
      case 3:
        numLabel = num + 'rd ';
        break;
      default:
        numLabel = num + 'th ';
        break;
    }
  } else if (lang === munimap_lang.Abbr.CZECH) {
    numLabel = num + '. ';
  }
  let label;
  let floorTypeString;
  switch (letter) {
    case FloorTypes.UNDERGROUND:
      floorTypeString = munimap_lang.getMsg(
        munimap_lang.Translations.FLOOR_UNDER,
        lang
      );
      label = numLabel + floorTypeString;
      break;
    case FloorTypes.UNDERGROUND_MEZZANINE:
      floorTypeString = munimap_lang.getMsg(
        munimap_lang.Translations.FLOOR_MEZZANINE_UNDER,
        lang
      );
      label = floorTypeString;
      break;
    case FloorTypes.MEZZANINE:
      floorTypeString = munimap_lang.getMsg(
        munimap_lang.Translations.FLOOR_MEZZANINE,
        lang
      );
      label = floorTypeString;
      break;
    case FloorTypes.ABOVEGROUND:
      floorTypeString = munimap_lang.getMsg(
        munimap_lang.Translations.FLOOR_ABOVE,
        lang
      );
      label = numLabel + floorTypeString;
      break;
    default:
      label = floorCode;
      break;
  }
  return label;
};

/**
 * Get abbreviated label of given floor code.
 * @param {string} floorCode 3 characters long floor code
 * @param {string} lang language
 * @return {string} abbreviated floor label
 */
const getLabelAbbr = (floorCode, lang) => {
  const letter = floorCode.substr(0, 1);
  const num = parseInt(floorCode.substr(1), 10);
  let numLabel = '';
  let mezzanineNumLabel = '';
  if (lang === munimap_lang.Abbr.ENGLISH) {
    numLabel = (
      letter === FloorTypes.UNDERGROUND_MEZZANINE ? num - 1 : num
    ).toString();
    mezzanineNumLabel = '.5';
  } else if (lang === munimap_lang.Abbr.CZECH) {
    numLabel = (
      letter === FloorTypes.UNDERGROUND_MEZZANINE ? num - 1 : num
    ).toString();
    mezzanineNumLabel = ',5';
  }
  let label;
  let floorTypeString;
  switch (letter) {
    case FloorTypes.UNDERGROUND:
      floorTypeString = munimap_lang.getMsg(
        munimap_lang.Translations.FLOOR_UNDER_ABBR,
        lang
      );
      label =
        lang === munimap_lang.Abbr.ENGLISH
          ? floorTypeString + numLabel
          : numLabel + '. ' + floorTypeString;
      break;
    case FloorTypes.UNDERGROUND_MEZZANINE:
      floorTypeString = munimap_lang.getMsg(
        munimap_lang.Translations.FLOOR_MEZZANINE_UNDER_ABBR,
        lang
      );
      label =
        lang === munimap_lang.Abbr.ENGLISH
          ? floorTypeString + numLabel + mezzanineNumLabel
          : numLabel + mezzanineNumLabel + '. ' + floorTypeString;
      break;
    case FloorTypes.MEZZANINE:
      floorTypeString = munimap_lang.getMsg(
        munimap_lang.Translations.FLOOR_MEZZANINE_ABBR,
        lang
      );
      label =
        lang === munimap_lang.Abbr.ENGLISH
          ? floorTypeString + numLabel + mezzanineNumLabel
          : numLabel + mezzanineNumLabel + '. ' + floorTypeString;
      break;
    case FloorTypes.ABOVEGROUND:
      floorTypeString = munimap_lang.getMsg(
        munimap_lang.Translations.FLOOR_ABOVE_ABBR,
        lang
      );
      label =
        lang === munimap_lang.Abbr.ENGLISH
          ? floorTypeString + numLabel
          : numLabel + '. ' + floorTypeString;
      break;
    default:
      label = floorCode;
      break;
  }
  return label;
};

/**
 * @param {HTMLDivElement} customFloorSelect select element
 * @param {string} selectedFeature selected feature
 * @return {HTMLOptionElement|undefined} element
 */
const findSelectedFloorItem = (customFloorSelect, selectedFeature) => {
  if (!selectedFeature || selectedFeature.length < 8) {
    return;
  }
  let selectedItem;
  if (selectedFeature) {
    const menuEl = customFloorSelect.getElementsByClassName(
      'munimap-floor-select-menu'
    )[0];
    selectedItem = Array.from(menuEl.children).find((child) => {
      const locationCode = /**@type {HTMLDivElement}*/ (child).getAttribute(
        'data-lc'
      );
      return locationCode === selectedFeature;
    });
    // if (selectedFloor.locationCode !== munimap.bubble.OVERLAY.floor &&
    //       munimap.bubble.OVERLAY.floor !== 'noChange') {
    //   munimap.getProps(map).selectedMarker = null;
    //   map.removeOverlay(munimap.bubble.OVERLAY);
    // }
  }
  return /**@type {HTMLOptionElement}*/ (selectedItem);
};

/**
 * Get infobox position.
 * @param {HTMLElement} infoEl info element
 * @param {InfoPositionOptions} options options
 * @return {PopupPositionOptions} position
 */
const getInfoBoxPosition = (infoEl, options) => {
  const {extent, resolution, selectedFeature} = options;
  if (!extent || !selectedFeature || !resolution) {
    return;
  }
  const building = getBuildingByCode(selectedFeature);
  const topRight = ol_extent.getTopRight(extent);
  const elSize = getElementSize(infoEl);
  const extWidth = resolution * elSize.width;
  const extHeight = resolution * (elSize.height + POPUP_TALE_HEIGHT);

  const elExtent = /**@type {ol.extent.Extent}*/ ([
    topRight[0] - extWidth,
    topRight[1] - extHeight,
    topRight[0],
    topRight[1],
  ]);
  const result = {};
  const bldgGeom = building.getGeometry();
  if (!bldgGeom.intersectsExtent(elExtent)) {
    const bottomLeft = ol_extent.getBottomLeft(extent);
    const reducedViewExt = /**@type {ol.extent.Extent}*/ ([
      bottomLeft[0],
      bottomLeft[1],
      topRight[0] - extWidth,
      topRight[1] - extHeight,
    ]);
    const format = new GeoJSON();
    let intersect = featureExtentIntersect(building, reducedViewExt, format);
    if (munimap_utils.isDefAndNotNull(intersect) && !!intersect.getGeometry()) {
      const closestPoint = intersect.getGeometry().getClosestPoint(topRight);
      result.coordinate = [closestPoint[0], closestPoint[1] + extHeight];
      result.hideTale = false;
    } else {
      intersect = featureExtentIntersect(building, extent, format);
      if (
        munimap_utils.isDefAndNotNull(intersect) &&
        !!intersect.getGeometry()
      ) {
        const bbox = intersect.getGeometry().getExtent();
        const topLeft = ol_extent.getTopLeft(extent);
        const upperExt = /**@type {ol.extent.Extent}*/ ([
          topLeft[0],
          topLeft[1] - extHeight,
          topRight[0],
          topRight[1],
        ]);
        if (bldgGeom.intersectsExtent(upperExt)) {
          result.coordinate = [bbox[2], topRight[1]];
        } else {
          result.coordinate = [topRight[0] - extWidth, bbox[3] + extHeight];
        }
      }
      result.hideTale = true;
    }
  }

  if (!result.coordinate) {
    const parentEl = infoEl.parentElement;
    result.position = [parentEl.offsetWidth - elSize.width, 0];
    result.hideTale = true;
  }

  return result;
};

export {
  POPUP_TALE_HEIGHT,
  POPUP_TALE_INDENT,
  findSelectedFloorItem,
  getLabel,
  getLabelAbbr,
  getInfoBoxPosition,
};
