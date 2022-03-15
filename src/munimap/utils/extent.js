/**
 * @module utils/extent
 */

import * as ol_extent from 'ol/extent';
import {Feature} from 'ol';
import {Point} from 'ol/geom';
import {assertExists} from '../assert/assert.js';
import {getByCode as getBuildingByCode} from '../feature/building.js';
import {isRoom} from '../feature/_constants.functions.js';

/**
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 * @typedef {import("ol/extent").Extent} ol.Extent
 */

/**
 * @type {number}
 * @const
 * @protected
 */
const EXTENT_RATIO = 0.8;

/**
 * @param {ol.Extent} extent extent
 * @return {number} value
 */
export const getBufferValue = (extent) => {
  const width = ol_extent.getWidth(extent);
  const height = ol_extent.getHeight(extent);
  const shorterSide = width <= height ? width : height;
  return -((1 - EXTENT_RATIO) * shorterSide);
};

/**
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @return {ol.Extent} extent
 */
export const ofFeature = (feature) => {
  if (feature instanceof Feature) {
    const geom = feature.getGeometry();
    if (geom) {
      return geom.getExtent();
    } else {
      return ol_extent.createEmpty();
    }
  } else {
    return feature.getExtent();
  }
};

/**
 * @param {Array<ol.Feature>} features features
 * @param {string} [opt_targetId] targetId
 * @return {ol_extent.Extent} extent
 */
export const ofFeatures = (features, opt_targetId) => {
  const extent = ol_extent.createEmpty();
  features.forEach((feature) => {
    const geom = feature.getGeometry();
    let ext;
    if (geom) {
      if (isRoom(feature) && geom instanceof Point) {
        //fictive room
        assertExists(opt_targetId, 'TargetId must be defined.');
        const locCode = /**@type {string}*/ (feature.get('polohKod'));
        const building = getBuildingByCode(opt_targetId, locCode);
        ext = building.getGeometry().getExtent();
      } else {
        ext = geom.getExtent();
      }
    }

    if (ext) {
      ol_extent.extend(extent, ext);
    }
  });
  return extent;
};
