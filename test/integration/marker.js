import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('marker.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/marker.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should contain markers', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');
      const markerSource = markerLayer.getSource();
      const features = markerSource.getFeatures();

      const locationCodes = features.map((f) => f.get('polohKod'));
      return {locationCodes};
    });

    const {locationCodes} = info;
    const expectedCodes = ['BMA01', 'BMB01N01057', 'BMB02P01D077'];
    assert.sameDeepMembers(locationCodes, expectedCodes, 'Unexpected markers!');
  });

  it('should have correct center and zoom', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const view = map.getView();
      return {
        center: view.getCenter(),
        zoom: view.getZoom(),
      };
    });

    const {center, zoom} = info;
    const expectedCenter = [1848338.74285, 6308461.4241];
    const expectedPrecision = 0.1;
    const expectedZoom = 16;

    assert.equal(zoom, expectedZoom, 'Unexpected zoom!');
    center.forEach((coord, idx) => {
      assert.approximately(
        coord,
        expectedCenter[idx],
        expectedPrecision,
        `Unexpected center: ${center} != ${expectedCenter}`
      );
    });
  });
});
