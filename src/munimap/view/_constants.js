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

export {EVENT_STORE, EventType};
