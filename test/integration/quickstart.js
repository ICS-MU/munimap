import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('quickstart.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/quickstart.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should get correct view properties', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const view = map.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      const info = {
        center,
        zoom,
      };
      return info;
    });

    assert.equal(info.zoom, 13, `Unexpected zoom`);

    const expected_center = [1848503, 6308636];
    const spatial_precision = 1;
    info.center.forEach((coord, idx) => {
      assert.approximately(
        coord,
        expected_center[idx],
        spatial_precision,
        `Unexpected center: ${info.center} != ${expected_center}`
      );
    });
  });

  it('should get correct layer types', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const considered_layer_constructors = {
        'ol.layer.Tile': munimap.ol.layer.Tile,
        'ol.layer.Vector': munimap.ol.layer.Vector,
      };
      const layer_types = map
        .getLayers()
        .getArray()
        .map((layer) => {
          return Object.keys(considered_layer_constructors).find(
            (ctor_name) => {
              return layer instanceof considered_layer_constructors[ctor_name];
            }
          );
        });
      const info = {
        layer_types,
      };
      return info;
    });

    assert.equal(info.layer_types.length, 11);
    assert.deepEqual(info.layer_types, [
      'ol.layer.Tile',
      'ol.layer.Vector',
      'ol.layer.Vector',
      'ol.layer.Vector',
      'ol.layer.Vector',
      'ol.layer.Vector',
      'ol.layer.Vector',
      'ol.layer.Vector',
      'ol.layer.Vector',
      'ol.layer.Vector',
      'ol.layer.Vector',
    ]);
  });

  it('should have correct initExtentOpts', async () => {
    const initExtOpts = await page.evaluate(async () => {
      const map = await map_promise;
      const view = map.getView();
      const initExtOpts = view.get('initExtentOpts');
      return initExtOpts;
    });
    const expected_extent = [1842732.61, 6305751.25, 1854274.61, 6311522.25];
    const expected_size = [604, 302];
    const expected_center = [1848503, 6308636];
    const expected_zoom = 13;
    const expected_resolution = 19.1;

    const center_precision = 1;
    const extent_precision = 0.1;

    const {extent, size, center, zoom, resolution} = initExtOpts;

    if (extent) {
      extent.forEach((coord, idx) => {
        assert.approximately(
          coord,
          expected_extent[idx],
          extent_precision,
          `Unexpected extent: ${extent} != ${expected_extent}`
        );
      });
    }

    if (size) {
      assert.deepEqual(size, expected_size, `Unexpected size`);
    }

    if (center) {
      center.forEach((coord, idx) => {
        assert.approximately(
          coord,
          expected_center[idx],
          center_precision,
          `Unexpected center: ${center} != ${expected_center}`
        );
      });
    }

    if (zoom) {
      assert.equal(zoom, expected_zoom, `Unexpected zoom`);
    }

    if (resolution) {
      assert.approximately(
        resolution,
        expected_resolution,
        extent_precision,
        `Unexpected resolution`
      );
    }
  });

  it('should have layer attribution', async () => {
    const layers = await page.evaluate(async () => {
      const map = await map_promise;
      const layers = map.getLayers().getArray();
      const result = {};
      layers.forEach((layer, idx) => {
        const s = layer.getSource();
        const attr = s.getAttributions();
        let attrContent;
        if (attr) {
          attrContent = attr()[0];
        } else {
          attrContent = null;
        }
        result[idx] = {
          type: layer.type,
          attribution: attrContent,
        };
      });
      return result;
    });
    let foundMuni = false;
    for (const id in layers) {
      if (layers[id].attribution) {
        if (layers[id].type === 'TILE') {
          assert(
            layers[id].attribution.includes('arcgis') ||
              layers[id].attribution.includes('osm'),
            `Attribution does not include 'osm' or 'arcgis`
          );
        } else {
          if (!foundMuni) {
            foundMuni = layers[id].attribution.includes('muni');
          }
        }
      }
    }
    assert(foundMuni, `No attribution with 'muni' was found.`);
  });

  it('should have default layers and default layers props', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const layers = map.getLayers().getArray();
      const vectorLayers = layers.filter(
        (l) => l instanceof munimap.ol.layer.Vector
      );

      const layerIds = vectorLayers.map((l) => l.get('id'));
      const layerSources = vectorLayers.map((l) => [
        l.get('id'),
        !!l.getSource(),
      ]);
      const layerStyles = vectorLayers.map((l) => [
        l.get('id'),
        !!l.getStyle(),
      ]);
      const hasPrerenderListener = [];
      vectorLayers.forEach((l) => {
        const layerId = l.get('id');
        const listeners = l.getListeners('prerender');
        const hasListeners = listeners ? listeners.length > 0 : false;
        if (hasListeners) {
          hasPrerenderListener.push(layerId);
        }
      });
      const resolutions = vectorLayers.map((l) => [
        l.get('id'),
        [
          l.getMinResolution(),
          l.getMaxResolution() === Infinity ? 'Infinity' : l.getMaxResolution(),
        ],
      ]);
      const hasClickFunctionality = vectorLayers.map((l) => [
        l.get('id'),
        !!l.get('isFeatureClickable'),
        !!l.get('featureClickHandler'),
      ]);

      return {
        layerIds,
        layerSources,
        layerStyles,
        hasPrerenderListener,
        resolutions,
        hasClickFunctionality,
      };
    });

    const layerIds = info.layerIds;
    const layerSources = info.layerSources;
    const layerStyles = info.layerStyles;
    const hasPrerenderListener = info.hasPrerenderListener;
    const resolutions = info.resolutions;
    const hasClickFunctionality = info.hasClickFunctionality;

    assert.deepEqual(
      layerIds,
      [
        'building',
        'room',
        'active-room',
        'active-door',
        'active-poi',
        'room-label',
        'building-label',
        'complex',
        'marker-cluster',
        'marker',
      ],
      'Unexpected default layer id!'
    );
    layerSources.forEach(([id, hasSource]) => {
      assert.isTrue(hasSource, `Source for '${id}' not found!`);
    });
    layerStyles.forEach(([id, hasStyle]) => {
      assert.isTrue(hasStyle, `Style for '${id}' not found!`);
    });
    assert.deepEqual(
      hasPrerenderListener,
      ['room', 'active-room', 'marker-cluster', 'marker'],
      'Unexpected layer with prerender listener!'
    );

    const expectedResolutions = [
      ['building', [0, 4.77]],
      ['room', [0, 0.3]],
      ['active-room', [0, 0.3]],
      ['active-door', [0, 0.13]],
      ['active-poi', [0, 1.195]],
      ['room-label', [0, 0.3]], //podminka
      ['building-label', [0, 'Infinity']],
      ['complex', [1.19, 4.77]],
      ['marker-cluster', [2.39, 'Infinity']], //podminka
      ['marker', [0, 2.39]], //podminka
    ];
    assert.deepEqual(
      resolutions,
      expectedResolutions,
      'Unexpected layer resolution!'
    );

    const expectedClickFunctionality = [
      ['building', true, true],
      ['room', false, false],
      ['active-room', true, true],
      ['active-door', true, true],
      ['active-poi', true, true],
      ['room-label', true, true],
      ['building-label', true, true],
      ['complex', true, true],
      ['marker-cluster', true, true],
      ['marker', true, true],
    ];
    assert.deepEqual(
      hasClickFunctionality,
      expectedClickFunctionality,
      'Unexpected click functionality on layer!'
    );
  });

  describe('should have basemap', async () => {
    it('Brno', async () => {
      const info = await page.evaluate(async () => {
        const map = await map_promise;

        const basemapLayer = map.getLayers().item(0);
        const basemapSource = basemapLayer.getSource();
        const url = basemapSource.getUrls()[0];
        const info = {
          url,
        };
        return info;
      });

      const url = info.url;
      assert.include(url, 'arcgis', 'Unexpected basemap! Cannot find `arcgis`');
    });

    it('Antarctis', async () => {
      const info = await page.evaluate(async () => {
        const map = await map_promise;
        const promise = new Promise((resolve, reject) => {
          map.getLayers().on('add', (evt) => {
            resolve(evt.element);
          });
          map.getView().animate({
            center: [-6443493.193, -9299322.0384],
            resolution: 0.15,
          });
        });
        const basemapLayer = await promise;
        const basemapSource = basemapLayer.getSource();
        const url = basemapSource.getUrls()[0];
        const info = {
          url,
        };
        return info;
      });

      const url = info.url;
      assert.include(
        url,
        'openstreetmap',
        'Unexpected basemap! Cannot find `openstreetmap`'
      );
    });
  });

  describe('should have controls', async () => {
    const test = async (ctor_assert, identifiers_assert) => {
      const info = await page.evaluate(async () => {
        const map = await map_promise;
        const controls = map.getControls().getArray();
        const considered_control_constructors = {
          'ol.control.Zoom': munimap.ol.control.Zoom,
          'ol.control.FullScreen': munimap.ol.control.FullScreen,
          'ol.control.Attribution': munimap.ol.control.Attribution,
        };
        const control_types = controls.map((control) => {
          const desc = {
            id: undefined,
            class: undefined,
            ctor_name: undefined,
            parent_className: undefined,
            in_document: undefined,
          };
          Object.keys(considered_control_constructors).find((ctor_name) => {
            if (control instanceof considered_control_constructors[ctor_name]) {
              desc.id = control.element.id;
              desc.class = control.element.className;
              desc.ctor_name = ctor_name;
              desc.parent_className = control.element.parentElement.className;
              desc.in_document = document.body.contains(control.element);
              return true;
            } else {
              return false;
            }
          });
          return desc;
        });

        const targetEl = map.getTargetElement();
        const toolbar = targetEl.querySelector('.munimap-tool-bar');
        const initExtent = targetEl.querySelector('.munimap-initial-extent');
        const mapTools = targetEl.querySelector('.munimap-map-tools');

        const custom_types = [
          {
            class: toolbar && toolbar.className,
            ctor_name: 'ol.control.Control',
            parent_className: toolbar && toolbar.parentElement.className,
            in_document: document.body.contains(toolbar),
          },
          {
            class: initExtent && initExtent.className,
            ctor_name: 'ol.control.Control',
            parent_className: initExtent && initExtent.parentElement.className,
            in_document: document.body.contains(initExtent),
          },
          {
            class: mapTools && mapTools.className,
            ctor_name: 'ol.control.Control',
            parent_className: mapTools && mapTools.parentElement.className,
            in_document: document.body.contains(mapTools),
          },
          //geolocation work only if HTTPS or !PRODUCTION
        ];

        const info = {
          control_types,
          custom_types,
        };
        return info;
      });

      //ctor_names
      const control_types = info.control_types;
      const ctor_names = [];
      control_types.forEach((type) => ctor_names.push(type['ctor_name']));
      ctor_assert(ctor_names);

      //ol.control.Control => id, class, parent_className, in_document
      const identifiers = [];
      const cunstom_types = info.custom_types;
      cunstom_types.forEach((type) => {
        identifiers.push([
          type['class'],
          type['parent_className'],
          type['in_document'],
        ]);
      });
      identifiers_assert(identifiers);
    };

    it('in default viewport', async () => {
      const ctor_assert = (arr) => {
        assert.deepEqual(arr, [
          'ol.control.Zoom',
          'ol.control.Attribution',
          'ol.control.FullScreen',
        ]);
      };

      const identifiers_assert = (arr) => {
        const expectedArr = [
          ['munimap-tool-bar default', 'map-target', true],
          ['munimap-initial-extent', 'munimap-tool-bar default', true],
          [null, null, false],
        ];
        assert.deepEqual(
          arr,
          expectedArr,
          'Unexpected custom controls in default view!'
        );
      };

      await test(ctor_assert, identifiers_assert);
    });

    it.skip('in small viewport', async () => {
      // await page.setViewport({width: 300, height: 800});
      // await test(ctor_assert, identifiers_assert);
      // await page.setViewport(viewport);
    });
  });
});
