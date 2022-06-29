import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

// TODO: invisible if small height

describe('maplinks.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/maplinks.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('map target should have visible maplinks', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const mapTarget = map.getTargetElement();
      const mapLinksEl = mapTarget.querySelector('.munimap-link');

      let count = 0;
      if (mapLinksEl) {
        const buttons = mapLinksEl.childNodes;
        count += buttons.length;
      }

      return {count};
    });

    const {count} = info;
    assert.equal(count, 2, 'Unexpected count of maplinks!');
  });
});
