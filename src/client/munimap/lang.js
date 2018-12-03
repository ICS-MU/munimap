goog.provide('munimap.lang');

goog.require('jpad');


/**
 * Language of the application
 * @type {string}
 */
munimap.lang.active;


/**
 * List of translations
 * @enum {string}
 */
munimap.lang.Translations = {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 5450bff... fix code style
  ATTRIBUTIONS: 'ATTRIBUTIONS',
  MU_ATTRIBUTION_HTML: 'MU_ATTRIBUTION_HTML',
  OSM_ATTRIBUTION_HTML: 'OSM_ATTRIBUTION_HTML',
  MUNIMAP_ATTRIBUTION_HTML: 'MUNIMAP_ATTRIBUTION_HTML',
<<<<<<< HEAD
=======
  PUBTRAN_ATTRIBUTION_HTML: 'PUBTRAN_ATTRIBUTION_HTML',
>>>>>>> 5450bff... fix code style
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
<<<<<<< HEAD
<<<<<<< HEAD
  CLUSTER_MU_LABEL: 'CLUSTER_MU_LABEL'
=======
=======
>>>>>>> 5450bff... fix code style
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
<<<<<<< HEAD
  RETAIL_LOCATION: 'retail-location'
>>>>>>> 52f4ba7... Improve labels of optional POIs, add multilinguality
=======
    ATTRIBUTIONS: 'ATTRIBUTIONS',
    MU_ATTRIBUTION_HTML: 'MU_ATTRIBUTION_HTML',
    OSM_ATTRIBUTION_HTML: 'OSM_ATTRIBUTION_HTML',
    MUNIMAP_ATTRIBUTION_HTML: 'MUNIMAP_ATTRIBUTION_HTML',
    PUBTRAN_ATTRIBUTION_HTML: 'PUBTRAN_ATTRIBUTION_HTML',
    ZOOM_IN: 'ZOOM_IN',
    ZOOM_OUT: 'ZOOM_OUT',
    INFOBOX_CHOOSE: 'INFOBOX_CHOOSE',
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
    SEZNAM_MAP: 'SEZNAM_MAP',
    GOOGLE_MAP: 'GOOGLE_MAP'
>>>>>>> 0f3ae86... fixed bubble position, fixed code style, link renamed to mapLinks
=======
  RETAIL_LOCATION: 'retail-location',
  LIBRARY: 'library',
  STUDY_ROOM: 'study-room',
  VIRTUAL_TOUR: 'virtual-tour',
  SEZNAM_MAP: 'SEZNAM_MAP',
<<<<<<< HEAD
  GOOGLE_MAP: 'GOOGLE_MAP'
>>>>>>> 5450bff... fix code style
=======
  GOOGLE_MAP: 'GOOGLE_MAP',
<<<<<<< HEAD
  FIND_ME: 'FIND_ME'
>>>>>>> f9478df... added geolocation control to the map
=======
  FIND_ME: 'FIND_ME',
<<<<<<< HEAD
  SCROLL_HINT: 'SCROLL_HINT'
>>>>>>> eac6dbc... simpleScroll hint
=======
  SCROLL_HINT: 'SCROLL_HINT',
<<<<<<< HEAD
  LABEL_FIELD_NAME: 'LABEL_FIELD_NAME',
>>>>>>> 51534a8... added it center poi
=======
  LABEL_FIELD_NAME: 'LABEL_FIELD_NAME'
>>>>>>> 84d1e38... fixlint
};


/**
 * Czech translations
 * @type {Object<string,string>}
 * @protected
 * @const
 */
