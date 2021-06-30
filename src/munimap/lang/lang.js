/**
 * @module lang/lang
 */

/**
 * List of translations
 * @enum {string}
 */
const Translations = {
  ATTRIBUTIONS: 'ATTRIBUTIONS',
  MU_ATTRIBUTION_HTML: 'MU_ATTRIBUTION_HTML',
  OSM_ATTRIBUTION_HTML: 'OSM_ATTRIBUTION_HTML',
  MUNIMAP_ATTRIBUTION_HTML: 'MUNIMAP_ATTRIBUTION_HTML',
  PUBTRAN_ATTRIBUTION_HTML: 'PUBTRAN_ATTRIBUTION_HTML',
  ZOOM_IN: 'ZOOM_IN',
  ZOOM_OUT: 'ZOOM_OUT',
  INFOBOX_CHOOSE: 'INFOBOX_CHOOSE',
  INFOBOX_MARKED: 'INFOBOX_MARKED',
  FLOOR: 'FLOOR',
  FLOOR_ABOVE: 'FLOOR_ABOVE',
  FLOOR_ABOVE_ABBR: 'FLOOR_ABOVE_ABBR',
  FLOOR_UNDER: 'FLOOR_UNDER',
  FLOOR_UNDER_ABBR: 'FLOOR_UNDER_ABBR',
  FLOOR_MEZZANINE: 'FLOOR_MEZZANINE',
  FLOOR_MEZZANINE_ABBR: 'FLOOR_MEZZANINE_ABBR',
  FLOOR_MEZZANINE_UNDER: 'FLOOR_MEZZANINE_UNDER',
  FLOOR_MEZZANINE_UNDER_ABBR: 'FLOOR_MEZZANINE_UNDER_ABBR',
  BUILDING_ABBR_FIELD_NAME: 'BUILDING_ABBR_FIELD_NAME',
  BUILDING_TITLE_FIELD_NAME: 'BUILDING_TITLE_FIELD_NAME',
  BUILDING_TYPE_FIELD_NAME: 'BUILDING_TYPE_FIELD_NAME',
  COMPLEX_TITLE_FIELD_NAME: 'COMPLEX_TITLE_FIELD_NAME',
  ROOM_TITLE_FIELD_NAME: 'ROOM_TITLE_FIELD_NAME',
  UNIT_TITLE_FIELD_NAME: 'UNIT_TITLE_FIELD_NAME',
  UNIT_ABBR_FIELD_NAME: 'UNIT_ABBR_FIELD_NAME',
  CLUSTER_MU_LABEL: 'CLUSTER_MU_LABEL',
  FIND_CONNECTION: 'FIND_CONNECTION',
  CONNECTION_FROM: 'CONNECTION_FROM',
  CONNECTION_TO: 'CONNECTION_TO',
  BUILDING: 'BUILDING',
  ROOM: 'ROOM',
  DOOR: 'DOOR',
  LOCATION: 'LOCATION',
  PRINT_CENTER: 'print-center',
  CREDIT_TOP_UP_MACHINE: 'credit-top-up-machine',
  RETAIL_LOCATION: 'retail-location',
  LIBRARY: 'library',
  STUDY_ROOM: 'study-room',
  VIRTUAL_TOUR: 'virtual-tour',
  IT_CENTER: 'it-center',
  CANTEEN: 'canteen',
  DORMITORY: 'dormitory',
  SEZNAM_MAP: 'SEZNAM_MAP',
  GOOGLE_MAP: 'GOOGLE_MAP',
  FIND_ME: 'FIND_ME',
  ACTIVATE_MAP: 'ACTIVATE_MAP',
  LABEL_FIELD_NAME: 'LABEL_FIELD_NAME',
  NOT_FOUND: 'NOT_FOUND',
  LOADING_MAP: 'LOADING_MAP',
  FULLSCREEN: 'FULLSCREEN',
  RESET_IDENTIFICATION: 'RESET_IDENTIFICATION',
  INITIAL_EXTENT: 'INITIAL_EXTENT',
  MAP_TOOLS_OPEN: 'MAP_TOOLS_OPEN',
  MAP_TOOLS_CLOSE: 'MAP_TOOLS_CLOSE',
};

