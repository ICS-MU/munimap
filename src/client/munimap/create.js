goog.provide('munimap.create');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Select');
goog.require('goog.userAgent');
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
goog.require('munimap.geolocate');
goog.require('munimap.getDefaultLayers');
goog.require('munimap.info');
goog.require('munimap.lang');
goog.require('munimap.layer.propName');
goog.require('munimap.mapLinks');
goog.require('munimap.marker');
goog.require('munimap.matomo');
goog.require('munimap.optpoi');
goog.require('munimap.poi');
goog.require('munimap.poi.style');
goog.require('munimap.pubtran.stop.layer');
goog.require('munimap.room');
goog.require('munimap.room.label');
goog.require('munimap.room.style');
goog.require('munimap.source.Cluster');
goog.require('munimap.store');
goog.require('munimap.style');


/**
 * @param {munimapx.create.Options} options
 * @return {goog.Thenable<ol.Map>} promise of features contained
 * in server response
 */
munimap.create = function(options) {
  var createKeys = goog.object.getKeys(options);
  createKeys.sort();
  munimap.matomo.sendEvent('map', 'create');

  munimap.create.assertOptions(options);
  munimap.lang.active = options.lang || munimap.lang.Abbr.CZECH;

  return new goog.Promise(function(resolve, reject) {
    goog.Promise.all([
      options,
      munimap.create.loadOrDecorateMarkers(options.markers, options),
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
        getMainFeatureAtPixel: options.getMainFeatureAtPixel,
        layers: options.layers,
        baseMap: options.baseMap || munimap.BaseMaps.OSM_BW,
        pubTran: options.pubTran,
        locationCodes: options.locationCodes,
        mapLinks: options.mapLinks
      };
    }).then(function(options) {
      var target = options.target;
      var markers = options.markers;
      var view = options.view;
      if (String(options.mapLinks) !== 'undefined') {
        munimap.matomo.sendEvent('mapLinks', String(options.mapLinks));
      }
      if (String(options.pubTran) !== 'undefined') {
        munimap.matomo.sendEvent('pubTran', String(options.pubTran));
      }
      if (String(options.baseMap) !== 'osm-bw') {
        munimap.matomo.sendEvent('baseMap', String(options.baseMap));
      }

      munimap.matomo.checkCustomMarker(options.markers);
      var osmAttribution = new ol.Attribution({
        html:
          munimap.lang.getMsg(munimap.lang.Translations.OSM_ATTRIBUTION_HTML)
      });
      var muAttribution = new ol.Attribution({
        html: munimap.lang.getMsg(munimap.lang.Translations.MU_ATTRIBUTION_HTML)
      });
      var munimapAttribution = new ol.Attribution({
        html: munimap.lang.getMsg(
          munimap.lang.Translations.MUNIMAP_ATTRIBUTION_HTML)
      });
      var muAttributions = [munimapAttribution, muAttribution];

      var raster;

      switch (options.baseMap) {
        case munimap.BaseMaps.OSM:
        case munimap.BaseMaps.OSM_BW:
        default:
          raster = new ol.layer.Tile({
            source: new ol.source.OSM({
              attributions: [osmAttribution],
              crossOrigin: null
            })
          });
      }

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
      if (options.baseMap === munimap.BaseMaps.OSM_BW && !goog.userAgent.IE) {
        raster.on('postcompose', function(evt) {
          var ctx = evt.context;
          evt.context.globalCompositeOperation = 'color';
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          evt.fillStyle = '#000000';
          evt.context.globalCompositeOperation = 'source-over';
        });
      }

      var munimapEl = goog.dom.createDom('div', 'munimap');
      var infoEl = goog.dom.createDom('div', 'ol-popup munimap-info');
      var complexEl = goog.dom.createDom('div', 'munimap-complex');
      var bldgEl = goog.dom.createDom('div', 'munimap-building');
      var floorEl = goog.dom.createDom('div', 'munimap-floor');

      goog.dom.appendChild(infoEl, complexEl);
      goog.dom.appendChild(infoEl, bldgEl);
      goog.dom.appendChild(infoEl, floorEl);
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
        attributions: muAttributions,
        features: markers
      });

      var markerOptions = {
        map: map,
        markerSource: markerSource,
        markerLabel: options.markerLabel
      };

      var markerLayerResolution = munimap.marker.RESOLUTION.max
      var clusterResolution = munimap.cluster.BUILDING_RESOLUTION;
      if (markers.length && (markers.some(function(el) {
        return munimap.room.isRoom(el);
      }) || markers.some(function(el) {
        return munimap.door.isDoor(el);
      })
      )) {
        clusterResolution = munimap.cluster.ROOM_RESOLUTION;
      }

      var markerLayer = new ol.layer.Vector({
        id: munimap.marker.LAYER_ID,
        isFeatureClickable: munimap.marker.isClickable,
        featureClickHandler: munimap.marker.featureClickHandler,
        redrawOnFloorChange: true,
        source: markerSource,
        style: goog.partial(munimap.marker.style.function, markerOptions),
        maxResolution: clusterResolution.min,
        updateWhileAnimating: true,
        updateWhileInteracting: false,
        renderOrder: null
      });

      var clusterFeatures = markers.concat();
      var markerClusterSrc = new ol.source.Cluster({
        attributions: muAttributions,
        source: new ol.source.Vector({
          features: clusterFeatures
        }),
        compareFn: goog.partial(munimap.source.Cluster.compareFn, map),
        geometryFunction: function(feature) {
          var result = null;
          var geom = feature.getGeometry();
          if (geom instanceof ol.geom.Point) {
            result = geom;
          } else if (geom) {
            result = new ol.geom.Point(ol.extent.getCenter(geom.getExtent()));
          }
          return result;
        },
        distance: 80
      });
      var markerClusterLayer = new ol.layer.Vector({
        id: munimap.cluster.LAYER_ID,
        isFeatureClickable: munimap.cluster.isClickable,
        featureClickHandler: munimap.cluster.featureClickHandler,
        source: markerClusterSrc,
        style: goog.partial(
          munimap.cluster.style.function, markerOptions),
        minResolution: clusterResolution.min,
        renderOrder: null/*,
        updateWhileAnimating: true,
        updateWhileInteracting: true*/
      });
      var floorSelect = new goog.ui.Select();
      floorSelect.render(floorEl);
      goog.events.listen(floorSelect, 'action', function() {
        var newFloor =
            /**@type (ol.Feature)*/ (floorSelect.getSelectedItem().getModel());
        var newLocCode = /**@type (string)*/ (newFloor.get('polohKod'));
        var selectedFloor = munimap.getProps(map).selectedFloor;
        if (!selectedFloor || selectedFloor.locationCode !== newLocCode) {
          munimap.changeFloor(map, newLocCode);
        }
      });

      var mapProps = {
        info: infoEl,
        floorSelect: floorSelect,
        selectedBuilding: null,
        selectedFloor: null,
        currentResolution: goog.asserts.assertNumber(view.getResolution()),
        getMainFeatureAtPixel: options.getMainFeatureAtPixel ||
          munimap.getMainFeatureAtPixel,
        locationCodes: options.locationCodes
      };
      map.set(munimap.PROPS_NAME, mapProps);

      var layers = options.layers || munimap.getDefaultLayers(map);
      munimap.create.setDefaultLayersProps({
        layers: layers,
        markersAwareOptions: markerOptions,
        attributions: muAttributions
      });

      layers.forEach(function(layer) {
        map.addLayer(layer);
      });

      if (options.pubTran) {
        var pubTranAttribution = new ol.Attribution({
          html: munimap.lang.getMsg(
            munimap.lang.Translations.PUBTRAN_ATTRIBUTION_HTML)
        });
        var pubTranLayer = munimap.pubtran.stop.layer.create();
        var pubTranSource = pubTranLayer.getSource();
        pubTranSource.setAttributions([pubTranAttribution]);
        map.addLayer(pubTranLayer);
      }
      if (options.mapLinks) {
        map.addControl(munimap.mapLinks.create(map));
      }
      if (window.location.protocol === 'https:' || jpad.DEV) {
        map.addControl(munimap.geolocate.create(map));
      }
      else {
        munimap.matomo.sendEvent('geolocation', 'http_hidden');
      }
      map.addLayer(markerClusterLayer);
      map.addLayer(markerLayer);

      munimap.cluster.updateClusteredFeatures(map, view.getResolution());

      map.on('pointermove', function(evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var getMainFeatureAtPixel = munimap.getProps(map).getMainFeatureAtPixel;
        var layeredFeature = getMainFeatureAtPixel(map, pixel);
        if (layeredFeature) {
          var layer = layeredFeature.layer;
          var isClickable =
            layer.get(munimap.layer.propName.IS_CLICKABLE);
          if (isClickable) {
            goog.asserts.assertFunction(isClickable);
            var handlerOpts = {
              feature: layeredFeature.feature,
              layer: layer,
              map: map,
              pixel: pixel,
              resolution: map.getView().getResolution()
            };
            if (isClickable(handlerOpts)) {
              map.getTarget().style.cursor = 'pointer';
            } else {
              map.getTarget().style.cursor = '';
            }
          } else {
            map.getTarget().style.cursor = '';
          }
        } else {
          map.getTarget().style.cursor = '';
        }
      });

      map.on('click', function(evt) {
        munimap.handleClickOnPixel(map, evt.pixel);
      });

      map.on('moveend', function(evt) {
        munimap.building.refreshSelected(map);
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
          munimap.style.refreshAllFromFragments(map);
        } else if (!munimap.range.contains(munimap.floor.RESOLUTION, oldRes) &&
          munimap.range.contains(munimap.floor.RESOLUTION, res)) {
          munimap.style.refreshAllFromFragments(map);
        }
      });

      goog.dom.appendChild(munimapEl, infoEl);

      return map;
    }).then(resolve);
  });
};


