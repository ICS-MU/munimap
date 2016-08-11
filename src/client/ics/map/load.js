goog.provide('ics.map.load');
goog.provide('ics.map.load.floorBasedActive');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.net.XhrManager');
goog.require('jpad');
goog.require('ol.format.EsriJSON');
goog.require('ol.proj');


/**
 * @type {number}
 * @protected
 */
ics.map.load.xhrCounter = 0;


/**
 * @type {string}
 */
ics.map.load.MUNIMAP_URL = (jpad.DEV) ?
    'http://kleopatra.ics.muni.cz/arcgis/rest/services/munimap/MapServer/' :
    '//maps.muni.cz/arcgis/rest/services/munimap/MapServer/';


/**
 * @type {goog.net.XhrManager}
 * @protected
 */
ics.map.load.xhrManager = new goog.net.XhrManager();


/**
 * @type {ol.format.EsriJSON}
 * @protected
 */
ics.map.load.format = new ol.format.EsriJSON();


/**
 * @param {ics.map.load.featuresByCode.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
ics.map.load.featuresByCode = function(options) {
  goog.asserts.assert(options.type === ics.map.building.TYPE ||
      options.type === ics.map.room.TYPE, 'Feature type should be' +
      'building or room type.');

  var codes = options.codes || [];
  var likeExprs = options.likeExprs || [];

  var parts = [];
  if (codes.length) {
    var codesPart = 'polohKod in (\'' + codes.join('\',\'') + '\')';
    parts.push(codesPart);
  }
  if (likeExprs.length) {
    var likePart = 'polohKod like \'' +
        likeExprs.join('\' OR polohKod like \'') +
        '\'';
    parts.push(likePart);
  }
  if (parts.length) {
    var where = parts.join(' OR ');
  } else {
    where = '1=1';
  }
  return ics.map.load.features({
    source: options.type.store,
    type: options.type,
    where: where,
    processor: options.processor
  });
};


/**
 * @typedef {{
 *   codes: (Array<string>),
 *   likeExprs: (Array<string>),
 *   type: (ics.map.type.Options),
 *   processor: (ics.map.load.Processor|undefined)
 * }}
 */
ics.map.load.featuresByCode.Options;


/**
 * @param {ics.map.load.buildingsByCode.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
ics.map.load.buildingsByCode = function(options) {
  return ics.map.load.featuresByCode({
    codes: options.codes,
    likeExprs: options.likeExprs,
    type: ics.map.building.TYPE,
    processor: ics.map.building.load.Processor
  });
};


/**
 * @typedef {{
 *   codes: (Array<string>),
 *   likeExprs: (Array<string>)
 * }}
 */
ics.map.load.buildingsByCode.Options;


/**
 * @param {ics.map.load.roomsByCode.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
ics.map.load.roomsByCode = function(options) {
  return ics.map.load.featuresByCode({
    codes: options.codes,
    likeExprs: options.likeExprs,
    type: ics.map.room.TYPE
  });
};


/**
 * @typedef {{
 *   codes: (Array<string>),
 *   likeExprs: (Array<string>)
 * }}
 */
ics.map.load.roomsByCode.Options;


/**
 * @param {ics.map.load.featuresForMap.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
ics.map.load.featuresForMap =
    function(options, extent, resolution, projection) {
  var type = goog.isFunction(options.type) ? options.type() : options.type;
  var url = type.serviceUrl + type.layerId + '/query?';
  var params = {
    'f': 'json',
    'returnGeometry': 'true',
    'spatialRel': 'esriSpatialRelIntersects',
    'geometry': '{"xmin":' + extent[0] + ',"ymin":' +
        extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
        ',"spatialReference":{"wkid":3857}}',
    'geometryType': 'esriGeometryEnvelope',
    'inSR': '3857',
    'outFields': '*',
    'outSR': '3857',
    'where': options.where || '1=1'
  };
  var qdata = goog.Uri.QueryData.createFromMap(params);
  var isPost = options.method === 'POST';
  if (!isPost) {
    url += qdata.toString();
  }

  return ics.map.load.featuresFromUrl({
    source: type.store,
    type: type,
    url: url,
    projection: projection,
    method: options.method,
    postContent: isPost ? qdata.toString() : undefined,
    processor: options.processor
  });
};


/**
 * @typedef {{
 *   type: (ics.map.type.Options|function(): ics.map.type.Options),
 *   where: (string|undefined),
 *   method: (string|undefined),
 *   processor: (ics.map.load.Processor|undefined)
 * }}
 */
ics.map.load.featuresForMap.Options;


/**
 * @param {ics.map.load.features.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
ics.map.load.features = function(options) {
  var type = options.type;
  var url = type.serviceUrl + type.layerId + '/query?';
  goog.asserts.assert(!options.where || options.where.indexOf('"') < 0,
      'Use single quotes instead of double quotes.');
  var returnGeom = goog.isDef(options.returnGeometry) ?
      options.returnGeometry : true;
  var params = {
    'f': 'json',
    'returnGeometry': returnGeom.toString(),
    'outFields': '*',
    'outSR': '3857',
    'where': options.where || '1=1'
  };
  var qdata = goog.Uri.QueryData.createFromMap(params);
  url += qdata.toString();

  return ics.map.load.featuresFromUrl({
    source: options.source,
    type: type,
    url: url,
    method: options.method,
    processor: options.processor
  });
};


/**
 * Default projection is EPSG:3857.
 * @typedef {{
 *   source: (ol.source.Vector),
 *   type: (ics.map.type.Options),
 *   method: (string|undefined),
 *   returnGeometry: (boolean|undefined),
 *   where: (string|undefined),
 *   processor: (ics.map.load.Processor|undefined)
 * }}
 */
ics.map.load.features.Options;


