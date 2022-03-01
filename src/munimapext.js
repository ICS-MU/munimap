/* eslint-disable no-var,no-unused-vars*/

/**
 * MUST BE IE11 COMPATIBILE!
 */
const munimap_ext = {
  'addDoorOpenings': function (options) {
    var map = options.map;
    var store = options.store;

    var style = new munimap.ol.style.Style({
      stroke: new munimap.ol.style.Stroke({
        color: '#999999',
        width: 1
      }),
    });

    var getStyleForLayer = munimap.slctr.createSelector(
      [munimap.slctr.getSelectedFloorCode],
      function (selectedFloorCode) {
        var styleFce = function (feature, res) {
          var isSelected =
            feature.get('polohKodPodlazi') &&
            feature.get('polohKodPodlazi') === selectedFloorCode;
          if (isSelected) {
            return style;
          }
          return null;
        };
        return styleFce;
      }
    );

    var serviceUrl =
      '//maps.muni.cz/arcgis/rest/services/munimap_otevirani_dveri/MapServer/';

    var type = {
      primaryKey: 'OBJECTID',
      serviceUrl: serviceUrl,
      layerId: 0,
      name: 'door-opening'
    };

    var source = new munimap.ol.source.Vector({
      strategy: munimap.ol.loadingstrategy.tile(
        munimap.ol.tilegrid.createXYZ({
          tileSize: 512
        })
      ),
    });

    var getStore = function () {
      return source;
    };

    var layer = new munimap.ol.layer.Vector({
      id: 'door-opening',
      type: type,
      source: getStore(),
      minResolution: 0.0,
      maxResolution: 0.13,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: null,
      style: getStyleForLayer(store.getState())
    });

    var loader = function (extent, resolution, projection) {
      var floors = munimap.slctr.getActiveFloorCodes(store.getState());
      let where;
      if (floors.length > 0) {
        var conditions = [];
        floors.forEach(function (floor) {
          conditions.push("polohKodPodlazi LIKE '" + floor + "%'");
        });
        where = conditions.join(' OR ');
        var opts = {
          source: getStore(),
          type: type,
          where: where,
          method: 'POST'
        };

        munimap.load
          .featuresForMap(opts, extent, resolution, projection)
          .then(function (doorOpenings) {
            var activeStore = layer.getSource();
            var doorOpeningsFromActiveFloors = doorOpenings.filter(function (
              doorOpening
            ) {
              var floorCode = doorOpening.get('polohKodPodlazi');
              return floors.indexOf(floorCode) >= 0;
            });
            var doorOpeningsToAdd = munimap.store.getNotYetAddedFeatures(
              activeStore,
              doorOpeningsFromActiveFloors
            );
            activeStore.addFeatures(doorOpeningsToAdd);
          });
      }
    };
    source.setLoader(loader);

    var layers = map.getLayers();
    layers.insertAt(4, layer);

    var currFloorCode;
    store.subscribe(function() {
      var state = store.getState();
      var style = getStyleForLayer(state);
      var lyrs = map.getLayers().getArray();
      var lyr;
      lyrs.forEach(function (l) {
        if (l.get('id') === type.name) {
          lyr = l;
        }
      });

      if (lyr && lyr instanceof munimap.ol.layer.Vector) {
        if (style !== lyr.getStyle()) {
          lyr.setStyle(style);
        }
      }

      var prevFloorCode = currFloorCode;
      currFloorCode = munimap.slctr.getSelectedFloorCode(state);
      if (prevFloorCode !== currFloorCode) {
        getStore().refresh();
      }
    });
  },
};
