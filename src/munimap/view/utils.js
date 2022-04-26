import {EVENT_STORE} from './constants.js';

/**
 * @typedef {import("./constants.js").EventType} EventType
 */

/**
 * @param {EventType} type type
 * @param {string} targetId targetId
 * @return {Event} event
 */
const getEventByType = (type, targetId) => {
  const obj = EVENT_STORE[type];
  return obj ? obj[targetId] : undefined;
};

/**
 * @param {EventType} type type
 * @param {string} targetId targetId
 * @param {Event} event event
 */
const setEventByType = (type, targetId, event) => {
  try {
    EVENT_STORE[type][targetId] = event;
  } catch (e) {
    if (e instanceof TypeError) {
      EVENT_STORE[type] = {};
      EVENT_STORE[type][targetId] = event;
    } else {
      throw e;
    }
  }
};

export {getEventByType, setEventByType};
