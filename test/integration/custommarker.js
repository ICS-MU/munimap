import {assert} from 'chai';
import {parse} from 'node-html-parser';

const viewport = {
  width: 1600,
  height: 800,
};

describe('custommarker.html', async () => {
  let page;

  before(async () => {
    page = await global.global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/custommarker.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should have 3 custom and 1 normal markers', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');
      const markerSource = markerLayer.getSource();
      const features = markerSource.getFeatures();

      let count = 0;
      let customCount = 0;
      let countWithIcon = 0;
      features.forEach((feature) => {
        const featureType = feature.get('featureType');
        const ftName = featureType.name;
        if (ftName === 'custom-marker') {
          customCount += 1;
        } else {
          count += 1;
        }

        if (ftName === 'custom-marker' && !!feature.get('icon')) {
          countWithIcon += 1;
        }
      });

      return {
        count,
        customCount,
        countWithIcon,
      };
    });

    const {count, customCount} = info;

    assert.equal(count, 1, 'Unexpected number of non-custom markers!');
    assert.equal(customCount, 3, 'Unexpected number of custom markers!');
  });

  it('should have one custom marker with custom icon', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');
      const markerSource = markerLayer.getSource();
      const features = markerSource.getFeatures();

      let countWithIcon = 0;
      features.forEach((feature) => {
        const featureType = feature.get('featureType');
        const ftName = featureType.name;
        if (ftName === 'custom-marker' && !!feature.get('icon')) {
          countWithIcon += 1;
        }
      });

      return {
        countWithIcon,
      };
    });

    const {countWithIcon} = info;
    assert.equal(
      countWithIcon,
      1,
      'Unexpected number of custom markers with custom icons!'
    );
  });

  it('should change interaction with onClick function', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');
      const markerSource = markerLayer.getSource();
      const features = markerSource.getFeatures();

      const feature = features.find((feature) => !!feature.get('onClick'));
      const onClick = feature.get('onClick');
      const result = onClick();

      return {
        ...result,
      };
    });

    const {animation} = info;
    assert.equal(animation, 'centerTo', 'Unexpected onClick result!');
  });

  it('should interact on click', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const center = map.getView().getCenter();
      const resolution = map.getView().getResolution();
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');
      const markerSource = markerLayer.getSource();
      const features = markerSource.getFeatures();

      const feature = features.find((feature) => !!feature.get('onClick'));

      let pixel = [];
      if (feature) {
        const map_pixel = map.getPixelFromCoordinate(
          feature.getGeometry().getCoordinates()
        );
        const {x, y} = map.getTargetElement().getBoundingClientRect();
        pixel = [map_pixel[0] + x, map_pixel[1] + y];
      }
      return {
        pixel,
        center,
        resolution,
      };
    });

    const {pixel, resolution} = info;

    await page.mouse.click(...pixel);

    const info2 = await page.evaluate(async () => {
      const wrapTimeout = (promise, delay) => {
        const awaitTimeout = new Promise((resolve, reject) =>
          setTimeout(() => reject('Timeout!'), delay)
        );
        return Promise.race([promise, awaitTimeout]);
      };

      const map = await map_promise;
      if (map.getView().getAnimating()) {
        const promise = wrapTimeout(
          new Promise((resolve, reject) => {
            map.on('moveend', (evt) => {
              resolve({
                center2: map.getView().getCenter(),
                resolution2: map.getView().getResolution(),
              });
            });
          }),
          5000
        );
        const result = await promise;
        return {
          ...result,
        };
      } else {
        return {
          center2: map.getView().getCenter(),
          resolution2: map.getView().getResolution(),
        };
      }
    });

    const {center2, resolution2} = info2;
    const expectedCenter = [1851374.46, 6309191.99];
    const spatialPrecision = 0.2;
    center2.forEach((coord, idx) => {
      assert.approximately(
        coord,
        expectedCenter[idx],
        spatialPrecision,
        `Unexpected center!`
      );
    });

    const precision = 0.1;
    assert.approximately(
      resolution2,
      resolution,
      precision,
      'Unexpected resolution!'
    );
  });

  it('should show bubble on click', async () => {
    await page.reload({waitUntil: ['networkidle0', 'domcontentloaded']});
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');
      const markerSource = markerLayer.getSource();
      const features = markerSource.getFeatures();

      const feature = features.find(
        (feature) => !!feature.get('detail') && !feature.get('onClick')
      );

      let pixel = [];
      let detail = null;
      if (feature) {
        const map_pixel = map.getPixelFromCoordinate(
          feature.getGeometry().getCoordinates()
        );
        const {x, y} = map.getTargetElement().getBoundingClientRect();
        pixel = [map_pixel[0] + x, map_pixel[1] + y];
        detail = feature.get('detail');
      }

      return {
        pixel,
        detail,
      };
    });

    const {pixel, detail} = info;

    await page.mouse.click(...pixel);

    const info2 = await page.evaluate(async () => {
      const wrapTimeout = (promise, delay) => {
        const awaitTimeout = new Promise((resolve, reject) =>
          setTimeout(() => reject('Timeout!'), delay)
        );
        return Promise.race([promise, awaitTimeout]);
      };

      const map = await map_promise;
      if (map.getView().getAnimating()) {
        const promise = wrapTimeout(
          new Promise((resolve, reject) => {
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
          }),
          5000
        );
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
    const parsedDetail = parse(detail);
    const parsedContent = parse(content);

    const processedDetail = {
      parentNode: parsedDetail.parentNode,
      childNodes: parsedDetail.childNodes.map((n) => {
        return {
          tagName: n.tagName,
          attributes: n.attributes,
        };
      }),
    };
    const processedContent = {
      parentNode: parsedContent.parentNode,
      childNodes: parsedContent.childNodes.map((n) => {
        return {
          tagName: n.tagName,
          attributes: n.attributes,
        };
      }),
    };

    assert.deepEqual(
      processedDetail,
      processedContent,
      'Unexpected content of bubble!'
    );
    assert.isTrue(isBubbbleShown, 'Bubble not shown for feature with detail!');
  });
});
