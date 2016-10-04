goog.provide('munimap.lang');


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
  ATTRIBUTIONS: 'ATTRIBUTIONS',
  MU_ATTRIBUTION_HTML: 'MU_ATTRIBUTION_HTML',
  OSM_ATTRIBUTION_HTML: 'OSM_ATTRIBUTION_HTML',
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
  FLOOR_MEZZANINE_UNDER_ABBR: 'FLOOR_MEZZANINE_UNDER_ABBR'
};


/**
 * Czech translations
 * @type {Object<string,string>}
 * @protected
 * @const
 */
munimap.lang.CS_TRANSLATIONS = {
  'ATTRIBUTIONS': 'Zdroje dat',
  'MU_ATTRIBUTION_HTML': '© <a href="http://www.muni.cz/?lang=cs"' +
      ' target="_blank">Masarykova univerzita</a>.',
  'OSM_ATTRIBUTION_HTML':
      '© Přispěvatelé <a href="http://www.openstreetmap.org/copyright"' +
      ' target="_blank">OpenStreetMap</a>.',
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
  'FLOOR_MEZZANINE_UNDER_ABBR': 'PP'
};


/**
 * English translations
 * @type {Object<string,string>}
 * @protected
 * @const
 */
munimap.lang.EN_TRANSLATIONS = {
  'ATTRIBUTIONS': 'Attributions',
  'MU_ATTRIBUTION_HTML': '© <a href="http://www.muni.cz/?lang=en"' +
      ' target="_blank">Masaryk University</a>.',
  'OSM_ATTRIBUTION_HTML':
      '© <a href="http://www.openstreetmap.org/copyright"' +
      ' target="_blank">OpenStreetMap</a> contributors.',
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
  'FLOOR_MEZZANINE_UNDER_ABBR': 'B'
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
