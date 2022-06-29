import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('reset.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/reset.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  beforeEach(async () => {
    await page.reload({waitUntil: ['networkidle0', 'domcontentloaded']});
  });

  after(async function () {
    await page.close();
  });

  const eval_map_properties = async () => {
    return await page.evaluate(async () => {
      const map = await map_promise;
      const view = map.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      const extent = view.calculateExtent();
      const resolution = view.getResolution();
      return {
        center,
        zoom,
        extent,
        resolution,
      };
    });
  };

  const eval_map2_properties = async () => {
    return await page.evaluate(async () => {
      const map = await map_promise2;
      const view = map.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      const extent = view.calculateExtent();
      const resolution = view.getResolution();
      return {
        center,
        zoom,
        extent,
        resolution,
      };
    });
  };

  const resetMapAndEval = async () => {
    await page.evaluate(async () => await map_promise);
    await page.click('#resetButton');
    await page.waitForSelector('#resetButton.done');
    return await eval_map_properties();
  };

  const resetMapAndEval2 = async () => {
    await page.evaluate(async () => await map_promise2);
    await page.click('#resetButton2');
    await page.waitForSelector('#resetButton2.done');
    return await eval_map2_properties();
  };

  describe('should get correct view properties', async () => {
    it('map1', async () => {
      const info = await eval_map_properties();

      //zoom
      assert.equal(info.zoom, 17, `Unexpected zoom`);

      //center
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
  });

  describe('should get correct view properties after reset', async () => {
    it('map 1', async () => {
      const info = await resetMapAndEval();

      //zoom
      assert.equal(info.zoom, 18, `Unexpected zoom`);

      //center
      const expected_center = [1848200, 6308281];
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

    it('map 2 (two different viewports)', async () => {
      await page.setViewport({
        width: 680,
        height: 780,
      });
      let info = await resetMapAndEval2();

      //zoom
      assert.equal(info.zoom, 18, `Unexpected zoom`);

      //center
      const expected_center = [1848200, 6308281];
      const spatial_precision = 1;
      info.center.forEach((coord, idx) => {
        assert.approximately(
          coord,
          expected_center[idx],
          spatial_precision,
          `Unexpected center: ${info.center} != ${expected_center}`
        );
      });

      //resolution
      const expected_res = 0.6;
      const res_precision = 0.1;
      assert.approximately(
        info.resolution,
        expected_res,
        res_precision,
        `Unexpected resolution: ${info.resolution} != ${expected_res}`
      );

      // //extent
      // let expected_extent = [1848014, 6308132, 1848386, 6308430]
      // info.extent.forEach((coord, idx) => {
      //   assert.approximately(coord, expected_extent[idx], spatial_precision,
      //     `Unexpected extent: ${info.extent} != ${expected_extent}`);
      // });

      await page.setViewport(viewport);
      await page.reload({waitUntil: ['networkidle0', 'domcontentloaded']});
      info = await resetMapAndEval2();

      //zoom
      assert.equal(info.zoom, 18, `Unexpected zoom`);

      //center
      info.center.forEach((coord, idx) => {
        assert.approximately(
          coord,
          expected_center[idx],
          spatial_precision,
          `Unexpected center: ${info.center} != ${expected_center}`
        );
      });

      //resolution
      assert.approximately(
        info.resolution,
        expected_res,
        res_precision,
        `Unexpected resolution: ${info.resolution} != ${expected_res}`
      );

      // //extent
      // expected_extent = [1847799, 6308132, 1848601, 6308430]
      // info.extent.forEach((coord, idx) => {
      //   assert.approximately(coord, expected_extent[idx], spatial_precision,
      //     `Unexpected extent: ${info.extent} != ${expected_extent}`);
      // });
    });
  });

  describe('should get correct view properties and markers after reset', async () => {
    it('map 1 - set zoom, center, markers', async () => {
      const info = await page.evaluate(async () => {
        const map = await map_promise;
        await munimap.reset(map, {
          zoom: 16,
          center: [16.594188297821372, 49.20851336342541],
          markers: ['BMB01'],
        });
        const view = map.getView();
        const center = view.getCenter();
        const zoom = view.getZoom();
        const extent = view.calculateExtent();
        const resolution = view.getResolution();
        const markerLayer = map
          .getLayers()
          .getArray()
          .find((layer) => layer.get('id') === 'marker');
        const markers = markerLayer
          .getSource()
          .getFeatures()
          .map((f) => f.get('polohKod'));
        return {
          center,
          zoom,
          extent,
          resolution,
          markers,
        };
      });

      //zoom
      assert.equal(info.zoom, 16, `Unexpected zoom`);

      //center
      const expected_center = [1847256, 6310316];
      const spatial_precision = 1;
      info.center.forEach((coord, idx) => {
        assert.approximately(
          coord,
          expected_center[idx],
          spatial_precision,
          `Unexpected center: ${info.center} != ${expected_center}`
        );
      });

      //resolution
      const res_precision = 0.1;
      const expected_res = 2.4;
      assert.approximately(
        info.resolution,
        expected_res,
        res_precision,
        `Unexpected resolution: ${info.resolution} != ${expected_res}`
      );

      //markers
      assert.isArray(info.markers, 'Markers should be array');
      const expected_markers = ['BMB01'];
      assert.deepEqual(
        info.markers,
        expected_markers,
        `Unexpected markers: ${info.markers} != ${expected_markers}`
      );
    });

    it('map 2 - set zoom, center, markers', async () => {
      const info = await page.evaluate(async () => {
        const map = await map_promise2;
        await munimap.reset(map, {
          zoom: 16,
          center: [16.594188297821372, 49.20851336342541],
          markers: ['BMB01'],
        });
        const view = map.getView();
        const center = view.getCenter();
        const zoom = view.getZoom();
        const extent = view.calculateExtent();
        const resolution = view.getResolution();
        const markerLayer = map
          .getLayers()
          .getArray()
          .find((layer) => layer.get('id') === 'marker');
        const markers = markerLayer
          .getSource()
          .getFeatures()
          .map((f) => f.get('polohKod'));

        return {
          center,
          zoom,
          extent,
          resolution,
          markers,
        };
      });

      //zoom
      assert.equal(info.zoom, 16, `Unexpected zoom`);

      //center
      const expected_center = [1847256, 6310316];
      const spatial_precision = 1;
      info.center.forEach((coord, idx) => {
        assert.approximately(
          coord,
          expected_center[idx],
          spatial_precision,
          `Unexpected center: ${info.center} != ${expected_center}`
        );
      });

      //resolution
      const res_precision = 0.1;
      const expected_res = 2.4;
      assert.approximately(
        info.resolution,
        expected_res,
        res_precision,
        `Unexpected resolution: ${info.resolution} != ${expected_res}`
      );

      //markers
      assert.isArray(info.markers, 'Markers should be array');
      const expected_markers = ['BMB01'];
      assert.deepEqual(
        info.markers,
        expected_markers,
        `Unexpected markers: ${info.markers} != ${expected_markers}`
      );
    });
  });
});
