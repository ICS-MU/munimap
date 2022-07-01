import {assert} from 'chai';

const viewport = {
  width: 1600,
  height: 800,
};

describe('language.html', async () => {
  let page;

  before(async () => {
    page = await global.browser.newPage();
    await page.setViewport(viewport);
    const response = await page.goto(
      `${global.test_server_url}/example/language.html`
    );
    assert.equal(response.status(), 200, 'Unexpected HTTP status code');
  });

  after(async function () {
    await page.close();
  });

  it('controls should have english tooltips', async () => {
    const info = await page.evaluate(async () => {
      const map = await map_promise;
      const targetEl = map.getTargetElement();
      const toolbar = targetEl.querySelector('.munimap-tool-bar');
      const initExtent = targetEl.querySelector('.munimap-initial-extent');

      const olControls = map.getControls().getArray();
      const controlElements = olControls.map((c) => c.element);
      controlElements.push(toolbar, initExtent);

      let titles = new Set();
      controlElements.forEach((el) => {
        titles.add(el.title);
        if (el.childNodes.length > 0) {
          el.childNodes.forEach((childNode) => titles.add(childNode.title));
        }
      });

      //remove undefined or null or empty string
      titles = [...titles].filter((i) => i);
      return {titles};
    });
    const {titles} = info;
    const expectedTitles = [
      'Zoom in',
      'Zoom out',
      'Attributions',
      'Toggle fullscreen',
      'Initial extent',
    ];
    assert.sameDeepMembers(
      titles,
      expectedTitles,
      'Unexpected control title translation!'
    );
  });
});
