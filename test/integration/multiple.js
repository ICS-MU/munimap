import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('multiple.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/multiple.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should be rendered two maps', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const map2 = await map_promise2;

      return {
        isRendered: map.isRendered(),
        isRendered2: map2.isRendered(),
      };
    });

    const {isRendered, isRendered2} = info;
    assert.isTrue(isRendered, 'First map is not rendered!');
    assert.isTrue(isRendered2, 'Second map is not rendered!');
  });

  it('should not interact with each other', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const map2 = await map_promise2;

      const zoomBefore = map.getView().getZoom();
      const zoom2Before = map2.getView().getZoom();
      map2.getView().setResolution(50);
      const zoomAfter = map.getView().getZoom();
      const zoom2After = map2.getView().getZoom();

      return {
        zoomBefore,
        zoomAfter,
        zoom2Before,
        zoom2After,
      };
    });

    const {zoomBefore, zoomAfter, zoom2Before} = info;
    const expectedZoom = 17;
    const expectedZoom2 = 19;
    assert.equal(
      zoomBefore,
      expectedZoom,
      'Unexpected zoom for first map before second changed!'
    );
    assert.equal(
      zoom2Before,
      expectedZoom2,
      'Unexpected zoom for second map before second changed!'
    );
    assert.equal(
      zoomBefore,
      zoomAfter,
      'Unexpected zoom for first map when second changed!'
    );
  });

  it('each map should have its own controls', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const map2 = await map_promise2;

      const targetEl = map.getTargetElement();
      const toolbar = targetEl.querySelector('#muni-tool-bar');
      const initExtent = targetEl.querySelector('#muni-init-extent');
      const olControls = map.getControls().getArray();
      let controls = [...olControls, toolbar, initExtent];
      controls = [...controls].filter((i) => i);

      const targetEl2 = map2.getTargetElement();
      const toolbar2 = targetEl2.querySelector('#muni-tool-bar');
      const initExtent2 = targetEl2.querySelector('#muni-init-extent');
      const olControls2 = map2.getControls().getArray();
      let controls2 = [...olControls2, toolbar2, initExtent2];
      controls2 = [...controls2].filter((i) => i);

      return {
        controlsCount: controls.length,
        controls2Count: controls2.length,
      };
    });

    const {controlsCount, controls2Count} = info;
    const expectedCount = 5;
    assert.equal(
      controlsCount,
      expectedCount,
      'Unexpected controls count for first map!'
    );
    assert.equal(
      controls2Count,
      expectedCount,
      'Unexpected controls count for second map!'
    );
  });
});
