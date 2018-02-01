goog.provide('munimap.load');
goog.provide('munimap.load.floorBasedActive');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.net.XhrManager');
goog.require('jpad');


/**
 * @type {number}
 * @protected
 */
munimap.load.xhrCounter = 0;


/**
 * @type {string}
 */
<<<<<<< HEAD
munimap.load.MUNIMAP_URL =
    '//maps.muni.cz/arcgis/rest/services/munimap/MapServer/';


/**
=======
munimap.load.MUNIMAP_URL = (jpad.DEV) ?
    'http://kleopatra.ics.muni.cz/arcgis/rest/services/munimap/MapServer/' :
    '//maps.muni.cz/arcgis/rest/services/munimap/MapServer/';


/**
 * @type {string}
 */
munimap.load.MUNIMAP_PUBTRAN_URL = (jpad.DEV) ?
    'http://kleopatra.ics.muni.cz/arcgis/rest/services/munimap_mhd/MapServer/' :
    '//maps.muni.cz/arcgis/rest/services/munimap_mhd/MapServer/';


/**
>>>>>>> 0f3ae86... fixed bubble position, fixed code style, link renamed to mapLinks
 * @type {goog.net.XhrManager}
 * @protected
 */
munimap.load.xhrManager = new goog.net.XhrManager();


/**
 * @type {ol.format.EsriJSON}
 * @protected
 */
munimap.load.format = new ol.format.EsriJSON();


/**
 * @param {munimap.load.featuresByCode.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
munimap.load.featuresByCode = function(options) {
  goog.asserts.assert(options.type === munimap.building.TYPE ||
      options.type === munimap.room.TYPE ||
      options.type === munimap.door.TYPE, 'Feature type should be' +
      ' building, room or door type.');

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
  return munimap.load.features({
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
 *   type: (munimap.type.Options),
 *   processor: (munimap.load.Processor|undefined)
 * }}
 */
munimap.load.featuresByCode.Options;


/**
 * @param {munimap.load.buildingsByCode.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
munimap.load.buildingsByCode = function(options) {
  return munimap.load.featuresByCode({
    codes: options.codes,
    likeExprs: options.likeExprs,
    type: munimap.building.TYPE,
    processor: munimap.building.load.processor
  });
};


/**
 * @typedef {{
 *   codes: (Array<string>),
 *   likeExprs: (Array<string>)
 * }}
 */
munimap.load.buildingsByCode.Options;


/**
 * @param {munimap.load.roomsByCode.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
munimap.load.roomsByCode = function(options) {
  return munimap.load.featuresByCode({
    codes: options.codes,
    likeExprs: options.likeExprs,
    type: munimap.room.TYPE
  });
};


/**
 * @typedef {{
 *   codes: (Array<string>),
 *   likeExprs: (Array<string>)
 * }}
 */
munimap.load.roomsByCode.Options;


/**
 * @param {munimap.load.doorsByCode.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
munimap.load.doorsByCode = function(options) {
  return munimap.load.featuresByCode({
    codes: options.codes,
    likeExprs: options.likeExprs,
    type: munimap.door.TYPE
  });
};


/**
 * @typedef {{
 *   codes: (Array<string>),
 *   likeExprs: (Array<string>)
 * }}
 */
munimap.load.doorsByCode.Options;


/**
 * @param {munimap.load.featuresForMap.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
munimap.load.featuresForMap =
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
    //'geometryPrecision': 2,
    'where': options.where || '1=1'
  };
  var qdata = goog.Uri.QueryData.createFromMap(params);
  var isPost = options.method === 'POST';
  if (!isPost) {
    url += qdata.toString();
  }

  return munimap.load.featuresFromUrl({
    source: type.store,
    type: type,
    url: url,
    projection: projection,
    method: options.method,
    postContent: isPost ? qdata.toString() : undefined,
    processor: options.processor,
    newProcessedFeatures:
        munimap.load.ProcessorCache.getNewProcessedFeatures(type)
  });
};


/**
 * @typedef {{
 *   type: (munimap.type.Options|function(): munimap.type.Options),
 *   where: (string|undefined),
 *   method: (string|undefined),
 *   processor: (munimap.load.Processor|undefined)
 * }}
 */
munimap.load.featuresForMap.Options;


