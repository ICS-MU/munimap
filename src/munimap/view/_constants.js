import {PoiPurpose} from '../feature/_constants.js';

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

/**
 * @enum {string}
 * @const
 */
const RoomPurposesWithTooltip = {
  STAIRCASE: 'schodiště',
};

/**
 * @type {Array<string>}
 */
const GIS_PURPOSES_WITH_TOOLTIP = [PoiPurpose.CLASSROOM];

export {
  EVENT_STORE,
  EventType,
  GIS_PURPOSES_WITH_TOOLTIP,
  POPUP_TALE_HEIGHT,
  POPUP_TALE_INDENT,
  RoomPurposesWithTooltip,
};
