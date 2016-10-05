goog.provide('example.turf');

goog.require('jpad');
goog.require('munimap');
goog.require('munimap.building');
goog.require('munimap.create');
goog.require('munimap.door');
goog.require('munimap.info');
goog.require('munimap.load');
goog.require('munimap.poi');
goog.require('munimap.room');
goog.require('ol.Map');
goog.require('ol.format.GeoJSON');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.source.OSM');
goog.require('ol.source.Vector');


/**
 * Compiled turf example
 */
example.turf.try = function() {
  var mapDiv = goog.dom.getElement('map');
  var osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
  });
  var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
  });
  var map = new ol.Map({
    layers: [
      osmLayer,
      vectorLayer
    ],
    target: mapDiv
  });

  var options = {
    codes: ['BMA01'],
    likeExprs: []
  };
  munimap.load.buildingsByCode(options).then(function(features) {
    var format = new ol.format.GeoJSON();
    var f = features[0];
    f.getGeometry().transform('EPSG:3857', 'EPSG:4326');
    var turfFeature = /**@type {GeoJSONFeature}*/
        (format.writeFeatureObject(f));
    var buffer = turf.buffer(turfFeature, 10, 'meters');
    var feature = format.readFeatures(buffer)[0];
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    vectorLayer.getSource().addFeature(feature);
    var view = new ol.View({
      center: ol.extent.getCenter(feature.getGeometry().getExtent()),
      zoom: 17
    });
    map.setView(view);
  });

};

goog.exportSymbol('main', example.turf.try);
