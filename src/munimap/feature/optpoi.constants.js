import {MUNIMAP_URL} from '../conf.js';
import {isString} from '../utils/utils.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 */

/**
 * @enum {string}
 * @const
 */
const Labels = {
  PRINT_CENTER: 'Tiskové centrum',
  CREDIT_TOP_UP_MACHINE: 'Bankovník',
  RETAIL_LOCATION: 'Prodejní místo',
  LIBRARY: 'Knihovna',
  STUDY_ROOM: 'Studovna',
  VIRTUAL_TOUR: 'Virtuální prohlídka',
  IT_CENTER: 'Centrum informačních technologií',
  CANTEEN: 'Jídelna',
  DORMITORY: 'Kolej',
};

/**
 * @enum {string}
 * @const
 */
const Ids = {
  PRINT_CENTER: 'print-center',
  CREDIT_TOP_UP_MACHINE: 'credit-top-up-machine',
  RETAIL_LOCATION: 'retail-location',
  LIBRARY: 'library',
  STUDY_ROOM: 'study-room',
  VIRTUAL_TOUR: 'virtual-tour',
  IT_CENTER: 'it-center',
  CANTEEN: 'canteen',
  DORMITORY: 'dormitory',
};

/**
 * @type {string}
 * @const
 */
const UID_PREFIX = 'poi.ctg';

/**
 * @type {TypeOptions}
 */
let TYPE;

/**
 * @return {TypeOptions} type
 */
const getType = () => {
  if (!TYPE) {
    TYPE = {
      primaryKey: 'OBJECTID',
      serviceUrl: MUNIMAP_URL,
      layerId: 0,
      name: 'poi',
    };
  }
  return TYPE;
};

/**
 * @param {string|ol.Feature} maybeCtgUid uid
 * @return {boolean} whether is ctg uid
 */
const isCtgUid = (maybeCtgUid) => {
  if (!isString(maybeCtgUid)) {
    return false;
  }
  maybeCtgUid = maybeCtgUid.toString();
  const parts = maybeCtgUid.split(':');
  return (
    parts.length === 2 &&
    parts[0] === UID_PREFIX &&
    Object.values(Ids).includes(parts[1])
  );
};

export {Ids, Labels, UID_PREFIX, getType, isCtgUid};