/**
 * @param {munimap.load.features.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
munimap.load.features = function(options) {
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
    //'geometryPrecision': 2,
    'where': options.where || '1=1'
  };
  var qdata = goog.Uri.QueryData.createFromMap(params);
  var isPost = options.method === 'POST';
  if (!isPost) {
    url += qdata.toString();
  }

  return munimap.load.featuresFromUrl({
    source: options.source,
    type: type,
    url: url,
    method: options.method,
    postContent: isPost ? qdata.toString() : undefined,
    processor: options.processor,
    newProcessedFeatures:
        munimap.load.ProcessorCache.getNewProcessedFeatures(type)
  });
};


/**
 * Default projection is EPSG:3857.
 * @typedef {{
 *   source: (ol.source.Vector),
 *   type: (munimap.type.Options),
 *   method: (string|undefined),
 *   returnGeometry: (boolean|undefined),
 *   where: (string|undefined),
 *   processor: (munimap.load.Processor|undefined)
 * }}
 */
munimap.load.features.Options;


/**
 * @param {Array.<string>|string|undefined} paramValue zoomTo or markers
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 */
munimap.load.featuresFromParam = function(paramValue) {
  paramValue = goog.isString(paramValue) ? [paramValue] : paramValue;
  return new goog.Promise(function(resolve, reject) {
    if (paramValue && paramValue.length) {
      var firstParamValue = paramValue[0];
      if (munimap.building.isCodeOrLikeExpr(firstParamValue)) {
        var codes = paramValue.filter(munimap.building.isCode);
        var likeExprs = paramValue.filter(munimap.building.isLikeExpr);
        munimap.load.buildingsByCode({
          codes: codes,
          likeExprs: likeExprs
        }).then(resolve, reject);
      } else if (munimap.room.isCodeOrLikeExpr(firstParamValue) ||
          munimap.door.isCodeOrLikeExpr(firstParamValue)) {
        var codeFilterFunction =
            (munimap.room.isCodeOrLikeExpr(firstParamValue)) ?
            munimap.room.isCode : munimap.door.isCode;
        var likeExprFilterFunction =
            (munimap.room.isCodeOrLikeExpr(firstParamValue)) ?
            munimap.room.isLikeExpr : munimap.door.isLikeExpr;
        var codes = paramValue.filter(codeFilterFunction);
        var likeExprs = paramValue.filter(likeExprFilterFunction);
        var buildingCodes = codes.map(function(code) {
          return code.substr(0, 5);
        });
        var buildingLikeExprs = [];
        likeExprs.forEach(function(expr) {
          expr = expr.substr(0, 5);
          if (munimap.building.isCode(expr)) {
            buildingCodes.push(expr);
          } else if (munimap.building.isLikeExpr(expr)) {
            buildingLikeExprs.push(expr);
          }
        });
        goog.array.removeDuplicates(buildingCodes);
        goog.array.removeDuplicates(buildingLikeExprs);
        munimap.load.buildingsByCode({
          codes: buildingCodes,
          likeExprs: buildingLikeExprs
        }).then(function(buildings) {
          var loadFunction = (munimap.room.isCodeOrLikeExpr(firstParamValue)) ?
              munimap.load.roomsByCode : munimap.load.doorsByCode;
          return loadFunction({
            codes: codes,
            likeExprs: likeExprs
          }).then(function(features) {
            features.forEach(function(feature) {
              if (!goog.isDefAndNotNull(feature.getGeometry())) {
                var locCode = /**@type (string)*/ (feature.get('polohKod'));
                var building = munimap.building.getByCode(locCode);
                var bldgGeom = building.getGeometry();
                if (goog.isDef(bldgGeom)) {
                  feature.setGeometry(
                      munimap.geom.getGeometryCenter(bldgGeom, true));
                }
              }
            });
            return features;
          });
        }).then(function(results) {
          resolve(results);
        }, reject);
      }
    } else {
      resolve([]);
    }
  });
};


/**
 * @param {munimap.load.featuresFromUrl.Options} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @protected
 */