munimap.lang.CS_TRANSLATIONS = {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 5450bff... fix code style
  'ATTRIBUTIONS': 'Zdroje dat',
  'MU_ATTRIBUTION_HTML': '© <a href="http://www.muni.cz/?lang=cs"' +
      ' target="_blank">Masarykova univerzita</a>',
  'OSM_ATTRIBUTION_HTML':
      '© Přispěvatelé <a href="http://www.openstreetmap.org/copyright"' +
      ' target="_blank">OpenStreetMap</a>',
  'MUNIMAP_ATTRIBUTION_HTML': '<a href="//' + jpad.PROD_DOMAIN + jpad.APP_PATH +
      '" target="_blank" title="Mapová knihovna munimap">munimap</a>',
<<<<<<< HEAD
=======
  'PUBTRAN_ATTRIBUTION_HTML': '© <a href="http://www.idsjmk.cz/"' +
      ' target="_blank" title="Informace o umístění zastávek MHD poskytuje' +
      ' firma KORDIS JMK, a.s.">KORDIS JMK, a.s.</a>',
>>>>>>> 5450bff... fix code style
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
<<<<<<< HEAD
<<<<<<< HEAD
  'CLUSTER_MU_LABEL': 'Masarykova univerzita'
=======
=======
>>>>>>> 5450bff... fix code style
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
<<<<<<< HEAD
  'retail-location': 'prodejní místo'
>>>>>>> 52f4ba7... Improve labels of optional POIs, add multilinguality
=======
    'ATTRIBUTIONS': 'Zdroje dat',
    'MU_ATTRIBUTION_HTML': '© <a href="http://www.muni.cz/?lang=cs"' +
        ' target="_blank">Masarykova univerzita</a>',
    'OSM_ATTRIBUTION_HTML':
        '© Přispěvatelé <a href="http://www.openstreetmap.org/copyright"' +
        ' target="_blank">OpenStreetMap</a>',
    'MUNIMAP_ATTRIBUTION_HTML': '<a href="//' + jpad.PROD_DOMAIN + jpad.APP_PATH +
        '" target="_blank" title="Mapová knihovna munimap">munimap</a>',
    'PUBTRAN_ATTRIBUTION_HTML': '© <a href="http://www.idsjmk.cz/"' +
        ' target="_blank" title="Informace o umístění zastávek MHD poskytuje' +
        ' firma KORDIS JMK, a.s.">KORDIS JMK, a.s.</a>',
    'ZOOM_IN': 'Přiblížit',
    'ZOOM_OUT': 'Oddálit',
    'INFOBOX_CHOOSE': 'Vyberte',
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
    'SEZNAM_MAP': 'Otevřít v Mapy.cz',
    'GOOGLE_MAP': 'Otevřít v Mapy Google'
>>>>>>> 0f3ae86... fixed bubble position, fixed code style, link renamed to mapLinks
=======
  'retail-location': 'prodejní místo',
  'library': 'knihovna',
  'study-room': 'studovna',
  'virtual-tour': 'virtuální prohlídka',
  'it-center': 'IT centrum',
  'SEZNAM_MAP': 'Otevřít v Mapy.cz',
<<<<<<< HEAD
  'GOOGLE_MAP': 'Otevřít v Mapy Google'
>>>>>>> 5450bff... fix code style
=======
  'GOOGLE_MAP': 'Otevřít v Mapy Google',
<<<<<<< HEAD
  'FIND_ME': 'Moje poloha'
>>>>>>> f9478df... added geolocation control to the map
=======
  'FIND_ME': 'Moje poloha',
<<<<<<< HEAD
  'SCROLL_HINT': 'Klikněte na mapu\npro její aktivaci'
>>>>>>> eac6dbc... simpleScroll hint
=======
  'SCROLL_HINT': 'Klikněte na mapu\npro její aktivaci',
<<<<<<< HEAD
  'LABEL_FIELD_NAME': 'nazev_cs',
>>>>>>> 51534a8... added it center poi
=======
  'LABEL_FIELD_NAME': 'nazev_cs'
>>>>>>> 84d1e38... fixlint
};


/**
 * English translations
 * @type {Object<string,string>}
 * @protected
 * @const
 */