/**
 * @param {Array.<string>|string|undefined} paramValue zoomTo or markers
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
ics.map.load.featuresFromParam = function(paramValue) {
  paramValue = goog.isString(paramValue) ? [paramValue] : paramValue;
  return new goog.Promise(function(resolve, reject) {
    if (paramValue && paramValue.length) {
      if (ics.map.building.isCodeOrLikeExpr(paramValue[0])) {
        var codes = paramValue.filter(ics.map.building.isCode);
        var likeExprs = paramValue.filter(ics.map.building.isLikeExpr);
        ics.map.load.buildingsByCode({
          codes: codes,
          likeExprs: likeExprs
        }).then(resolve, reject);
      } else if (ics.map.room.isCodeOrLikeExpr(paramValue[0])) {
        var codes = paramValue.filter(ics.map.room.isCode);
        var likeExprs = paramValue.filter(ics.map.room.isLikeExpr);
        var buildingCodes = codes.map(function(code) {
          return code.substr(0, 5);
        });
        var buildingLikeExprs = [];
        likeExprs.forEach(function(expr) {
          expr = expr.substr(0, 5);
          if (ics.map.building.isCode(expr)) {
            buildingCodes.push(expr);
          } else if (ics.map.building.isLikeExpr(expr)) {
            buildingLikeExprs.push(expr);
          }
        });
        goog.array.removeDuplicates(buildingCodes);
        goog.array.removeDuplicates(buildingLikeExprs);
        goog.Promise.all([
          ics.map.load.roomsByCode({
            codes: codes,
            likeExprs: likeExprs
          }),
          ics.map.load.buildingsByCode({
            codes: buildingCodes,
            likeExprs: buildingLikeExprs
          })
        ]).then(function(results) {
          resolve(results[0]);
        }, reject);
      }
    } else {
      resolve([]);
    }
  });
};


/**
 * @param {ics.map.load.featuresFromUrl.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
ics.map.load.featuresFromUrl = function(options) {
  var xhrMgr = ics.map.load.xhrManager;
  var format = ics.map.load.format;

  var source = options.source;
  var primaryKey = options.type.primaryKey;
  var url = options.url;
  var projection = options.projection || ol.proj.get('EPSG:3857');
  var method = options.method || 'GET';

  ics.map.load.xhrCounter++;

  return new goog.Promise(function(resolve, reject) {
    xhrMgr.send('load_features' + ' ' + ics.map.load.xhrCounter, url, method,
        options.postContent, undefined, undefined,
        function(evt) {
          goog.asserts.assertInstanceof(evt, goog.events.Event);
          goog.asserts.assert(evt.type === 'complete');
          var xhrio = evt.target;
          goog.asserts.assertInstanceof(xhrio, goog.net.XhrIo);
          var json = xhrio.getResponseJson();
          goog.asserts.assert(!!json);
          //console.log(json);
          // dataProjection will be read from document
          var allExistingFeatures = source.getFeatures();
          var existingLoadedFeatures = [];
          json.features = json.features.filter(function(fObject) {
            var pkValue = fObject.attributes[primaryKey];
            return !allExistingFeatures.find(function(feature) {
              var equals = feature.get(primaryKey) === pkValue;
              if (equals) {
                existingLoadedFeatures.push(feature);
              }
              return equals;
            });
          });
          var newFeatures = format.readFeatures(json, {
            featureProjection: projection
          });
          newFeatures.forEach(function(feature) {
            feature.set(ics.map.type.NAME, options.type);
          });
          var features = newFeatures.concat(existingLoadedFeatures);
          var processor = options.processor ||
              ics.map.load.DefaultProcessor;
          var procOpts = {
            all: features,
            new: newFeatures,
            existing: existingLoadedFeatures
          };
          processor(procOpts).then(function(procOptions) {
            goog.asserts.assert(procOpts === procOptions);
            goog.asserts.assert(
                goog.array.equals(procOpts.all, procOptions.all));
            goog.asserts.assert(
                goog.array.equals(procOpts.new, procOptions.new));
            goog.asserts.assert(
                goog.array.equals(procOpts.existing, procOptions.existing));
            source.addFeatures(procOptions.new);
            resolve(procOptions.all);
          });
        });
  });

};


/**
 * @typedef {{
 *   source: (ol.source.Vector),
 *   type: (ics.map.type.Options),
 *   url: string,
 *   projection: (ol.proj.Projection|undefined),
 *   method: (string|undefined),
 *   postContent: (string|undefined),
 *   processor: (ics.map.load.Processor|undefined)
 * }}
 */
ics.map.load.featuresFromUrl.Options;


/**
 * Processor must return the same options object as was the input.
 * It is not allowed to change any options arrays (all, new, existing), but
 * it can change elements of those arrays (that's why processor exists).
 * @typedef {
 * function(ics.map.load.Processor.Options):
 *   goog.Thenable<ics.map.load.Processor.Options>
 * }
 */
ics.map.load.Processor;


/**
 * Explanation of options:
 * all: features that were loaded in this request
 * new: features that were loaded in this request and are not yet in the store
 * existing: features that were loaded in this request and are already in the
 *   store
 * @typedef {{
 *   all: Array.<ol.Feature>,
 *   new: Array.<ol.Feature>,
 *   existing: Array.<ol.Feature>
 * }}
 */
ics.map.load.Processor.Options;


/**
 * @param {ics.map.load.Processor.Options} options
 * @return {goog.Thenable<ics.map.load.Processor.Options>}
 * @protected
 */
ics.map.load.DefaultProcessor = function(options) {
  return goog.Promise.resolve(options);
};


/**
 * @typedef {{
 *   floorsGetter: (function(): Array.<string>)
 * }}
 */
ics.map.load.floorBasedActive.Options;
