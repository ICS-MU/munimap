import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('pubtran.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/pubtran.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('map should have pubtran layer', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const pubtranLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'publictransport');

      return {hasPubtranLayer: !!pubtranLayer};
    });

    const {hasPubtranLayer} = info;
    assert.isTrue(hasPubtranLayer, 'Pubtran layer is missing in map!');
  });

  it('should show bubble on click', async () => {
    const info = await page.evaluate(async () => {
      const wrapTimeout = (promise, delay) => {
        const awaitTimeout = new Promise((resolve, reject) =>
          setTimeout(() => reject('Timeout!'), delay)
        );
        return Promise.race([promise, awaitTimeout]);
      };

      const map = await map_promise;
      const pubtranLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'publictransport');

      let result = {pixel: null};
      if (pubtranLayer) {
        const source = pubtranLayer.getSource();

        const promise = wrapTimeout(
          new Promise((resolve, reject) => {
            //let result = {pixel: null};
            const fn = () => {
              const extent = map.getView().calculateExtent();
              const features = source.getFeaturesInExtent(extent);
              const feature = features && features[0];
              let pixel = [];
              if (feature) {
                const map_pixel = map.getPixelFromCoordinate(
                  feature.getGeometry().getCoordinates()
                );
                const {x, y} = map.getTargetElement().getBoundingClientRect();
                pixel = [map_pixel[0] + x, map_pixel[1] + y];
              }

              resolve({pixel});
            };
            source.isLoading() ? source.on('mm:loadend', fn) : fn();
          }),
          5000
        );
        result = await promise;
      }

      return {result};
    });

    const {pixel} = info.result;
    await page.mouse.click(...pixel);

    const info2 = await page.evaluate(async () => {
      const map = await map_promise;
      if (map.getView().getAnimating()) {
        const promise = new Promise((resolve, reject) => {
          map.on('moveend', (evt) => {
            const bubbleEl = map
              .getTargetElement()
              .querySelector('.munimap-info-bubble');

            let contentEl;
            if (bubbleEl) {
              contentEl = bubbleEl.querySelector('.munimap-content');
            }

            resolve({
              isBubbbleShown: !!bubbleEl && bubbleEl.style.display !== 'none',
              content: (!!contentEl && contentEl.innerHTML) || null,
            });
          });
        });
        const result = await promise;
        return {
          ...result,
        };
      } else {
        const bubbleEl = map
          .getTargetElement()
          .querySelector('.munimap-info-bubble');

        let contentEl;
        if (bubbleEl) {
          contentEl = bubbleEl.querySelector('.munimap-content');
        }
        return {
          isBubbbleShown: !!bubbleEl && bubbleEl.style.display !== 'none',
          content: (!!contentEl && contentEl.innerHTML) || null,
        };
      }
    });

    const {isBubbbleShown, content} = info2;
    assert.isTrue(isBubbbleShown, 'Pubtran bubble not shown!');
    assert.isTrue(!!content, 'Pubtran bubbel has no content!');
  });
});
