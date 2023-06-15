import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('cluster.html', async () => {
  let page;

  before(async () => {
    page = await global.global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/cluster.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('should have clusters with custom icons and colors', async () => {
    const info = await page.evaluate(async () => {
      const wrapTimeout = (promise, delay) => {
        const awaitTimeout = new Promise((resolve, reject) =>
          setTimeout(() => reject('Timeout!'), delay)
        );
        return Promise.race([promise, awaitTimeout]);
      };

      const map = await map_promise;
      const markerClusterLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker-cluster');
      const markerLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker');

      const buildingLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'building');

      const isMarked = (f) => {
        if (!markerLayer || markerLayer.getSource().getFeatures() < 1) {
          return false;
        }
        const markers = markerLayer.getSource().getFeatures();
        const innerFeatures = f.get('features');
        return (
          innerFeatures &&
          innerFeatures.some((inner) => markers.includes(inner))
        );
      };

      const isCustom = (feature) => {
        const fType = feature.get('featureType');
        return fType.name === 'custom-marker';
      };

      const promise = wrapTimeout(
        new Promise((resolve, reject) => {
          const fn = () => {
            const clusterSource = markerClusterLayer.getSource();
            const styleFn = markerClusterLayer.getStyle();
            const features = clusterSource.getFeatures();
            let result = [];

            result = features.map((f) => {
              const style = styleFn(f, map.getView().getResolution());
              let innerFeatures = f.get('features');

              if (isMarked(f)) {
                innerFeatures = innerFeatures.filter(
                  (feat) =>
                    markerLayer.getSource().getFeatures().indexOf(feat) >= 0
                );
              }

              const r = {
                color: null,
                imgSrc: null,
                featuresCount: innerFeatures.length,
                isMarked: isMarked(f),
                isCustom:
                  innerFeatures.length === 1 && isCustom(innerFeatures[0]),
              };

              if (Array.isArray(style)) {
                style.forEach((s) => {
                  const image = s.getImage();
                  if (image && image.getSrc) {
                    r.imgSrc = image.getSrc();
                  } else if (
                    s.getText &&
                    !s.getText().getFont().includes('MunimapFont')
                  ) {
                    r.color = s.getText().getFill().getColor();
                  }
                });
              } else {
                const image = style.getImage();
                if (image && image.getSrc) {
                  r.imgSrc = image.getSrc();
                } else if (
                  style.getText &&
                  !style.getText().getFont().includes('MunimapFont')
                ) {
                  r.color = style.getText().getFill().getColor();
                }
              }
              return r;
            });
            resolve(result);
          };

          //clusters are updated on building's count change
          const source = buildingLayer.getSource();
          if (source.isLoading()) {
            buildingLayer.getSource().on(['mm:loadend'], fn);
          } else {
            fn();
          }
        }),
        3000
      );

      let result = [];
      if (markerClusterLayer) {
        result = await promise;
      }

      return {result};
    });

    let {result} = info;

    const expectedMarkedSingle = 'img/rectangle_blue.png';
    const expectedMarkedMultiple = 'img/rectangle_purple.png';
    const expectedUnmarkedSingle = 'img/triangle_orange.png';
    const expectedUnmarkedMultiple = 'img/triangle_cyan.png';
    const expectedMarkedSingleColor = '#0000dc';
    const expectedMarkedMultipleColor = 'purple';
    const expectedUnmarkedSingleColor = 'orange';
    const expectedUnmarkedMultipleColor = 'darkcyan';

    result = result.filter((r) => !r.isCustom);
    result.forEach((r) => {
      const {color, imgSrc, featuresCount, isMarked} = r;
      if (featuresCount === 1) {
        //single
        if (isMarked) {
          assert.include(
            imgSrc,
            expectedMarkedSingle,
            'Unexpected src for single marked cluster icon!'
          );
          assert.include(
            color,
            expectedMarkedSingleColor,
            'Unexpected color for single marked cluster label!'
          );
        } else {
          assert.include(
            imgSrc,
            expectedUnmarkedSingle,
            'Unexpected src for single unmarked cluster icon!'
          );
          assert.include(
            color,
            expectedUnmarkedSingleColor,
            'Unexpected color for single unmarked cluster label!'
          );
        }
      } else if (featuresCount > 1) {
        //multiple
        if (isMarked) {
          assert.include(
            imgSrc,
            expectedMarkedMultiple,
            'Unexpected src for multiple marked cluster icon!'
          );
          assert.include(
            color,
            expectedMarkedMultipleColor,
            'Unexpected color for multiple marked cluster label!'
          );
        } else {
          assert.include(
            imgSrc,
            expectedUnmarkedMultiple,
            'Unexpected src for multiple unmarked cluster icon!'
          );
          assert.include(
            color,
            expectedUnmarkedMultipleColor,
            'Unexpected color for multiple unmarked cluster label!'
          );
        }
      }
    });
  });

  it('should have custom distance', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      await munimap.reset(map, {
        cluster: {distance: 200},
      });
      const markerClusterLayer = map
        .getLayers()
        .getArray()
        .find((l) => l.get('id') === 'marker-cluster');
      const source = markerClusterLayer.getSource();
      return {distance: source.getDistance()};
    });

    const {distance} = info;
    const expectedDistance = 200;
    assert.equal(distance, expectedDistance, 'Unexpected cluster distance!');
  });
});
