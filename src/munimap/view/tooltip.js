/**
 * @module view/tooltip
 */
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import turf_booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {CENTER_GEOMETRY_FUNCTION} from '../utils/geom.js';
import {Circle, Point} from 'ol/geom';
import {
  GIS_PURPOSES_WITH_TOOLTIP,
  PoiPurpose,
  RoomPurposesWithTooltip,
} from '../feature/constants.js';
import {POI_ICON_HEIGHT, ROOM_FONT_SIZE} from '../style/constants.js';
import {fromCircle} from 'ol/geom/Polygon';
import {getActiveRoomStore} from '../source/constants.js';
import {getDefaultLabel} from '../feature/room.js';
import {getLabelHeight} from '../style/style.js';

/**
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("./view.js").PointerMoveTimeoutOptions} PointerMoveTimeoutOptions
 */

/**
 * @typedef {object} TooltipExtendedProps
 * @property {number} resolution resolution
 * @property {string} lang lang
 * @property {string} targetId targetId
 * @property {boolean} locationCodes locationCodes
 *
 * @typedef {PointerMoveTimeoutOptions & TooltipExtendedProps} TooltipOptions
 */

/**
 * @typedef {object} TooltipParams
 * @property {string} title title
 * @property {ol.coordinate.Coordinate} positionInCoords positionInCoords
 */

/**
 * Returns the offset of polygon in case that the icon involves text.
 * @param {Feature} feature feature
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

export {calculateParameters};
