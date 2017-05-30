var munimap_ext = {
  'addDoorOpenings': function(map) {
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#999999',
        width: 1
      })
    });

    var styleFragments = {
      selectedFloorFeature: {
        filter: function(feature, selectedFloorCode, activeFloorCodes) {
          var floorCode =
              /**@type {string}*/(feature.get('polohKodPodlazi'));
          return floorCode === selectedFloorCode;
        },
        style: style
      },
      activeFloorFeature: {
        filter: function(feature, selectedFloorCode, activeFloorCodes) {
          return true;
        },
        style: null
      }
    };

    var serviceUrl = '//maps.muni.cz/arcgis/rest/services/' +
        'munimap_otevirani_dveri/MapServer/';

    var type = {
      primaryKey: 'OBJECTID',
      serviceUrl: serviceUrl,
      store: new ol.source.Vector(),
      layerId: 0,
      name: 'door-opening'
    };

    var layer = new ol.layer.Vector({
      id: 'door-opening',
      type: type,
      styleFragments: styleFragments,
      refreshStyleOnFloorChange: true,
      clearSourceOnFloorChange: true,
      source: new ol.source.Vector(),
      minResolution: 0.0,
      maxResolution: 0.13,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null
    });

    var loader = function(extent, resolution, projection) {
      var floors = munimap.floor.getActiveFloors(map);
      var where;
      if (floors.length > 0) {
        var conditions = [];
        floors.forEach(function(floor) {
          conditions.push('polohKodPodlazi LIKE \'' + floor + '%\'');
        });
        where = conditions.join(' OR ');
        var opts = {
          type: type,
          where: where,
          method: 'POST'
        };
        munimap.load.featuresForMap(opts, extent, resolution, projection)
            .then(function(doorOpenings) {
              var activeStore = layer.getSource();
              var doorOpeningsFromActiveFloors = 
                  doorOpenings.filter(function(doorOpening) {
                var floorCode = 
                    /**@type {string}*/(doorOpening.get('polohKodPodlazi'));
                return floors.indexOf(floorCode) >= 0;
              });
              var doorOpeningsToAdd = munimap.store.getNotYetAddedFeatures(
                  activeStore, doorOpeningsFromActiveFloors);
              activeStore.addFeatures(doorOpeningsToAdd);
            });
      }
    };

    var source = new ol.source.Vector({
      loader: loader,
      strategy: /** @type {ol.LoadingStrategy} */(
          ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
            tileSize: 512
          })))
    });
    layer.setSource(source);
    var layers = map.getLayers();
    layers.insertAt(4, layer);
  }
};
