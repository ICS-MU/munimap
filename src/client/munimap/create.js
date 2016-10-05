goog.provide('munimap.create');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Select');
goog.require('munimap');
goog.require('munimap.assert');
goog.require('munimap.building');
goog.require('munimap.building.style');
goog.require('munimap.cluster');
goog.require('munimap.cluster.style');
goog.require('munimap.complex');
goog.require('munimap.complex.style');
goog.require('munimap.door');
goog.require('munimap.extent');
goog.require('munimap.floor');
goog.require('munimap.info');
goog.require('munimap.lang');
goog.require('munimap.marker');
goog.require('munimap.poi');
goog.require('munimap.poi.style');
goog.require('munimap.room');
goog.require('munimap.room.label');
goog.require('munimap.room.style');
goog.require('munimap.source.Cluster');
goog.require('munimap.store');
goog.require('munimap.style');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.format.GeoJSON');
goog.require('ol.interaction.Select');
goog.require('ol.layer.Image');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.proj');
goog.require('ol.source.OSM');
goog.require('ol.source.Raster');


/**
 * @param {munimapx.create.Options} options
 * @return {goog.Thenable<ol.Map>} promise of features contained
 * in server response
 */
munimap.create = function(options) {

  munimap.create.assertOptions(options);

  return new goog.Promise(function(resolve, reject) {
    goog.Promise.all([
      options,
      munimap.load.featuresFromParam(options.markers),
      munimap.load.featuresFromParam(options.zoomTo),
      munimap.create.loadFonts()
    ]).then(function(results) {
      var options = results[0];
      var markers = results[1];
      var zoomTos = results[2];

      var view = munimap.create.calculateView(options, markers, zoomTos);
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
      munimap.lang.active = options.lang || munimap.lang.Abbr.CZECH;

      var osmAttribution = new ol.Attribution({
        html:
            munimap.lang.getMsg(munimap.lang.Translations.OSM_ATTRIBUTION_HTML)
      });
      var muAttribution = new ol.Attribution({
        html: munimap.lang.getMsg(munimap.lang.Translations.MU_ATTRIBUTION_HTML)
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
        var resColor = munimap.style.RESOLUTION_COLOR.find(
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
                munimap.lang.getMsg(munimap.lang.Translations.ATTRIBUTIONS)
          },
          rotate: false,
          zoomOptions: {
            zoomInTipLabel:
                munimap.lang.getMsg(munimap.lang.Translations.ZOOM_IN),
            zoomOutTipLabel:
                munimap.lang.getMsg(munimap.lang.Translations.ZOOM_OUT)
          }
        }),
        layers: [
          raster
        ],
        target: munimapEl,
        view: view
      });
      munimap.LIST.push(map);


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
        id: munimap.marker.LAYER_ID,
        source: markerSource,
        style: goog.partial(munimap.marker.style.function, markerOptions),
        maxResolution: munimap.marker.RESOLUTION.max,
        updateWhileAnimating: true,
        updateWhileInteracting: false
      });

      var complexesStore = munimap.complex.STORE;
      complexesStore.setAttributions([muAttribution]);
      var complexes = new ol.layer.Vector({
        source: complexesStore,
        style: goog.partial(munimap.complex.style.function, {
          markerSource: markerSource
        }),
        minResolution: munimap.complex.RESOLUTION.min,
        maxResolution: munimap.complex.RESOLUTION.max,
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      var buildingsStore = munimap.building.STORE;
      buildingsStore.setAttributions([muAttribution]);
      var buildings = new ol.layer.Vector({
        source: buildingsStore,
        style: goog.partial(munimap.building.style.function, {
          markerSource: markerSource,
          map: map
        }),
        maxResolution: munimap.complex.RESOLUTION.max,
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      var roomsStore = munimap.room.DEFAULT_STORE;
      roomsStore.setAttributions([muAttribution]);
      var rooms = new ol.layer.Vector({
        id: munimap.room.DEFAULT_LAYER_ID,
        maxResolution: munimap.floor.RESOLUTION.max,
        opacity: 0.4,
        source: roomsStore,
        style: goog.partial(munimap.room.style.function, {
          markerSource: markerSource,
          isActive: false,
          map: map
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      rooms.once('precompose', munimap.room.style.setCorridorStyle);

      var activeRoomsStore = munimap.room.createActiveStore(map);
      activeRoomsStore.setAttributions([muAttribution]);
      var activeRooms = new ol.layer.Vector({
        id: munimap.room.ACTIVE_LAYER_ID,
        maxResolution: munimap.floor.RESOLUTION.max,
        source: activeRoomsStore,
        style: goog.partial(munimap.room.style.function, {
          markerSource: markerSource,
          isActive: true,
          map: map
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      activeRooms.once('precompose', munimap.room.style.setCorridorStyle);

      var doorsStore = munimap.door.createActiveStore(map);
      doorsStore.setAttributions([muAttribution]);
      var doors = new ol.layer.Vector({
        id: munimap.door.ACTIVE_LAYER_ID,
        maxResolution: munimap.door.RESOLUTION.max,
        source: doorsStore,
        style: munimap.door.STYLE,
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      var poiStore = munimap.poi.createActiveStore(map);
      poiStore.setAttributions([muAttribution]);
      var poi = new ol.layer.Vector({
        id: munimap.poi.ACTIVE_LAYER_ID,
        maxResolution: munimap.poi.RESOLUTION.max,
        source: poiStore,
        style: goog.partial(munimap.poi.style.function, {map: map}),
        updateWhileAnimating: true,
        updateWhileInteracting: true

      });

      var clusterResolution = munimap.cluster.BUILDING_RESOLUTION;
      if (markers.length && munimap.room.isRoom(markers[0])) {
        clusterResolution = munimap.cluster.ROOM_RESOLUTION;
      }
      var clusterFeatures = markers.concat();
      var markerClusterSrc = new munimap.source.Cluster({
        attributions: [muAttribution],
        source: new ol.source.Vector({
          features: clusterFeatures
        }),
        compareFn: goog.partial(munimap.source.Cluster.compareFn, map),
        distance: 80
      });
      var markerClusterLayer = new ol.layer.Vector({
        id: munimap.cluster.LAYER_ID,
        source: markerClusterSrc,
        style: goog.partial(
            munimap.cluster.style.function, markerOptions),
        minResolution: clusterResolution.min/*,
        updateWhileAnimating: true,
        updateWhileInteracting: true*/
      });

      var buildingLabels = new ol.layer.Vector({
        source: buildingsStore,
        style: goog.partial(munimap.building.style.labelFunction, {
          map: map,
          markerSource: markerSource
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: false

      });

      var roomLabels = new ol.layer.Vector({
        id: munimap.room.label.LAYER_ID,
        maxResolution: munimap.floor.RESOLUTION.max,
        source: activeRoomsStore,
        style: goog.partial(munimap.room.style.labelFunction, {
          markerSource: markerSource,
          markerLabel: options.markerLabel,
          map: map
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true
      });

      map.addLayer(buildings);
      map.addLayer(rooms);
      map.addLayer(activeRooms);
      map.addLayer(doors);
      map.addLayer(poi);
      map.addLayer(roomLabels);
      map.addLayer(complexes);
      map.addLayer(buildingLabels);
      map.addLayer(markerClusterLayer);
      map.addLayer(markerLayer);

      var floorSelect = new goog.ui.Select();
      floorSelect.render(floorEl);
      goog.events.listen(floorSelect, 'action', function() {
        var newFloor =
            /**@type (ol.Feature)*/ (floorSelect.getSelectedItem().getModel());
        var newLocCode = /**@type (string)*/ (newFloor.get('polohKod'));
        var activeFloor = munimap.getVars(map).activeFloor;
        if (!activeFloor || activeFloor.locationCode !== newLocCode) {
          munimap.changeFloor(map, newLocCode);
        }
      });

      var mapVars = {
        info: infoEl,
        floorSelect: floorSelect,
        activeBuilding: null,
        activeFloor: null,
        currentResolution: goog.asserts.assertNumber(view.getResolution())
      };
      map.set(munimap.VARS_NAME, mapVars);

      munimap.cluster.updateClusteredFeatures(map, view.getResolution());

      map.on('pointermove', function(evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var view = map.getView();
        var resolution = view.getResolution();
        goog.asserts.assertNumber(resolution);
        var feature = munimap.getMainFeatureAtPixel(map, pixel);
        if (feature &&
            munimap.isFeatureClickable(map, feature, resolution)) {
          map.getTarget().style.cursor = 'pointer';
        } else {
          map.getTarget().style.cursor = '';
        }
      });

      map.on('click', function(evt) {
        munimap.handleClickOnPixel(map, evt.pixel);
      });

      map.on('moveend', function(evt) {
        munimap.building.refreshActive(map);
        munimap.info.refreshVisibility(map);
      });

      map.on('precompose', munimap.cluster.handleMapPrecomposeEvt);

      view.on('change:resolution', function(evt) {

        var res = view.getResolution();
        goog.asserts.assertNumber(res);

        var oldRes = /**@type {number}*/(evt.oldValue);
        if (munimap.range.contains(munimap.floor.RESOLUTION, oldRes) &&
            !munimap.range.contains(munimap.floor.RESOLUTION, res)) {
          munimap.info.refreshVisibility(map);
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
munimap.create.MarkerLabel;


/**
 * @param {munimapx.create.Options} options
 */
munimap.create.assertOptions = function(options) {
  munimap.assert.target(options.target);
  goog.asserts.assert(
      options.zoom === undefined || options.zoomTo === undefined,
      'Zoom and zoomTo options can\'t be defined together.');
  goog.asserts.assert(
      options.center === undefined || options.zoomTo === undefined,
      'Center and zoomTo options can\'t be defined together.');
  munimap.assert.zoom(options.zoom);
  munimap.assert.zoomTo(options.zoomTo);
  munimap.assert.markers(options.markers);
  munimap.assert.lang(options.lang);
};


/**
 * @param {munimapx.create.Options} options
 * @param {Array<ol.Feature>} markers
 * @param {Array<ol.Feature>} zoomTos
 * @return {ol.View}
 */
munimap.create.calculateView = function(options, markers, zoomTos) {
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
    var extent = munimap.extent.ofFeatures(zoomTos);
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
munimap.create.loadFonts = function() {
  return new goog.Promise(function(resolve, reject) {
    WebFont.load({
      'classes': false,
      'custom': {
        'families': ['MunimapFont'],
        'testStrings': {'MunimapFont': '\uf129' },
        'urls': [
          jpad.DEV ?
              './../munimaplib.css' :
              '//maps.muni.cz/munimap/munimaplib.css'
        ]
      },
      'timeout': 2000,
      'fontactive': function(font) {
        resolve('font ' + font + ' loaded');
      },
      'fontinactive': function(font) {
        reject('font ' + font + ' failed to load');
      }
    });
  });
};
