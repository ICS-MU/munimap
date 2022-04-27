/**
 * @module load
 */
import * as mm_assert from '../../assert/assert.js';
import * as mm_utils from '../../utils/utils.js';
import {buildingsByCode} from './building.js';
import {doorsByCode} from './door.js';
import {getByCode as getBldgByCode} from '../../feature/building.js';
import {getGeometryCenter} from '../../utils/geom.js';
import {
  isBuildingCode,
  isBuildingCodeOrLikeExpr,
  isBuildingLikeExpr,
  isDoorCode,
  isDoorCodeOrLikeExpr,
  isDoorLikeExpr,
  isRoomCode,
  isRoomCodeOrLikeExpr,
  isRoomLikeExpr,
} from '../../feature/utils.js';
import {roomsByCode} from './room.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("../../conf.js").RequiredOptions} RequiredOptions
 * @typedef {import("../../conf.js").State} State
 */

/**
 * @param {string} targetId targetId
 * @param {Array<string>|string|undefined} paramValue zoomTo or markers
 * @return {Promise<Array<ol.Feature>>} promise of features contained
 * in server response
 */
const featuresFromParam = async (targetId, paramValue) => {
  const values = /**@type {Array.<string>}*/ (
    mm_utils.isString(paramValue) ? [paramValue] : paramValue
  );
  const firstParamValue = values[0];
  let codes;
  let likeExprs;

  if (paramValue && paramValue.length) {
    if (isBuildingCodeOrLikeExpr(firstParamValue)) {
      codes = values.filter(isBuildingCode);
      likeExprs = values.filter(isBuildingLikeExpr);
      return await buildingsByCode(targetId, {
        codes: codes,
        likeExprs: likeExprs,
      });
    } else if (
      isRoomCodeOrLikeExpr(firstParamValue) ||
      isDoorCodeOrLikeExpr(firstParamValue)
    ) {
      const codeFilterFunction = isRoomCodeOrLikeExpr(firstParamValue)
        ? isRoomCode
        : isDoorCode;
      const likeExprFilterFunction = isRoomCodeOrLikeExpr(firstParamValue)
        ? isRoomLikeExpr
        : isDoorLikeExpr;
      codes = values.filter(codeFilterFunction);
      likeExprs = values.filter(likeExprFilterFunction);
      const buildingCodes = codes.map((code) => code.substring(0, 5));
      const buildingLikeExprs = [];
      likeExprs.forEach((expr) => {
        expr = expr.substring(0, 5);
        if (isBuildingCode(expr)) {
          buildingCodes.push(expr);
        } else if (isBuildingLikeExpr(expr)) {
          buildingLikeExprs.push(expr);
        }
      });
      mm_utils.removeArrayDuplicates(buildingCodes);
      mm_utils.removeArrayDuplicates(buildingLikeExprs);
      await buildingsByCode(targetId, {
        codes: buildingCodes,
        likeExprs: buildingLikeExprs,
      });
      const loadFunction = isRoomCodeOrLikeExpr(firstParamValue)
        ? roomsByCode
        : doorsByCode;
      const features = await loadFunction(targetId, {
        codes: codes,
        likeExprs: likeExprs,
      });
      features.forEach((feature, index) => {
        if (!mm_utils.isDefAndNotNull(feature.getGeometry())) {
          const locCode = /**@type {string}*/ (feature.get('polohKod'));
          const building = getBldgByCode(targetId, locCode);
          const bldgGeom = building.getGeometry();
          if (mm_utils.isDef(bldgGeom)) {
            mm_assert.assertExists(bldgGeom);
            feature.setGeometry(getGeometryCenter(bldgGeom, true));
          }
        }
      });
      return features;
    }
  }
  return [];
};

export {featuresFromParam};
