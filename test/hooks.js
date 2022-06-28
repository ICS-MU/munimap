import puppeteer from 'puppeteer';

import express from 'express';
const app = express();
const port = 8080;

const puppeteer_opts = {
  headless: true,
  // slowMo: 100,
  // timeout: 0,
  args: ['--start-maximized', '--window-size=1920,1040'],
};

export const mochaHooks = {
  beforeAll: async () => {
    global.browser = await puppeteer.launch(puppeteer_opts);
    global.test_server_url = `http://localhost:8080/munimap/latest`;
    return new Promise((resolve, reject) => {
      app.use(express.static('dist'));
      app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
        resolve();
      });
    });
  },
  afterAll: async () => {
    browser.close();
    global.browser = null;
    global.test_server_url = null;
  },
};
