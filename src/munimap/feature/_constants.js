import {MUNIMAP_PUBTRAN_URL, MUNIMAP_URL} from '../conf.js';
import {createResolution} from '../utils/range.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("../utils/range.js").RangeInterface} RangeInterface
 */

/**
 * @type {string}
 * @const
 */
const FEATURE_TYPE_PROPERTY_NAME = 'featureType';

//////////////////////////////////////////////////
/////////////////// BLDG /////////////////////////
//////////////////////////////////////////////////

/**
 * @type {RegExp}
 * @protected
 */
const BUILDING_CODE_REGEX = /^[A-Z]{3}[0-9]{2}$/gi;

/**
 * @type {RegExp}
 * @protected
 */
const BUILDING_LIKE_EXPR_REGEX = /^[A-Z_]{3}[0-9_]{2}$/gi;

/**
 * @type {string}
 */
const BUILDING_LOCATION_CODE_FIELD_NAME = 'polohKod';

/**
 * @type {string}
 * @protected
 */
const BUILDING_COMPLEX_FIELD_NAME = 'areal';

/**
 * @type {string}
 */
const BUILDING_COMPLEX_ID_FIELD_NAME = 'arealId';

/**
 * @type {string}
 */
const BUILDING_UNITS_FIELD_NAME = 'pracoviste';

/**
 *
 * @type {TypeOptions}
 */
const BUILDING_TYPE = {
  primaryKey: BUILDING_LOCATION_CODE_FIELD_NAME,
  serviceUrl: MUNIMAP_URL,
  layerId: 2,
  name: 'building',
};

//////////////////////////////////////////////////
////////////////// COMPLEX ///////////////////////
//////////////////////////////////////////////////
/**
 * @type {RangeInterface}
 * @const
 */
const COMPLEX_RESOLUTION = createResolution(1.19, 4.77);

/**
 * @type {string}
 */
const COMPLEX_ID_FIELD_NAME = 'inetId';

/**
 * @type {string}
 */
const COMPLEX_UNITS_FIELD_NAME = 'pracoviste';

/**
 *
 * @type {number}
 * @protected
 */
const COMPLEX_FONT_SIZE = 13;

/**
 *
 * @type {TypeOptions}
 */
const COMPLEX_TYPE = {
  primaryKey: COMPLEX_ID_FIELD_NAME,
  serviceUrl: MUNIMAP_URL,
  layerId: 4,
  name: 'complex',
};

////////////////////////////////////////////////////
////////////////////// DOOR ////////////////////////
////////////////////////////////////////////////////
/**
 * @type {RegExp}
 */
const DOOR_CODE_REGEX = /^[A-Z]{3}[0-9]{2}[NMPSZ]{1}[0-9]{2}[D]{1}[0-9]{3}?$/gi;

/**
 * @type {RegExp}
 */
const DOOR_LIKE_EXPR_REGEX =
  /^[A-Z_]{3}[0-9_]{2}[NMPSZ_]{1}[0-9_]{2}[D_]{1}[0-9_]{3}?$/gi;

/**
 * @type {RangeInterface}
 */
const DOOR_RESOLUTION = createResolution(0, 0.13);

/**
 * @type {TypeOptions}
 */
const DOOR_TYPE = {
  primaryKey: 'pk',
  serviceUrl: MUNIMAP_URL,
  layerId: 3,
  name: 'door',
};

///////////////////////////////////////////////
/////////////////// FLOOR /////////////////////
///////////////////////////////////////////////
/**
 * @type {RegExp}
 * @protected
 */
const FLOOR_CODE_REGEX = /^[A-Z]{3}[0-9]{2}[NPMZS][0-9]{2}$/gi;

/**
 * @type {RangeInterface}
 * @const
 */
const FLOOR_RESOLUTION = createResolution(0, 0.3);

/**
 * Floor types.
 * @enum {string}
 */
const FloorTypes = {
  UNDERGROUND: 'P',
  UNDERGROUND_MEZZANINE: 'Z',
  ABOVEGROUND: 'N',
  MEZZANINE: 'M',
};

/**
 *
 * @type {TypeOptions}
 */
const FLOOR_TYPE = {
  primaryKey: 'polohKod',
  serviceUrl: MUNIMAP_URL,
  layerId: 5,
  name: 'floor',
};

///////////////////////////////////////////////
//////////////// CUSTOM MARKER ////////////////
///////////////////////////////////////////////

/**
 * @type {string}
 * @const
 */
const CUSTOM_MARKER_LABEL_FIELD_NAME = 'label';

/**
 * @type {Object<string, string>}
 * @const
 */
const CUSTOM_MARKER_TYPE = {
  name: 'custom-marker',
};

///////////////////////////////////////////////
//////////////////// MARKER ///////////////////
///////////////////////////////////////////////

/**
 * @type {RangeInterface}
 * @const
 */
const MARKER_RESOLUTION = createResolution(0, 2.39);

///////////////////////////////////////////////
//////////////////// OPTPOI ///////////////////
///////////////////////////////////////////////

