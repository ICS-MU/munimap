import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('markerlabel.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/markerlabel.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should contains markers', async () => {
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
    const expectedCodes = ['BVB02N01015b', 'BVB02N01007'];
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
    const expectedCenter = [1847622.8484, 6309734.7957];
    const expectedPrecision = 0.1;
    const expectedZoom = 20;

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

  it('should have correct labels', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');

      let result = [];
      if (markerLayer) {
        const markerSource = markerLayer.getSource();
        const styleFn = markerLayer.getStyle();
        const features = markerSource.getFeatures();
        features.forEach((f) => {
          result.push(styleFn(f, map.getView().getResolution()));
        });
        if (result) {
          result = result.map((style) => {
            const r = [];
            if (Array.isArray(style)) {
              style.forEach((s) => {
                if (!s.getText().getFont().includes('MunimapFont')) {
                  r.push(s.getText().getText());
                }
              });
            } else {
              if (!style.getText().getFont().includes('MunimapFont')) {
                r.push(style.getText().getText());
              }
            }
            return r;
          });
        }
      }
      return {result: result.flat()};
    });

    const {result} = info;
    const expected = ['Doktorské studium', 'Studijní oddělení'];
    assert.sameDeepMembers(result, expected, 'Unexpected label for markers.');
  });
});