/**
 * Czech translations
 * @type {Object<string,string>}
 * @protected
 * @const
 */
const CS_TRANSLATIONS = {
  'ATTRIBUTIONS': 'Zdroje dat',
  'MU_ATTRIBUTION_HTML':
    '© <a href="http://www.muni.cz/?lang=cs"' +
    ' target="_blank">Masarykova univerzita</a>',
  'OSM_ATTRIBUTION_HTML':
    '© Přispěvatelé <a href="http://www.openstreetmap.org/copyright"' +
    ' target="_blank">OpenStreetMap</a>',
  'MUNIMAP_ATTRIBUTION_HTML':
    `<a href="//${PROD_DOMAIN}${APP_PATH}` +
    `" target="_blank" title="Mapová knihovna munimap">munimap</a>`,
  'PUBTRAN_ATTRIBUTION_HTML':
    '© <a href="http://www.idsjmk.cz/"' +
    ' target="_blank" title="Informace o umístění zastávek MHD poskytuje' +
    ' firma KORDIS JMK, a.s.">KORDIS JMK, a.s.</a>',
  'ZOOM_IN': 'Přiblížit',
  'ZOOM_OUT': 'Oddálit',
  'INFOBOX_CHOOSE': 'Vyberte',
  'INFOBOX_MARKED': 'V tomto podlaží je označen objekt.',
  'FLOOR': 'podlaží',
  'FLOOR_ABOVE': 'nadzemní podlaží',
  'FLOOR_ABOVE_ABBR': 'NP',
  'FLOOR_UNDER': 'podzemní podlaží',
  'FLOOR_UNDER_ABBR': 'PP',
  'FLOOR_MEZZANINE': 'mezonet',
  'FLOOR_MEZZANINE_ABBR': 'NP',
  'FLOOR_MEZZANINE_UNDER': 'podzemní mezonet',
  'FLOOR_MEZZANINE_UNDER_ABBR': 'PP',
  'BUILDING_ABBR_FIELD_NAME': 'oznaceni',
  'BUILDING_TITLE_FIELD_NAME': 'nazev',
  'BUILDING_TYPE_FIELD_NAME': 'budovaTyp',
  'COMPLEX_TITLE_FIELD_NAME': 'nazevPrez',
  'ROOM_TITLE_FIELD_NAME': 'nazev',
  'UNIT_TITLE_FIELD_NAME': 'nazevk_cs',
  'UNIT_ABBR_FIELD_NAME': 'zkratka_cs',
  'CLUSTER_MU_LABEL': 'Masarykova univerzita',
  'FIND_CONNECTION': 'Hledat spojení',
  'CONNECTION_FROM': 'odtud',
  'CONNECTION_TO': 'sem',
  'BUILDING': 'budova',
  'ROOM': 'místnost',
  'DOOR': 'dveře',
  'LOCATION': 'místo',
  'print-center': 'tiskové centrum',
  'credit-top-up-machine': 'bankovník',
  'retail-location': 'prodejní místo',
  'library': 'knihovna',
  'study-room': 'studovna',
  'virtual-tour': 'virtuální prohlídka',
  'it-center': 'IT centrum',
  'canteen': 'jídelna',
  'dormitory': 'kolej',
  'SEZNAM_MAP': 'Otevřít v Mapy.cz',
  'GOOGLE_MAP': 'Otevřít v Mapy Google',
  'FIND_ME': 'Moje poloha',
  'ACTIVATE_MAP': 'Klikněte na mapu pro její aktivaci',
  'LABEL_FIELD_NAME': 'nazev_cs',
  'NOT_FOUND': 'Nenalezeno',
  'LOADING_MAP': 'Načítám mapu...',
  'FULLSCREEN': 'Přepnout režim celé obrazovky',
  'RESET_IDENTIFICATION': 'Resetovat identifikaci v mapě',
  'INITIAL_EXTENT': 'Výchozí rozsah',
  'MAP_TOOLS_OPEN': 'Rozbalit další nástroje',
  'MAP_TOOLS_CLOSE': 'Sbalit nástroje',
};

/**
 * English translations
 * @type {Object<string,string>}
 * @protected
 * @const
 */
