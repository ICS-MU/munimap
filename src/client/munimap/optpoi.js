goog.provide('munimap.optpoi');
goog.provide('munimap.optpoi.ctg');

goog.require('munimap.load');
goog.require('munimap.type');


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.optpoi.STORE = new ol.source.Vector();


/**
 * @type {munimap.type.Options}
 * @const
 */
munimap.optpoi.TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: munimap.load.MUNIMAP_URL,
  store: munimap.optpoi.STORE,
  layerId: 0,
  name: 'poi'
};


/**
 * @enum {string}
 * @const
 */
munimap.optpoi.ctg.Label = {
  PRINT_CENTER: 'Tiskové centrum',
  CREDIT_TOP_UP_MACHINE: 'Bankovník',
  RETAIL_LOCATION: 'Prodejní místo',
  LIBRARY: 'Knihovna',
  STUDY_ROOM: 'Studovna',
  VIRTUAL_TOUR: 'Virtuální prohlídka'
};


/**
 * @enum {string}
 * @const
 */
munimap.optpoi.ctg.Id = {
  PRINT_CENTER: 'print-center',
  CREDIT_TOP_UP_MACHINE: 'credit-top-up-machine',
  RETAIL_LOCATION: 'retail-location',
  LIBRARY: 'library',
  STUDY_ROOM: 'study-room',
  VIRTUAL_TOUR: 'virtual-tour'
};


/**
 * @type {string}
 * @const
 */
munimap.optpoi.ctg.UID_PREFIX = 'poi.ctg';


/**
 * @param {string} maybeCtgUid
 * @return {boolean}
 */
munimap.optpoi.isCtgUid = function(maybeCtgUid) {
  maybeCtgUid = maybeCtgUid.toString();
  var parts = maybeCtgUid.split(':');
  return parts.length === 2 &&
      parts[0] === munimap.optpoi.ctg.UID_PREFIX &&
      goog.object.containsValue(munimap.optpoi.ctg.Id, parts[1]);
};


/**
 * @param {munimap.optpoi.load.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
munimap.optpoi.load = function(options) {
  var labels = options.labels || [];
  var workplaces = options.workplaces || [];
  var ids = options.ids || [];
  var idLabels = ids.map(function(id) {
    var key = goog.object.findKey(munimap.optpoi.ctg.Id, function(v) {
      return v === id;
    });
    return munimap.optpoi.ctg.Label[key];
  });
  goog.array.extend(labels, idLabels);
  goog.array.removeDuplicates(labels);
  var where = 'typ IN (\'' + labels.join('\', \'') + '\')';
  where += ' AND volitelny=1';
  if(workplaces.length > 0) {
    where += ' AND pracoviste IN (\'' + workplaces.join('\', \'') + '\')';
  }
  var opts = {
    source: munimap.optpoi.TYPE.store,
    type: munimap.optpoi.TYPE,
    where: where,
    method: 'POST',
    returnGeometry: false
  };
  return munimap.load.features(opts);
};


/**
 * @typedef {{
 *   ids: (Array<string>|undefined),
 *   labels: (Array<string>|undefined),
 *   workplaces: (Array<number>|undefined)
 * }}
 */
munimap.optpoi.load.Options;
