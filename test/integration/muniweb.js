import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('muniweb.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/muniweb.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  beforeEach(async () => {
    await page.reload({waitUntil: ['networkidle0', 'domcontentloaded']});
  });

  after(async function () {
    await page.close();
  });

  describe('should get correct clustered markers after reset', async () => {
    it('set markers, zoomTo', async () => {
      const markers = ['BHA35', 'BMB04', 'BHA34'];
      const info = await page.evaluate(async () => {
        const map = await map_promise_muni;
        await munimap.reset(map, {
          markers: ['BHA35', 'BMB04', 'BHA34'],
          zoomTo: ['BHA35', 'BMB04', 'BHA34'],
        });
        const view = map.getView();
        const center = view.getCenter();
        const zoom = view.getZoom();
        const extent = view.calculateExtent();
        const resolution = view.getResolution();
        const clusterLayer = map
          .getLayers()
          .getArray()
          .find((layer) => layer.get('id') === 'marker-cluster');
        const clusterFeatures = clusterLayer
          .getSource()
          .getFeatures()
          .map((f) => f.get('features'));
        // array of locCodes of all clustered markers - for easier handling
        const viewMarkers = clusterFeatures
          .map((feature) => feature.map((marker) => marker.get('polohKod')))
          .flat();
        return {
          center,
          zoom,
          extent,
          resolution,
          viewMarkers,
        };
      });

      // center
      const expected_center = [1846322, 6306674];
      const spatial_precision = 1;
      info.center.forEach((coord, idx) => {
        assert.approximately(
          coord,
          expected_center[idx],
          spatial_precision,
          `Unexpected center: ${info.center} != ${expected_center}`
        );
      });

      // zoom
      assert.equal(info.zoom, 14, `Unexpected zoom`);

      // extent
      const expected_extent = [1842629, 6304395, 1850015, 6308953];
      info.extent.forEach((coord, idx) => {
        assert.approximately(
          coord,
          expected_extent[idx],
          spatial_precision,
          `Unexpected extent: ${info.extent} != ${expected_extent}`
        );
      });

      // resolution
      const res_precision = 0.1;
      const expected_res = 9.5;
      assert.approximately(
        info.resolution,
        expected_res,
        res_precision,
        `Unexpected resolution: ${info.resolution} != ${expected_res}`
      );

      // clustered markers
      assert.includeMembers(
        info.viewMarkers,
        markers,
        `${markers} should be clustered.`
      );
    });
  });
});
