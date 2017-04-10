goog.provide('munimap.pubtran.stop');
goog.provide('munimap.pubtran.stop.layer');

goog.require('munimap.load');
goog.require('munimap.map');
goog.require('munimap.pubtran.stop.info');
goog.require('munimap.range');


/**
 * @type {munimap.Range}
 * @const
 */
munimap.pubtran.stop.RESOLUTION = munimap.range.createResolution(0, 2.39);


/**
 * @type {munimap.Range}
 * @const
 */
munimap.pubtran.stop.CLUSTER_RESOLUTION = 
    munimap.range.createResolution(0.6, 2.39);


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.pubtran.stop.STORE = new ol.source.Vector({
  loader: goog.partial(
      munimap.pubtran.stop.featuresForMap,
      {
        type: function() {
          return munimap.pubtran.stop.TYPE;
        }
      }
  ),
  strategy: /** @type {ol.LoadingStrategy} */(
      ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        tileSize: 512
      }))
  )
});


/**
 * @type {munimap.type.Options}
 * @const
 */
munimap.pubtran.stop.TYPE = {
  primaryKey: 'OBJECTID',
  serviceUrl: munimap.load.MUNIMAP_PUBTRAN_URL,
  store: munimap.pubtran.stop.STORE,
  layerId: 0,
  name: 'publictransport'
};


/**
 * @type {string}
 * @const
 */
munimap.pubtran.stop.LAYER_ID = 'publictransport';


/**
 * @type {ol.style.Style}
 * @const
 */
munimap.pubtran.stop.BACKGROUND_SQUARE = new ol.style.Style({
  text: new ol.style.Text({
    text: '\uf0c8',
    font: 'normal 18px MunimapFont',
    fill: new ol.style.Fill({
      color: '#666'
    })
  })
});


/**
 * @type {Array<ol.style.Style>}
 * @protected
 * @const
 */
munimap.pubtran.stop.STYLE = [
  munimap.pubtran.stop.BACKGROUND_SQUARE,
  new ol.style.Style({
    text: new ol.style.Text({
      text: '\uf207',
      font: 'normal 10px MunimapFont',
      fill: new ol.style.Fill({
        color: 'white'
      })
    })
  })
];


/**
 * @param {ol.Feature|ol.render.Feature} feature
 * @param {number} resolution
 * 
 * @return {ol.style.Style|Array<ol.style.Style>}
 */
munimap.pubtran.stop.styleFunction = function(feature, resolution) {
  var inClusterRes = munimap.range.contains(
      munimap.pubtran.stop.CLUSTER_RESOLUTION, resolution);
  if (inClusterRes) {
    var oznacnik = feature.get('oznacnik');
    if (oznacnik === '01') {
      return munimap.pubtran.stop.STYLE;
    } else {
      return null;
    }
  } else {
    return munimap.pubtran.stop.STYLE;
  }
};


/**
 * @return {ol.layer.Vector}
 */
munimap.pubtran.stop.layer.create = function() {
  return new ol.layer.Vector({
    id: munimap.pubtran.stop.LAYER_ID,
    isFeatureClickable: munimap.pubtran.stop.isClickable,
    featureClickHandler: munimap.pubtran.stop.featureClickHandler,
    type: munimap.pubtran.stop.TYPE,
    maxResolution: munimap.pubtran.stop.RESOLUTION.max,
    source: munimap.pubtran.stop.STORE,
    style: munimap.pubtran.stop.styleFunction,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    refreshStyleOnFloorChange: false,
    clearSourceOnFloorChange: false,
    redrawOnFloorChange: false,
    renderOrder: null
  });
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 * @return {boolean}
 */
munimap.pubtran.stop.isClickable = goog.functions.TRUE;


/**
 * @param {munimap.feature.clickHandlerOptions} options
 */
munimap.pubtran.stop.featureClickHandler = function(options) {
  var feature = options.feature;
  var map = options.map;

  munimap.pubtran.stop.info.show(feature, map);
};


/**
 * @param {munimap.load.featuresForMap.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
munimap.pubtran.stop.featuresForMap =
    function(options, extent, resolution, projection) {
  return munimap.load.featuresForMap(options, extent, resolution, projection).
      then(function(stops) {
        return goog.Promise.resolve(stops);
      });
};
