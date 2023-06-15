import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('faculties.html', async () => {
  let page;

  before(async () => {
    page = await global.global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/faculties.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should get correct marker label', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');
      const markerClusterLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker-cluster');

      let result = [];
      if (markerClusterLayer) {
        const clusterSource = markerClusterLayer.getSource();
        const styleFn = markerLayer.getStyle();
        result = styleFn(
          clusterSource.getFeatures()[0],
          map.getView().getResolution()
        );
        result = result.map((style) => style.getText().getText());
      }
      return {result};
    });

    const {result} = info;
    assert.include(result, 'Masarykova univerzita', 'Unexpected marker label!');
  });
});