/**
 * @enum {string}
 * @const
 */
const OptPoiLabels = {
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
const OptPoiIds = {
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
const OPT_POI_UID_PREFIX = 'poi.ctg';

/**
 * @type {TypeOptions}
 */
const OPT_POI_TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: MUNIMAP_URL,
  layerId: 0,
  name: 'poi',
};

///////////////////////////////////////////////
////////////////////// POI ////////////////////
///////////////////////////////////////////////

/**
 * @enum {string}
 * @const
 */
const PoiPurpose = {
  INFORMATION_POINT: 'informace',
  BUILDING_ENTRANCE: 'vstup do budovy',
  BUILDING_COMPLEX_ENTRANCE: 'vstup do areálu a budovy',
  COMPLEX_ENTRANCE: 'vstup do areálu',
  ELEVATOR: 'výtah',
  CLASSROOM: 'učebna',
  TOILET: 'WC',
  TOILET_IMMOBILE: 'WC invalidé',
  TOILET_MEN: 'WC muži',
  TOILET_WOMEN: 'WC ženy',
};

/**
 * @type {RangeInterface}
 * @const
 */
const POI_RESOLUTION = createResolution(0, 1.195);

/**
 * @type {TypeOptions}
 */
const POI_TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: MUNIMAP_URL,
  layerId: 0,
  name: 'poi',
};

///////////////////////////////////////////////
/////////////////// PUBTRAN ///////////////////
///////////////////////////////////////////////

/**
 * @type {RangeInterface}
 * @const
 */
const PUBTRAN_RESOLUTION = createResolution(0, 2.39);

/**
 * @type {RangeInterface}
 * @const
 */
const PUBTRAN_CLUSTER_RESOLUTION = createResolution(0.6, 2.39);

/**
 *
 * @type {TypeOptions}
 */
const PUBTRAN_TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: MUNIMAP_PUBTRAN_URL,
  layerId: 0,
  name: 'publictransport',
};

///////////////////////////////////////////////
///////////////////// ROOM ////////////////////
///////////////////////////////////////////////

/**
 * @enum {string}
 * @const
 */
const RoomTypes = {
  DEFAULT: 'default',
  ACTIVE: 'active',
};

/**
 * @type {RegExp}
 * @protected
 */
const ROOM_CODE_REGEX = /^[A-Z]{3}[0-9]{2}[NMPSZ]{1}[0-9]{5}[a-z]?$/gi;

/**
 * @type {RegExp}
 * @protected
 */
const ROOM_LIKE_EXPR_REGEX =
  /^[A-Z_]{3}[0-9_]{2}[NMPSZ_]{1}[0-9_]{5}[a-z_]?$/gi;

/**
 * @type {TypeOptions}
 */
const ROOM_TYPE = {
  primaryKey: 'polohKod',
  serviceUrl: MUNIMAP_URL,
  layerId: 1,
  name: 'room',
};

///////////////////////////////////////////////
//////////////////// UNIT /////////////////////
///////////////////////////////////////////////

/**
 * @type {string}
 * @protected
 */
const UNIT_PRIORITY_FIELD_NAME = 'priorita';

/**
 * @type {TypeOptions}
 */
const UNIT_TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: MUNIMAP_URL,
  layerId: 6,
  name: 'unit',
};

export {
  BUILDING_CODE_REGEX,
  BUILDING_COMPLEX_FIELD_NAME,
  BUILDING_COMPLEX_ID_FIELD_NAME,
  BUILDING_LIKE_EXPR_REGEX,
  BUILDING_LOCATION_CODE_FIELD_NAME,
  BUILDING_TYPE,
  BUILDING_UNITS_FIELD_NAME,
  COMPLEX_FONT_SIZE,
  COMPLEX_ID_FIELD_NAME,
  COMPLEX_RESOLUTION,
  COMPLEX_TYPE,
  COMPLEX_UNITS_FIELD_NAME,
  CUSTOM_MARKER_LABEL_FIELD_NAME,
  CUSTOM_MARKER_TYPE,
  DOOR_CODE_REGEX,
  DOOR_LIKE_EXPR_REGEX,
  DOOR_RESOLUTION,
  DOOR_TYPE,
  FEATURE_TYPE_PROPERTY_NAME,
  FloorTypes,
  FLOOR_CODE_REGEX,
  FLOOR_RESOLUTION,
  FLOOR_TYPE,
  MARKER_RESOLUTION,
  OPT_POI_TYPE,
  OPT_POI_UID_PREFIX,
  OptPoiIds,
  OptPoiLabels,
  PoiPurpose,
  POI_RESOLUTION,
  POI_TYPE,
  PUBTRAN_CLUSTER_RESOLUTION,
  PUBTRAN_RESOLUTION,
  PUBTRAN_TYPE,
  ROOM_CODE_REGEX,
  ROOM_LIKE_EXPR_REGEX,
  ROOM_TYPE,
  RoomTypes,
  UNIT_PRIORITY_FIELD_NAME,
  UNIT_TYPE,
};
