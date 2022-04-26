/**
 * @module view/_constants
 */

/**
 * @enum {string}
 */
const EventType = {
  CLICK: 'click',
};

/**
 * @type {Object<EventType, Object<string, Event>>}
 */
const EVENT_STORE = {};

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

export {EVENT_STORE, EventType, POPUP_TALE_HEIGHT, POPUP_TALE_INDENT};
