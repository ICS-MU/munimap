goog.provide('ics.map.create');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Select');
goog.require('ics.map');
goog.require('ics.map.assert');
goog.require('ics.map.building');
goog.require('ics.map.building.style');
goog.require('ics.map.cluster');
goog.require('ics.map.complex');
goog.require('ics.map.complex.style');
goog.require('ics.map.door');
goog.require('ics.map.extent');
goog.require('ics.map.floor');
goog.require('ics.map.info');
goog.require('ics.map.lang');
goog.require('ics.map.marker');
goog.require('ics.map.marker.cluster');
goog.require('ics.map.marker.cluster.style');
goog.require('ics.map.poi');
goog.require('ics.map.poi.style');
goog.require('ics.map.room');
goog.require('ics.map.room.label');
goog.require('ics.map.room.style');
goog.require('ics.map.store');
goog.require('ics.map.style');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.format.GeoJSON');
goog.require('ol.interaction.Select');
goog.require('ol.layer.Image');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.proj');
goog.require('ol.source.Cluster');
goog.require('ol.source.OSM');
goog.require('ol.source.Raster');


/**
 * @param {icsx.map.create.Options} options
 * @return {goog.Thenable<ol.Map>} promise of features contained
 * in server response
 */
ics.map.create = function(options) {

  ics.map.create.assertOptions(options);

  return new goog.Promise(function(resolve, reject) {
    goog.Promise.all([
      options,
      ics.map.load.featuresFromParam(options.markers),
      ics.map.load.featuresFromParam(options.zoomTo),
      ics.map.create.loadFonts()
    ]).then(function(results) {
      var options = results[0];
      var markers = results[1];
      var zoomTos = results[2];

      var view = ics.map.create.calculateView(options, markers, zoomTos);
      view.on('propertychange', function(evt) {
        //console.log(evt.key, view.get(evt.key));
      });

      var target = goog.dom.getElement(options.target);
      return {
        view: view,
        markers: markers,
        markerLabel: options.markerLabel,
        target: target,
        lang: options.lang
      };
    }).then(function(options) {
      var target = options.target;
      var markers = options.markers;
      var view = options.view;
      ics.map.lang.active = options.lang || ics.map.lang.Abbr.CZECH;

      var osmAttribution = new ol.Attribution({
        html:
            ics.map.lang.getMsg(ics.map.lang.Translations.OSM_ATTRIBUTION_HTML)
      });
      var muAttribution = new ol.Attribution({
        html: ics.map.lang.getMsg(ics.map.lang.Translations.MU_ATTRIBUTION_HTML)
      });

      var raster = new ol.layer.Tile({
        source: new ol.source.OSM({
          attributions: [osmAttribution],
          crossOrigin: null
        })
      });

      raster.on('precompose', function(evt) {
        var ctx = evt.context;
        ctx.fillStyle = '#dddddd';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        //set opacity of the layer according to current resolution
        var resolution = evt.frameState.viewState.resolution;
        var resColor = ics.map.style.RESOLUTION_COLOR.find(
            function(obj, i, arr) {
              return resolution > obj.resolution || i === (arr.length - 1);
            });
        raster.setOpacity(resColor.opacity);
      });
      raster.on('postcompose', function(evt) {
        var ctx = evt.context;
        evt.context.globalCompositeOperation = 'color';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        evt.fillStyle = '#000000';
        evt.context.globalCompositeOperation = 'source-over';
      });

      var munimapEl = goog.dom.createDom('div', 'munimap');
      var infoEl = goog.dom.createDom('div', 'ol-popup info');
      var complexEl = goog.dom.createDom('div', 'complex');
      var bldgEl = goog.dom.createDom('div', 'building');
      var floorEl = goog.dom.createDom('div', 'floor');
      goog.dom.appendChild(infoEl, complexEl);
      goog.dom.appendChild(infoEl, bldgEl);
      goog.dom.appendChild(infoEl, floorEl);
      goog.dom.appendChild(munimapEl, infoEl);
      goog.dom.appendChild(target, munimapEl);

      var map = new ol.Map({
        controls: ol.control.defaults({
          attributionOptions: {
            tipLabel:
                ics.map.lang.getMsg(ics.map.lang.Translations.ATTRIBUTIONS)
          },
          rotate: false,
          zoomOptions: {
            zoomInTipLabel:
                ics.map.lang.getMsg(ics.map.lang.Translations.ZOOM_IN),
            zoomOutTipLabel:
                ics.map.lang.getMsg(ics.map.lang.Translations.ZOOM_OUT)
          }
        }),
        layers: [
          raster
        ],
        target: munimapEl,
        view: view
      });


      var markerSource = new ol.source.Vector({
        attributions: [muAttribution],
        features: markers
      });

      var markerOptions = {
        map: map,
        markerSource: markerSource,
        markerLabel: options.markerLabel
      };

      var markerLayer = new ol.layer.Vector({
        id: ics.map.marker.LAYER_ID,
        source: markerSource,
        style: goog.partial(ics.map.marker.style.function, markerOptions),
        maxResolution: ics.map.marker.RESOLUTION.max,
        updateWhileAnimating: true,
        updateWhileInteracting: false
      });

      var complexesStore = ics.map.complex.STORE;
      complexesStore.setAttributions([muAttribution]);
      var complexes = new ol.layer.Vector({
        source: complexesStore,
        style: goog.partial(ics.map.complex.style.function, {
          markerSource: markerSource
        }),
        minResolution: ics.map.complex.RESOLUTION.min,
        maxResolution: ics.map.complex.RESOLUTION.max,
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      var buildingsStore = ics.map.building.STORE;
      buildingsStore.setAttributions([muAttribution]);
      var buildings = new ol.layer.Vector({
        source: buildingsStore,
        style: goog.partial(ics.map.building.style.function, {
          markerSource: markerSource
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      var roomsStore = ics.map.room.DEFAULT_STORE;
      roomsStore.setAttributions([muAttribution]);
      var rooms = new ol.layer.Vector({
        id: ics.map.room.DEFAULT_LAYER_ID,
        maxResolution: ics.map.floor.RESOLUTION.max,
        opacity: 0.4,
        source: roomsStore,
        style: goog.partial(ics.map.room.style.function, {
          markerSource: markerSource,
          isActive: false
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      rooms.once('precompose', ics.map.room.style.setCorridorStyle);

      var activeRoomsStore = ics.map.room.createActiveStore(map);
      activeRoomsStore.setAttributions([muAttribution]);
      var activeRooms = new ol.layer.Vector({
        id: ics.map.room.ACTIVE_LAYER_ID,
        maxResolution: ics.map.floor.RESOLUTION.max,
        source: activeRoomsStore,
        style: goog.partial(ics.map.room.style.function, {
          markerSource: markerSource,
          isActive: true
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      activeRooms.once('precompose', ics.map.room.style.setCorridorStyle);

      var doorsStore = ics.map.door.STORE;
      doorsStore.setAttributions([muAttribution]);
      var doors = new ol.layer.Vector({
        id: ics.map.door.LAYER_ID,
        maxResolution: ics.map.door.RESOLUTION.max,
        source: doorsStore,
        style: ics.map.door.STYLE,
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      var poiStore = ics.map.poi.STORE;
      poiStore.setAttributions([muAttribution]);
      var poi = new ol.layer.Vector({
        maxResolution: ics.map.poi.RESOLUTION.max,
        source: poiStore,
        style: ics.map.poi.style.function,
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      var clusterResolution = ics.map.marker.cluster.BUILDING_RESOLUTION;
      if (markers && markers.length && ics.map.room.isRoom(markers[0])) {
        clusterResolution = ics.map.marker.cluster.ROOM_RESOLUTION;
      }
      var markerClusterSrc = new ol.source.Cluster({
        attributions: [muAttribution],
        source: markerSource,
        distance: 50
      });
      var markerClusterLayer = new ol.layer.Vector({
        id: ics.map.marker.cluster.LAYER_ID,
        source: markerClusterSrc,
        style: goog.partial(
            ics.map.marker.cluster.style.function, markerOptions),
        minResolution: clusterResolution.min,
        updateWhileAnimating: true,
        updateWhileInteracting: true
      });

      var buildingLabels = new ol.layer.Vector({
        source: buildingsStore,
        style: goog.partial(ics.map.building.style.labelFunction, {
          map: map,
          markerSource: markerSource
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: false

      });

      var roomLabels = new ol.layer.Vector({
        id: ics.map.room.label.LAYER_ID,
        maxResolution: ics.map.floor.RESOLUTION.max,
        source: activeRoomsStore,
        style: goog.partial(ics.map.room.style.labelFunction, {
          markerSource: markerSource,
          markerLabel: options.markerLabel
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true
      });

      map.addLayer(buildings);
      map.addLayer(rooms);
      map.addLayer(activeRooms);
      map.addLayer(doors);
      map.addLayer(poi);
      map.addLayer(complexes);
      map.addLayer(markerClusterLayer);
      map.addLayer(buildingLabels);
      map.addLayer(roomLabels);
      map.addLayer(markerLayer);

      var floorSelect = new goog.ui.Select();
      floorSelect.render(floorEl);
      goog.events.listen(floorSelect, 'action', function() {
        var newFloor =
            /**@type (ol.Feature)*/ (floorSelect.getSelectedItem().getModel());
        var newLocCode = /**@type (string)*/ (newFloor.get('polohKod'));
        if (!ics.map.floor.active ||
            ics.map.floor.active.locationCode !== newLocCode) {
          ics.map.changeFloor(map, newLocCode);
        }
      });
      var mapVars = {
        info: infoEl,
        floorSelect: floorSelect
      };
      map.set(ics.map.VARS_NAME, mapVars);

      map.on('pointermove', function(evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var view = map.getView();
        var resolution = view.getResolution();
        goog.asserts.assertNumber(resolution);
        var feature = ics.map.getMainFeatureAtPixel(map, pixel);
        if (feature && ics.map.isFeatureClickable(map, feature, resolution)) {
          map.getTarget().style.cursor = 'pointer';
        } else {
          map.getTarget().style.cursor = '';
        }
      });

      map.on('click', function(evt) {
        ics.map.handleClickOnPixel(map, evt.pixel);
      });

      map.on('moveend', function(evt) {
        ics.map.building.refreshActive(map);
        ics.map.info.refreshVisibility(map);
      });

      view.on('change:resolution', function(evt) {

        var res = view.getResolution();
        goog.asserts.assertNumber(res);

        var oldRes = /**@type {number}*/(evt.oldValue);
        if (ics.map.range.contains(ics.map.floor.RESOLUTION, oldRes) &&
            !ics.map.range.contains(ics.map.floor.RESOLUTION, res)) {
          ics.map.info.refreshVisibility(map);
        }
      });

      return map;
    }).then(resolve);
  });
};


/**
 *
 * @typedef {
 *    function((ol.Feature|ol.render.Feature), number): (string|null|undefined)
 * }
 */
ics.map.create.MarkerLabel;


/**
 * @param {icsx.map.create.Options} options
 */
ics.map.create.assertOptions = function(options) {
  ics.map.assert.target(options.target);
  goog.asserts.assert(
      options.zoom === undefined || options.zoomTo === undefined,
      'Zoom and zoomTo options can\'t be defined together.');
  goog.asserts.assert(
      options.center === undefined || options.zoomTo === undefined,
      'Center and zoomTo options can\'t be defined together.');
  ics.map.assert.zoom(options.zoom);
  ics.map.assert.zoomTo(options.zoomTo);
  ics.map.assert.markers(options.markers);
  ics.map.assert.lang(options.lang);
};


/**
 * @param {icsx.map.create.Options} options
 * @param {Array<ol.Feature>} markers
 * @param {Array<ol.Feature>} zoomTos
 * @return {ol.View}
 */
ics.map.create.calculateView = function(options, markers, zoomTos) {
  var target = goog.dom.getElement(options.target);
  var center = ol.proj.transform(
      options.center || [16.605390495656977, 49.1986567194723],
      ol.proj.get('EPSG:4326'),
      ol.proj.get('EPSG:3857')
      );
  var zoom = options.zoom === undefined ? 13 : options.zoom;
  var view = new ol.View({
    center: center,
    maxZoom: 23,
    minZoom: 0,
    zoom: zoom
  });
  zoomTos = zoomTos.length ? zoomTos : markers;
  if (zoomTos.length) {
    var extent = ics.map.extent.ofFeatures(zoomTos);
    if (options.zoom === undefined && options.center === undefined) {
      view.fit(extent, [target.offsetWidth, target.offsetHeight]);
    } else if (options.center === undefined) {
      view.setCenter(ol.extent.getCenter(extent));
    }
  }

  return view;
};


/**
 * @return {goog.Thenable<string>}
 */
ics.map.create.loadFonts = function() {
  return new goog.Promise(function(resolve, reject) {
    WebFont.load({
      'classes': false,
      'custom': {
        'families': ['FontAwesome'],
        'testStrings': {'FontAwesome': '\uf129' },
        'urls': [
          jpad.DEV ?
              './lib/lib.css' :
              '//maps.muni.cz/munimap/ics/map/lib/lib.css'
        ]
      },
      'timeout': 2000,
      'active': function() {
        resolve('fonts loaded');
      },
      'inactive': function() {
        reject('fonts failed to load');
      }
    });
  });
};
