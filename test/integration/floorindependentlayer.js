import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('floorindependentlayer.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/floorindependentlayer.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should have special layer', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const layers = map.getLayers().getArray();
      const geojsonLayer = layers.find((l) => {
        const s = l.getSource();
        return s.getUrl && s.getUrl() && s.getUrl().includes('layer.geojson');
      });

      return {
        hasLayer: !!geojsonLayer,
      };
    });

    const {hasLayer} = info;
    assert.isTrue(hasLayer, 'Map has no independent layer!');
  });

  it('should have features from geojson', async () => {
    const info = await page.evaluate(async () => {
      const wrapTimeout = (promise, delay) => {
        const awaitTimeout = new Promise((resolve, reject) =>
          setTimeout(() => reject('Timeout!'), delay)
        );
        return Promise.race([promise, awaitTimeout]);
      };

      const map = await map_promise;
      const layers = map.getLayers().getArray();
      const geojsonLayer = layers.find((l) => {
        const s = l.getSource();
        return s.getUrl && s.getUrl() && s.getUrl().includes('layer.geojson');
      });
      const source = geojsonLayer.getSource();

      const promise = wrapTimeout(
        new Promise((resolve, reject) => {
          let hasFeatures = false;
          const fn = () => {
            const features = source.getFeatures();
            if (features && features.length > 0) {
              hasFeatures = true;
            }
            source.un('addfeature', fn);
            resolve(hasFeatures);
          };
          source.on('addfeature', fn);
        }),
        3000
      );

      const hasFeatures = await promise;
      return {hasFeatures};
    });

    const {hasFeatures} = info;
    assert.isTrue(hasFeatures, 'GeoJSON layer has no features!');
  });
});