const EN_TRANSLATIONS = {
  'ATTRIBUTIONS': 'Attributions',
  'MU_ATTRIBUTION_HTML':
    '© <a href="http://www.muni.cz/?lang=en"' +
    ' target="_blank">Masaryk University</a>',
  'OSM_ATTRIBUTION_HTML':
    '© <a href="http://www.openstreetmap.org/copyright"' +
    ' target="_blank">OpenStreetMap</a> contributors',
  'MUNIMAP_ATTRIBUTION_HTML':
    `<a href="//${PROD_DOMAIN}${APP_PATH}` +
    `" target="_blank" title="munimap mapping library">munimap</a>`,
  'PUBTRAN_ATTRIBUTION_HTML':
    '© <a href="http://www.idsjmk.cz/EN/default.aspx"' +
    ' target="_blank" title="Public transport data is provided by' +
    ' KORDIS JMK, a.s. company">KORDIS JMK, a.s.</a>',
  'ZOOM_IN': 'Zoom in',
  'ZOOM_OUT': 'Zoom out',
  'INFOBOX_CHOOSE': 'Choose',
  'INFOBOX_MARKED': 'This floor has marked object.',
  'FLOOR': 'floor',
  'FLOOR_ABOVE': 'floor',
  'FLOOR_ABOVE_ABBR': 'F',
  'FLOOR_UNDER': 'basement',
  'FLOOR_UNDER_ABBR': 'B',
  'FLOOR_MEZZANINE': 'mezzanine',
  'FLOOR_MEZZANINE_ABBR': 'F',
  'FLOOR_MEZZANINE_UNDER': 'basement mezzanine',
  'FLOOR_MEZZANINE_UNDER_ABBR': 'B',
  'BUILDING_ABBR_FIELD_NAME': 'oznaceniEn',
  'BUILDING_TITLE_FIELD_NAME': 'nazevEn',
  'BUILDING_TYPE_FIELD_NAME': 'budovaTypEn',
  'COMPLEX_TITLE_FIELD_NAME': 'nazevPrezEn',
  'ROOM_TITLE_FIELD_NAME': 'nazevEn',
  'UNIT_TITLE_FIELD_NAME': 'nazevk_en',
  'UNIT_ABBR_FIELD_NAME': 'zkratka_en',
  'CLUSTER_MU_LABEL': 'Masaryk university',
  'FIND_CONNECTION': 'Find connection',
  'CONNECTION_FROM': 'from',
  'CONNECTION_TO': 'to',
  'BUILDING': 'building',
  'ROOM': 'room',
  'DOOR': 'door',
  'LOCATION': 'location',
  'print-center': 'print center',
  'credit-top-up-machine': 'credit top up machine',
  'retail-location': 'retail location',
  'library': 'library',
  'study-room': 'study room',
  'virtual-tour': 'virtual tour',
  'it-center': 'IT center',
  'canteen': 'canteen',
  'dormitory': 'dormitory',
  'SEZNAM_MAP': 'Open in Mapy.cz',
  'GOOGLE_MAP': 'Open in Google map',
  'FIND_ME': 'My location',
  'ACTIVATE_MAP': 'Click on the map to activate it',
  'LABEL_FIELD_NAME': 'nazev_en',
  'NOT_FOUND': 'Not found',
  'LOADING_MAP': 'Loading map...',
  'FULLSCREEN': 'Toggle fullscreen',
  'RESET_IDENTIFICATION': 'Reset identification on the map',
  'INITIAL_EXTENT': 'Initial extent',
  'MAP_TOOLS_OPEN': 'More map tools',
  'MAP_TOOLS_CLOSE': 'Close map tools',
};

/**
 *
 * @enum {string}
 */
const Abbr = {
  CZECH: 'cs',
  ENGLISH: 'en',
};

/**
 *
 * @param {string} str string
 * @param {string} lang language
 * @return {string} stranslated string
 */
const getMsg = (str, lang) => {
  let translation;
  switch (lang) {
    case Abbr.CZECH:
      translation = CS_TRANSLATIONS[str];
      break;
    case Abbr.ENGLISH:
      translation = EN_TRANSLATIONS[str];
      break;
    default:
      throw Error('Unsupported language.');
  }
  translation = translation || str;
  return translation;
};

export {CS_TRANSLATIONS, EN_TRANSLATIONS, Abbr, Translations, getMsg};
