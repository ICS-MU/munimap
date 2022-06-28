import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('basemap.html', async () => {
  let page;

  before(async () => {
    page = await browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(`${test_server_url}/test/basemap.html`);
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should have colorful arcgis basemap', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const basemapLayer = map.getLayers().item(0);
      const basemapSource = basemapLayer.getSource();
      const layerId = basemapLayer.get('id');
      const url = basemapSource.getUrls()[0];

      const canvas = map.getTargetElement().querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const canvasFillStyle = ctx.fillStyle;

      return {
        layerId,
        url,
        canvasFillStyle,
      }
    })

    const {layerId, url, canvasFillStyle} = info;

    assert.equal(layerId, 'arcgis', 'Unexpected basemap layer id!');
    assert.include(url, 'arcgisonline', 'Unexpected basemap url!');
    assert.notEqual(
      canvasFillStyle,
      '#000000',
      'Unexpected canvas fill style!'
    );
  });
});