munimap.load.featuresFromUrl = function(options) {
  var xhrMgr = munimap.load.xhrManager;
  var format = munimap.load.format;

  var source = options.source;
  var primaryKey = options.type.primaryKey;
  var url = options.url;
  var projection = options.projection || ol.proj.get('EPSG:3857');
  var method = options.method || 'GET';

  munimap.load.xhrCounter++;

  return new goog.Promise(function(resolve, reject) {
    xhrMgr.send('load_features' + ' ' + munimap.load.xhrCounter, url, method,
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
          var allStoredFeatures = source.getFeatures();
          var loadedStoredFeatures = [];
          json.features = json.features.filter(function(fObject) {
            var pkValue = fObject.attributes[primaryKey];
            return !allStoredFeatures.find(function(feature) {
              var equals = feature.get(primaryKey) === pkValue;
              if (equals) {
                loadedStoredFeatures.push(feature);
              }
              return equals;
            });
          });
          var allNewProcessedFeatures = options.newProcessedFeatures || [];
          var loadedNewProcessedFeatures = [];
          json.features = json.features.filter(function(fObject) {
            var pkValue = fObject.attributes[primaryKey];
            return !allNewProcessedFeatures.find(function(feature) {
              var equals = feature.get(primaryKey) === pkValue;
              if (equals) {
                loadedNewProcessedFeatures.push(feature);
              }
              return equals;
            });
          });
          var newLoadedFeatures = format.readFeatures(json, {
            featureProjection: projection,
            extent: null
          });
          newLoadedFeatures.forEach(function(feature) {
            feature.set(munimap.type.NAME, options.type);
          });
          goog.array.extend(allNewProcessedFeatures, newLoadedFeatures);
          munimap.load.waitForNewProcessedFeatures({
            source: source,
            loadedNewProcessedFeatures: loadedNewProcessedFeatures
          }).then(function() {
            var allLoadedFeatures =
            newLoadedFeatures.concat(loadedStoredFeatures,
            loadedNewProcessedFeatures);
            var processor = options.processor ||
            munimap.load.defaultProcessor;
            var procOpts = {
              all: allLoadedFeatures,
              new: newLoadedFeatures,
              existing: loadedStoredFeatures.concat(loadedNewProcessedFeatures)
            };
            return processor(procOpts);
          }).then(function(procOptions) {
            goog.array.removeAllIf(allNewProcessedFeatures, function(f) {
              return goog.array.contains(newLoadedFeatures, f);
            });
            source.addFeatures(procOptions.new);
            resolve(procOptions.all);
          });
        });
  });

};


/**
 * @typedef {{
 *   source: (ol.source.Vector),
 *   type: (munimap.type.Options),
 *   url: string,
 *   projection: (ol.proj.Projection|undefined),
 *   method: (string|undefined),
 *   postContent: (string|undefined),
 *   processor: (munimap.load.Processor|undefined),
 *   newProcessedFeatures: (Array<ol.Feature>|undefined)
 * }}
 */
munimap.load.featuresFromUrl.Options;


/**
 * @param {munimap.load.waitForNewProcessedFeatures.Options} options
 * @return {goog.Thenable<boolean>}
 * @protected
 */
munimap.load.waitForNewProcessedFeatures = function(options) {
  var loadedNewProcessedFeatures = options.loadedNewProcessedFeatures.concat();
  if (!loadedNewProcessedFeatures.length) {
    return goog.Promise.resolve(true);
  }
  return new goog.Promise(function(resolve, reject) {
    var source = options.source;
    /**
     * @param {ol.source.Vector.Event} evt
     */
    var addFeatureHandler = function(evt) {
      var feature = evt.feature;
      goog.array.remove(loadedNewProcessedFeatures, feature);
      if (!loadedNewProcessedFeatures.length) {
        source.un('addfeature', addFeatureHandler);
        resolve(true);
      }
    };
    source.on('addfeature', addFeatureHandler);
  });
};


/**
 * @typedef {{
 *   source: (ol.source.Vector),
 *   loadedNewProcessedFeatures: (Array<ol.Feature>)
 * }}
 */
munimap.load.waitForNewProcessedFeatures.Options;


/**
 * Processor must return the same options object as was the input.
 * It is not allowed to change any options arrays (all, new, existing), but
 * it can change elements of those arrays (that's why processor exists).
 * @typedef {
 * function(munimap.load.Processor.Options):
 *   goog.Thenable<munimap.load.Processor.Options>
 * }
 */
munimap.load.Processor;


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
munimap.load.Processor.Options;


/**
 * newProcessedFeatures: Cache of new features that are currently being
 * processed, but are not yet stored in the store.
 * @type {Array<{
 *   type: munimap.type.Options,
 *   newProcessedFeatures: Array<ol.Feature>
 * }>}
 * @protected
 */
munimap.load.ProcessorCache = [];


/**
 * @param {munimap.type.Options} type
 * @return {Array<ol.Feature>}
 * @protected
 */
munimap.load.ProcessorCache.getNewProcessedFeatures = function(type) {
  var cache = munimap.load.ProcessorCache.find(function(c) {
    return c.type === type;
  });
  if (!cache) {
    cache = {
      type: type,
      newProcessedFeatures: []
    };
    munimap.load.ProcessorCache.push(cache);
  }
  return cache.newProcessedFeatures;
};


/**
 * @param {munimap.load.Processor.Options} options
 * @return {goog.Thenable<munimap.load.Processor.Options>}
 * @protected
 */
munimap.load.defaultProcessor = function(options) {
  return goog.Promise.resolve(options);
};


/**
 * @typedef {{
 *   map: (ol.Map)
 * }}
 */
munimap.load.floorBasedActive.Options;
