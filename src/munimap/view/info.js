/**
 * @module view/info
 */
import {TARGET_ELEMENTS_STORE} from '../constants.js';

/**
 * @typedef {Object} BuildingTitleOptions
 * @property {string} bldgTitle bldgTitle
 * @property {string} complexTitle complex title
 */

/**
 * @typedef {Object} PopupPositionOptions
 * @property {boolean} hideTale hide tale
 * @property {Array<number>} [coordinate] coordinate
 * @property {Array<number>} [position] coordinate
 */

/**
 * @param {string} targetId target id
 * @param {Object} options options
 * @param {string} options.title title
 * @param {string} options.complexTitle complex title
 */
const setBuildingTitle = (targetId, {title, complexTitle}) => {
  const targetEl = TARGET_ELEMENTS_STORE[targetId];
  const infoEl = targetEl.getElementsByClassName('ol-popup munimap-info')[0];
  const complexEl = infoEl.getElementsByClassName('munimap-complex')[0];
  const bel = infoEl.getElementsByClassName('munimap-building')[0];
  complexEl.innerHTML = title;
  bel.innerHTML = complexTitle;
};

export {setBuildingTitle};