/**
 * @param {munimapx.create.Options} options
 */
munimap.create.assertOptions = function(options) {
  munimap.assert.target(options.target);
  assert(options.zoom === undefined || options.zoomTo === undefined,
    'Zoom and zoomTo options can\'t be defined together.');
  assert(options.center === undefined || options.zoomTo === undefined,
    'Center and zoomTo options can\'t be defined together.');
  munimap.assert.zoom(options.zoom);
  munimap.assert.zoomTo(options.zoomTo);
  munimap.assert.getMainFeatureAtPixel(options.getMainFeatureAtPixel);
  munimap.assert.markers(options.markers);
  munimap.assert.layers(options.layers);
  munimap.assert.lang(options.lang);
  munimap.assert.baseMap(options.baseMap);
  munimap.assert.pubTran(options.pubTran);
  munimap.assert.locationCodes(options.locationCodes);
  munimap.assert.mapLinks(options.mapLinks);
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
      var res = view.getResolution();
      ol.extent.buffer(extent, res * 30, extent);
      view.fit(extent, [target.offsetWidth, target.offsetHeight]);
      if (munimap.marker.custom.isCustom(zoomTos[0])) {
        if (view.getResolution() < munimap.floor.RESOLUTION.max) {
          res = view.constrainResolution(
            munimap.floor.RESOLUTION.max, undefined, 1
          );
          view.setResolution(res);
        }
      }
    } else if (options.center === undefined) {
      view.setCenter(ol.extent.getCenter(extent));
    }
  }
  return view;
};


