/**
 * @module view/tooltip
 */
import * as mm_range from '../utils/range.js';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import turf_booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {Circle, Point} from 'ol/geom';
import {
  FLOOR_RESOLUTION,
  POI_RESOLUTION,
  PoiPurpose,
} from '../feature/_constants.js';
import {
  GIS_PURPOSES_WITH_TOOLTIP,
  RoomPurposesWithTooltip,
} from './_constants.js';
import {POI_ICON_HEIGHT, ROOM_FONT_SIZE} from '../style/_constants.js';
import {fromCircle} from 'ol/geom/Polygon';
import {getActiveRoomStore} from '../source/_constants.js';
import {getDefaultLabel} from '../feature/room.js';
import {getLabelHeight} from '../style/style.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("./view.js").PointerMoveTimeoutOptions} PointerMoveTimeoutOptions
 */

/**
 * @typedef {Object} TooltipExtendedProps
 * @property {number} resolution resolution
 * @property {string} lang lang
 * @property {string} targetId targetId
 * @property {boolean} locationCodes locationCodes
 *
 * @typedef {PointerMoveTimeoutOptions & TooltipExtendedProps} TooltipOptions
 */

/**
 * @typedef {Object} TooltipParams
 * @property {string} title title
 * @property {ol.coordinate.Coordinate} positionInCoords positionInCoords
 */

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} [selectedFeature] selectedFeature
 * @return {boolean} whether is map resolution in tooltip resolution range
 */
const inTooltipResolutionRange = (feature, resolution, selectedFeature) => {
  const title = feature.get('typ');
  return title === PoiPurpose.COMPLEX_ENTRANCE ||
    title === PoiPurpose.BUILDING_COMPLEX_ENTRANCE
    ? mm_range.contains(POI_RESOLUTION, resolution)
    : !!selectedFeature && mm_range.contains(FLOOR_RESOLUTION, resolution);
};

/**
 * @param {ol.Feature} feature feature
 * @return {boolean} whether is suitable for tooltip
 */
const isSuitableForTooltip = (feature) => {
  const title = feature.get('typ');
  const purposeTitle = feature.get('ucel_nazev');
  const purposeGis = feature.get('ucel_gis');
  return (
    (!!title && Object.values(PoiPurpose).includes(title)) ||
    (!!purposeTitle &&
      Object.values(RoomPurposesWithTooltip).includes(purposeTitle)) ||
    (!!purposeGis && GIS_PURPOSES_WITH_TOOLTIP.includes(purposeGis))
  );
};

/**
 * Returns the offset of polygon in case that the icon involves text.
 * @param {ol.Feature} feature feature
 * @param {string} lang lang
 * @param {boolean} locationCodes locationCodes
 * @return {number} offsett
 */
const getPolygonOffset = (feature, lang, locationCodes) => {
  let title;
  if (locationCodes) {
    title = feature.get('polohKod');
  } else {
    title = getDefaultLabel(feature, lang);
  }
  const labelHeight = getLabelHeight(
    /**@type {string}*/ (title),
    ROOM_FONT_SIZE
  );
  const overallHeight = labelHeight + POI_ICON_HEIGHT + 2;
  const iconOffset = -(overallHeight - POI_ICON_HEIGHT) / 2;
  return iconOffset;
};

/**
 * @param {TooltipOptions} options options
 * @return {boolean} result
 */
const isPoiPixel = (options) => {
  const {featureUid, pixelInCoords, resolution, lang, locationCodes, targetId} =
    options;
  const format = new GeoJSON();
  const turfPoint = /** @type {any} */ (
    format.writeFeatureObject(new Feature(new Point(pixelInCoords)))
  );

  //feature is always room
  const room = getActiveRoomStore(targetId).getFeatureByUid(featureUid);
  const center = CENTER_GEOMETRY_FUNCTION(room).getCoordinates();
  const circle = new Circle(center, ((POI_ICON_HEIGHT + 1) / 2) * resolution);
  const polygon = fromCircle(circle, 4);
  polygon.rotate(Math.PI / 4, center);
  if (
    !!room.get('ucel_gis') &&
    GIS_PURPOSES_WITH_TOOLTIP.includes(room.get('ucel_gis'))
  ) {
    const iconOffset = getPolygonOffset(room, lang, locationCodes);
    polygon.translate(0, -iconOffset * resolution);
  }
  const turfPolygon = /** @type {any} */ (
    format.writeFeatureObject(new Feature(polygon))
  );
  return turf_booleanPointInPolygon(turfPoint, turfPolygon);
};

/**
 * @param {TooltipOptions} options options
 * @return {TooltipParams} params
 */
const calculateParameters = (options) => {
  const {purposeTitle, purposeGis, pixelInCoords} = options;
  let {title} = options;
  let positionInCoords = null;

  if (!!title && Object.values(PoiPurpose).includes(title)) {
    positionInCoords = pixelInCoords;
  } else if (
    !!purposeTitle &&
    Object.values(RoomPurposesWithTooltip).includes(purposeTitle)
  ) {
    title = purposeTitle;
    positionInCoords = isPoiPixel(options) ? pixelInCoords : null;
  } else if (!!purposeGis && GIS_PURPOSES_WITH_TOOLTIP.includes(purposeGis)) {
    title = purposeGis;
    positionInCoords = isPoiPixel(options) ? pixelInCoords : null;
  }
  return {
    positionInCoords,
    title,
  };
};

export {
  GIS_PURPOSES_WITH_TOOLTIP,
  RoomPurposesWithTooltip,
  calculateParameters,
  getPolygonOffset,
  inTooltipResolutionRange,
  isSuitableForTooltip,
};
