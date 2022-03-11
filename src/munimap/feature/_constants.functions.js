import * as constants from './_constants.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import Point from 'ol/geom/Point';
import {isString} from '../utils/utils.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/geom").Point} ol.geom.Point
 * @typedef {import("ol/Feature").FeatureLike} ol.FeatureLike
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 */

/////////////////////////////////////////////////////
////////////////////// BLDG /////////////////////////
/////////////////////////////////////////////////////

/**
 * @param {string} maybeCode location code
 * @return {boolean} if it it location code or not
 */
const isBuildingCode = (maybeCode) => {
  return !!maybeCode.match(constants.BUILDING_CODE_REGEX);
};

/**
 * @param {string} maybeLikeExpr maybeLikeExpr
 * @return {boolean} isLikeExpr
 */
const isBuildingLikeExpr = (maybeLikeExpr) => {
  return (
    !!maybeLikeExpr.match(constants.BUILDING_LIKE_EXPR_REGEX) &&
    maybeLikeExpr.indexOf('_') >= 0
  );
};

/**
 * @param {string} maybeCodeOrLikeExpr location code or like expression
 * @return {boolean} if it it location code or not
 */
export const isBuildingCodeOrLikeExpr = (maybeCodeOrLikeExpr) => {
  return (
    isBuildingCode(maybeCodeOrLikeExpr) ||
    isBuildingLikeExpr(maybeCodeOrLikeExpr)
  );
};

/////////////////////////////////////////////////////
/////////////////// DOOR ////////////////////////////
/////////////////////////////////////////////////////
/**
 * @param {string} maybeCode code
 * @return {boolean} whether is door code
 */
const isDoorCode = (maybeCode) => {
  return !!maybeCode.match(constants.DOOR_CODE_REGEX);
};

/**
 * @param {string} maybeLikeExpr expression
 * @return {boolean} whether is door like expression
 */
const isDoorLikeExpr = (maybeLikeExpr) => {
  return (
    !!maybeLikeExpr.match(constants.DOOR_LIKE_EXPR_REGEX) &&
    maybeLikeExpr.indexOf('_') >= 0
  );
};

/**
 * @param {string} maybeCodeOrLikeExpr code or expression
 * @return {boolean} whether is door code or door like expression
 */
const isDoorCodeOrLikeExpr = (maybeCodeOrLikeExpr) => {
  return isDoorCode(maybeCodeOrLikeExpr) || isDoorLikeExpr(maybeCodeOrLikeExpr);
};

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {boolean} whether is door
 */
const isDoor = (feature) => {
  const code = feature.get('polohKod');
  return isString(code) && isDoorCode(/** @type {string}*/ (code));
};

///////////////////////////////////////////////
/////////////////// FLOOR /////////////////////
///////////////////////////////////////////////
/**
 * @param {string} maybeCode location code
 * @return {boolean} if it it location code or not
 */
const isFloorCode = (maybeCode) => {
  return !!maybeCode.match(constants.FLOOR_CODE_REGEX);
};

///////////////////////////////////////////////
////////////////// COMPLEX ////////////////////
///////////////////////////////////////////////

/**
 * @param {ol.Feature} feature feature
 * @return {boolean} whereas is feature complex
 */
const isComplex = (feature) => {
  const fType = feature.get(constants.FEATURE_TYPE_PROPERTY_NAME);
  return fType === constants.COMPLEX_TYPE;
};

///////////////////////////////////////////////
//////////////// CUSTOM MARKER ////////////////
///////////////////////////////////////////////
/**
 * @param {ol.FeatureLike} feature feature
 * @return {boolean} isCustom
 */
const isCustomMarker = (feature) => {
  const fType = feature.get(constants.FEATURE_TYPE_PROPERTY_NAME);
  return fType === constants.CUSTOM_MARKER_TYPE;
};

/**
 * True if the feature is suitable to become custom marker.
 * @param {ol.FeatureLike} feature feature
 * @return {boolean} suitability
 */
const isCustomMarkerSuitable = (feature) => {
  const geom = feature.getGeometry();
  let result = geom instanceof Point;
  if (result) {
    const proj = ol_proj.get('EPSG:4326');
    const projExtent = proj.getExtent();
    result = ol_extent.containsCoordinate(
      projExtent,
      /**@type {ol.geom.Point}*/ (geom).getCoordinates()
    );
  }
  return result;
};

///////////////////////////////////////////////
///////////////////  OPTPOI  //////////////////
///////////////////////////////////////////////

/**
 * @param {string|ol.Feature} maybeCtgUid uid
 * @return {boolean} whether is ctg uid
 */
const isOptPoiCtgUid = (maybeCtgUid) => {
  if (!isString(maybeCtgUid)) {
    return false;
  }
  maybeCtgUid = maybeCtgUid.toString();
  const parts = maybeCtgUid.split(':');
  return (
    parts.length === 2 &&
    parts[0] === constants.OPT_POI_UID_PREFIX &&
    Object.values(constants.OptPoiIds).includes(parts[1])
  );
};

///////////////////////////////////////////////
/////////////////////  POI  ///////////////////
///////////////////////////////////////////////

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {boolean} whether is feature poi
 */
const isPoi = (feature) => {
  const type = /**@type {TypeOptions}*/ (
    feature.get(constants.FEATURE_TYPE_PROPERTY_NAME)
  );
  return type === constants.POI_TYPE;
};

///////////////////////////////////////////////
//////////////////  ROOM  /////////////////////
///////////////////////////////////////////////

/**
 * @param {string} maybeCode code
 * @return {boolean} whether is room code
 */
const isRoomCode = (maybeCode) => !!maybeCode.match(constants.ROOM_CODE_REGEX);

/**
 * @param {string} maybeLikeExpr expression
 * @return {boolean} whether is room like expression
 */
const isRoomLikeExpr = (maybeLikeExpr) => {
  return (
    !!maybeLikeExpr.match(constants.ROOM_LIKE_EXPR_REGEX) &&
    maybeLikeExpr.indexOf('_') >= 0
  );
};

/**
 * @param {string} maybeCodeOrLikeExpr code or expression
 * @return {boolean} whether is room code or like expression
 */
const isRoomCodeOrLikeExpr = (maybeCodeOrLikeExpr) => {
  return isRoomCode(maybeCodeOrLikeExpr) || isRoomLikeExpr(maybeCodeOrLikeExpr);
};

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {boolean} whether is room feature
 */
const isRoom = (feature) => {
  const code = feature.get('polohKod');
  return isString(code) && isRoomCode(/** @type {string}*/ (code));
};

export {
  isBuildingCode,
  isBuildingLikeExpr,
  isComplex,
  isCustomMarker,
  isCustomMarkerSuitable,
  isDoor,
  isDoorCode,
  isDoorCodeOrLikeExpr,
  isDoorLikeExpr,
  isFloorCode,
  isOptPoiCtgUid,
  isPoi,
  isRoom,
  isRoomCode,
  isRoomCodeOrLikeExpr,
  isRoomLikeExpr,
};