/**
 * @param {munimap.create.setDefaultLayersPropsOptions} options
 * @protected
 */
munimap.create.setDefaultLayersProps = function(options) {
  var layers = options.layers;
  var markersAwareOpts = options.markersAwareOptions;
  var map = markersAwareOpts.map || null;
  var markerSource = markersAwareOpts.markerSource;
  var attributions = options.attributions;

  var activeRoomsStore;

  layers.forEach(function(layer) {
    var layerId = layer.get('id');

    switch (layerId) {
      case munimap.complex.LAYER_ID:
        layer.setStyle(goog.partial(munimap.complex.style.function, {
          markerSource: markerSource
        })
        );
        layer.getSource().setAttributions(attributions);
        break;
      case munimap.building.LAYER_ID:
        layer.getSource().setAttributions(attributions);
        break;
      case munimap.room.DEFAULT_LAYER_ID:
        layer.getSource().setAttributions(attributions);
        layer.once('precompose', munimap.room.style.setCorridorStyle);
        break;
      case munimap.room.ACTIVE_LAYER_ID:
        if (!activeRoomsStore) {
          activeRoomsStore = munimap.room.createActiveStore(map);
          activeRoomsStore.setAttributions(attributions);
        }
        layer.setSource(activeRoomsStore);
        layer.once('precompose', munimap.room.style.setCorridorStyle);
        break;
      case munimap.room.label.LAYER_ID:
        if (!activeRoomsStore) {
          activeRoomsStore = munimap.room.createActiveStore(map);
          activeRoomsStore.setAttributions(attributions);
        }
        layer.setSource(activeRoomsStore);
        break;
      case munimap.door.ACTIVE_LAYER_ID:
        var doorsStore = munimap.door.createActiveStore(map);
        doorsStore.setAttributions(attributions);
        layer.setSource(doorsStore);
        break;
      case munimap.poi.ACTIVE_LAYER_ID:
        var poiStore = munimap.poi.createActiveStore(map);
        poiStore.setAttributions(attributions);
        layer.setSource(poiStore);
        break;
    }

    munimap.style.refreshFromFragments(map, layer);
  });
};


/**
 *
 * @typedef {{
 *    layers: Array.<ol.layer.Vector>,
 *    markersAwareOptions: munimap.style.MarkersAwareOptions,
 *    attributions: Array.<ol.Attribution>
 * }}
 */
munimap.create.setDefaultLayersPropsOptions;


