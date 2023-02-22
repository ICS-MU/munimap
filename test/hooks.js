import express from 'express';
import puppeteer from 'puppeteer';

const APP = express();
const PORT = process.env['npm_config_port']
  ? process.env['npm_config_port']
  : 8080;

const PUPPETEER_OPTS = {
  headless: true,
  // slowMo: 100,
  // timeout: 0,
  // devtools: true,
  args: [
    '--start-maximized',
    '--window-size=1920,1040',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-web-security',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials',
  ],
};

export const mochaHooks = {
  beforeAll: async () => {
    global.browser = await puppeteer.launch(PUPPETEER_OPTS);
    global.test_server_url = `http://localhost:${PORT}/munimap/latest`;
    return new Promise((resolve, reject) => {
      APP.use(express.static('dist'));
      APP.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server listening at http://localhost:${PORT}`);
        resolve();
      });
    });
  },
  afterAll: async () => {
    global.browser.close();
    global.browser = null;
    global.test_server_url = null;
  },
};
