import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('optpoi.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/optpoi.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should contain optpoi markers', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');
      const markerSource = markerLayer.getSource();
      const features = markerSource.getFeatures();

      const types = features.map((f) => f.get('poiType'));

      return {types};
    });

    const {types} = info;
    const expectedPoiType = 'print-center';
    types.forEach((t) =>
      assert.equal(t, expectedPoiType, 'Unexpected poi type!')
    );
  });
});