/**
 * Load features by location codes or decorate custom markers.
 * @param {Array.<string>|Array.<ol.Feature>|undefined} featuresLike
 * @param {(munimapx.create.Options|munimapx.reset.Options)} options
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features
 */
munimap.create.loadOrDecorateMarkers = function(featuresLike, options) {
  var result;
  var arrPromises = []; // array of promises of features
  var features = /** @type {goog.Thenable<Array<ol.Feature>>} */ ([]);
  if (!goog.isArray(featuresLike)) {
    result = /** @type {goog.Thenable<Array<ol.Feature>>} */(
      goog.Promise.resolve([])
    );
    return result;
  } else {
    featuresLike.forEach(function(el) {
      if (!munimap.optpoi.isCtgUid(el)) {
        arrPromises.push(new goog.Promise(function(resolve, reject) {
          if (el instanceof ol.Feature) {
            munimap.marker.custom.decorate(el);
            resolve(el);
          } else if (goog.isString(el)) {
            munimap.load.featuresFromParam(el).then(function(results) {
              resolve(results[0]);
            });
          }
        }));
      }
      else {
        var arrPoi = [el];
        var ctgIds = arrPoi.map(function(ctguid) {
          return ctguid.split(':')[1];
        });
        arrPromises.push(munimap.optpoi.load({
          ids: ctgIds
        }).then(function(features) {
          var rooms = features.filter(function(f) {
            var lc = f.get('polohKodLokace');
            goog.asserts.assertString(lc);
            return munimap.room.isCode(lc);
          });
          var roomCodes = rooms.map(function(f) {
            return f.get('polohKodLokace');
          });
          if (ctgIds.length === 1 && !options.markerLabel) {
            options.markerLabel = function(f, r) {
              var clustered = munimap.cluster.getFeatures(f);
              if (!clustered.length) {
                clustered = [f];
              }
              clustered = clustered.filter(function(f) {
                return goog.array.contains(roomCodes, f.get('polohKod'));
              });
              var ctgLabel = munimap.lang.getMsg(ctgIds[0]);
              var result;
              if (clustered.length === 1) {
                result = ctgLabel;
              } else if (clustered.length > 1) {
                result = clustered.length + 'x ' + ctgLabel;
              }
              return result;
            };
          }

          return new goog.Promise(function(resolve, reject) {
            munimap.load.featuresFromParam(roomCodes).then(function(values) {
              resolve(munimap.create.addPoiDetail(values, features));
            });
          });
        }));
      }
    });
    return new goog.Promise(function(resolve, reject) {
      goog.Promise.all(arrPromises).then(function(values) {
        // reduce array of arrays to 1 array
        values = values.reduce(function(a, b) {
          return a.concat(b);
        }, []);
        result = /** @type {goog.Thenable<Array<ol.Feature>>} */(
          goog.Promise.resolve(values)
        );
        resolve(result);
      });
    });
  }
};

/**
 * Add text detail for POI.
 * @param {Array.<ol.Feature>} features
 * @param {Array.<ol.Feature>} details
 * @return {Array.<ol.Feature>} features with added properties
 */

munimap.create.addPoiDetail = function(features, details) {
  var result = [];
  features.forEach(function(feature) {
    details.forEach(function(detail) {
      if (feature.get('polohKod') === detail.get('polohKodLokace')) {
        var name, open;
        if (munimap.lang.active === 'cs') {
          name = detail.get('nazev_cs');
          open = goog.isDefAndNotNull(detail.get(
            'provozniDoba_cs')) ? detail.get(
              'provozniDoba_cs') : '';
        }
        else if (munimap.lang.active === 'en') {
          name = goog.isDefAndNotNull(detail.get(
            'nazev_en')) ? detail.get(
              'nazev_en') : detail.get(
                'nazev_cs');
          open = goog.isDefAndNotNull(detail.get(
            'provozniDoba_en')) ? detail.get(
              'provozniDoba_en') : '';

        }
        open = open.replace(',', '<br>');
        name = '<div class="munimap-bubble-title">' + name + '</div>';
        open = '<div class="munimap-bubble-text">' + open + '</div>';
        feature.set('detail', name + open);
        result.push(feature);
      }
    });
  });
  return result;
};


/**
 * @return {goog.Thenable<string>}
 */
munimap.create.loadFonts = function() {
  return new goog.Promise(function(resolve, reject) {
    var cssurl = jpad.APP_PATH + 'munimaplib.css';
    if (!jpad.DEV) {
      cssurl = '//' + jpad.PROD_DOMAIN + cssurl;
    }

    WebFont.load({
      'classes': false,
      'custom': {
        'families': ['MunimapFont'],
        'testStrings': { 'MunimapFont': '\uf129' },
        'urls': [
          cssurl
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