munimap.lang.EN_TRANSLATIONS = {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 5450bff... fix code style
  'ATTRIBUTIONS': 'Attributions',
  'MU_ATTRIBUTION_HTML': '© <a href="http://www.muni.cz/?lang=en"' +
      ' target="_blank">Masaryk University</a>',
  'OSM_ATTRIBUTION_HTML':
      '© <a href="http://www.openstreetmap.org/copyright"' +
      ' target="_blank">OpenStreetMap</a> contributors',
  'MUNIMAP_ATTRIBUTION_HTML': '<a href="//' + jpad.PROD_DOMAIN + jpad.APP_PATH +
      '" target="_blank" title="munimap mapping library">munimap</a>',
<<<<<<< HEAD
=======
  'PUBTRAN_ATTRIBUTION_HTML':
      '© <a href="http://www.idsjmk.cz/EN/default.aspx"' +
      ' target="_blank" title="Public transport data is provided by' +
      ' KORDIS JMK, a.s. company">KORDIS JMK, a.s.</a>',
>>>>>>> 5450bff... fix code style
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
<<<<<<< HEAD
<<<<<<< HEAD
  'CLUSTER_MU_LABEL': 'Masaryk university'
=======
=======
>>>>>>> 5450bff... fix code style
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
<<<<<<< HEAD
  'retail-location': 'retail location'
>>>>>>> 52f4ba7... Improve labels of optional POIs, add multilinguality
=======
    'ATTRIBUTIONS': 'Attributions',
    'MU_ATTRIBUTION_HTML': '© <a href="http://www.muni.cz/?lang=en"' +
        ' target="_blank">Masaryk University</a>',
    'OSM_ATTRIBUTION_HTML':
        '© <a href="http://www.openstreetmap.org/copyright"' +
        ' target="_blank">OpenStreetMap</a> contributors',
    'MUNIMAP_ATTRIBUTION_HTML': '<a href="//' + jpad.PROD_DOMAIN + jpad.APP_PATH +
        '" target="_blank" title="munimap mapping library">munimap</a>',
    'PUBTRAN_ATTRIBUTION_HTML':
        '© <a href="http://www.idsjmk.cz/EN/default.aspx"' +
        ' target="_blank" title="Public transport data is provided by' +
        ' KORDIS JMK, a.s. company">KORDIS JMK, a.s.</a>',
    'ZOOM_IN': 'Zoom in',
    'ZOOM_OUT': 'Zoom out',
    'INFOBOX_CHOOSE': 'Choose',
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
    'SEZNAM_MAP': 'Open in Mapy.cz',
    'GOOGLE_MAP': 'Open in Google map'
>>>>>>> 0f3ae86... fixed bubble position, fixed code style, link renamed to mapLinks
=======
  'retail-location': 'retail location',
  'library': 'library',
  'study-room': 'study room',
  'virtual-tour': 'virtual tour',
  'it-center': 'IT center',
  'SEZNAM_MAP': 'Open in Mapy.cz',
<<<<<<< HEAD
  'GOOGLE_MAP': 'Open in Google map'
>>>>>>> 5450bff... fix code style
=======
  'GOOGLE_MAP': 'Open in Google map',
<<<<<<< HEAD
  'FIND_ME': 'My location'
>>>>>>> f9478df... added geolocation control to the map
=======
  'FIND_ME': 'My location',
<<<<<<< HEAD
  'SCROLL_HINT': 'Click on the map\nto activate it'
>>>>>>> eac6dbc... simpleScroll hint
=======
  'SCROLL_HINT': 'Click on the map\nto activate it',
<<<<<<< HEAD
  'LABEL_FIELD_NAME': 'nazev_en',
>>>>>>> 51534a8... added it center poi
=======
  'LABEL_FIELD_NAME': 'nazev_en'
>>>>>>> 84d1e38... fixlint
};


/**
 *
 * @enum {string}
 */
munimap.lang.Abbr = {
  CZECH: 'cs',
  ENGLISH: 'en'
};


/**
 *
 * @param {string} str
 * @return {string} stranslated string
 */
munimap.lang.getMsg = function(str) {
  var translation;
  switch (munimap.lang.active) {
    case munimap.lang.Abbr.CZECH:
      translation = munimap.lang.CS_TRANSLATIONS[str];
      break;
    case munimap.lang.Abbr.ENGLISH:
      translation = munimap.lang.EN_TRANSLATIONS[str];
      break;
  }
  translation = translation || str;
  return translation;
};
