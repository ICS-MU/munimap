import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('identifycallback.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/identifycallback.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should have identify layer', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const layers = map.getLayers().getArray();
      const identifyLayer = layers.find(
        (l) => l.get('id') === 'identify-layer'
      );

      return {
        hasLayer: !!identifyLayer,
      };
    });

    const {hasLayer} = info;
    assert.isTrue(hasLayer, 'Map has no identify layer!');
  });

  it('should have identify control', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const targetEl = map.getTargetElement();
      const controlEl = targetEl.querySelector('.munimap-identify');

      return {hasControl: !!controlEl};
    });

    const {hasControl} = info;
    assert.isTrue(hasControl, 'Map has no identify control!');
  });

  it('should set feature on click', async () => {
    const info = await page.evaluate(async () => {
      const wrapTimeout = (promise, delay) => {
        const awaitTimeout = new Promise((resolve, reject) =>
          setTimeout(() => reject('Timeout!'), delay)
        );
        return Promise.race([promise, awaitTimeout]);
      };

      const map = await map_promise;
      const {x, y} = map.getTargetElement().getBoundingClientRect();
      const size = map.getSize();
      const pixel = [x + size[0] / 2, y];
      const layer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'active-room');
      const source = layer.getSource();

      const promise = wrapTimeout(
        new Promise((resolve, reject) => {
          const fn = () => {
            map.forEachFeatureAtPixel(pixel, (feature, lyr) => {
              if (lyr === layer && map.getListeners('click')) {
                resolve([x + size[0] / 2, y + size[1] / 2]);
                return true;
              }
            });
          };
          source.isLoading() ? source.on('mm:loadend', fn) : fn();
        }),
        15000
      );

      return {
        pixel: await promise,
      };
    });

    const {pixel} = info;
    await page.mouse.click(...pixel, {button: 'left'});

    const info2 = await page.evaluate(async () => {
      const map = await map_promise;
      const layers = map.getLayers().getArray();
      const identifyLayer = layers.find(
        (l) => l.get('id') === 'identify-layer'
      );
      const identifySource = identifyLayer.getSource();
      const features = identifySource.getFeatures();
      const hasFeature = features && features.length > 0;
      return {hasFeature};
    });

    const {hasFeature} = info2;
    assert.isTrue(hasFeature, 'No identify feature!');
  });

  it('should call callback on click', async () => {
    await page.reload({waitUntil: ['networkidle0', 'domcontentloaded']});

    const info = await page.evaluate(async () => {
      const wrapTimeout = (promise, delay) => {
        const awaitTimeout = new Promise((resolve, reject) =>
          setTimeout(() => reject('Timeout!'), delay)
        );
        return Promise.race([promise, awaitTimeout]);
      };

      const map = await map_promise;

      const identifyCallback = (result) => {
        window['MUNIMAP_TEST_CB'] = result;
        return true;
      };

      await munimap.reset(map, {
        markers: ['BHA36'],
        identifyTypes: ['building', 'room', 'door'],
        identifyCallback,
      });

      const {x, y} = map.getTargetElement().getBoundingClientRect();
      const size = map.getSize();
      const pixel = [x + size[0] / 2, y];
      const layer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'building');
      const source = layer.getSource();

      const promise = wrapTimeout(
        new Promise((resolve, reject) => {
          const fn = () => {
            map.forEachFeatureAtPixel(pixel, (feature, lyr) => {
              if (lyr === layer && map.getListeners('click')) {
                resolve([x + size[0] / 2, y + size[1] / 2]);
                return true;
              }
            });
          };
          source.isLoading() ? source.on('mm:loadend', fn) : fn();
        }),
        3000
      );

      return {
        pixel: await promise,
      };
    });

    const {pixel} = info;

    await page.mouse.click(...pixel, {button: 'left'});

    const info2 = await page.evaluate(async () => ({
      ...window['MUNIMAP_TEST_CB'],
    }));

    const {coordsInMeters, coordsInDegrees, buildingCode, roomCode} = info2;
    assert.equal(buildingCode, 'BHA36', 'Unexpected building identification!');
    assert.equal(
      roomCode,
      'BHA36P01005',
      'Unexpected building identification!'
    );

    const expected3857 = [1844656.152, 6305258.249];
    const expected4326 = [16.57083, 49.17882];
    const expectedPrecision3857 = 0.1;
    const expectedPrecision4326 = 0.0001;
    coordsInMeters.forEach((coord, idx) => {
      assert.approximately(
        coord,
        expected3857[idx],
        expectedPrecision3857,
        'Unexpected identified coords in meters'
      );
    });
    coordsInDegrees.forEach((coord, idx) => {
      assert.approximately(
        coord,
        expected4326[idx],
        expectedPrecision4326,
        'Unexpected identified coords in meters'
      );
    });

    await page.click('.munimap-identify');

    const info3 = await page.evaluate(async () => ({
      ...window['MUNIMAP_TEST_CB'],
    }));

    assert.isEmpty(info3, 'Unexpected behavior for clearing identification!');
  });
});
