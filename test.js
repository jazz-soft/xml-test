#!/usr/bin/env node
const PW = require('playwright');

var n, s;
const browsers = ['chromium', 'firefox', 'webkit', 'chrome', 'msedge'];
var bro = {};

for (n = 2; n  < process.argv.length; n++) {
  s = process.argv[n];
  if (browsers.includes(s)) bro[s] = true;
}
if (!Object.keys(bro).length) for (s of browsers) bro[s] = true;
for (s of Object.keys(bro)) run(s);

async function run(br) {
  var done;
  var finish = new Promise((resolve) => { done = resolve; });
  const browser = await launch(br, true);
  console.log(br, browser.version());

  const page = await browser.newPage();
  await page.addInitScript({ content: `(${inject.toString()})()` });
  page.on('console', function(msg) {
    console.log(br, '>>', msg);
    if (msg.text() == 'Done!') done();
  });
  await page.goto('about:blank');
  await finish;
  await browser.close();
}

async function launch(br, h) {
  var opt = h ? { headless: false } : {};
  switch (br) {
    case 'chromium':
      return await PW.chromium.launch(opt);
    case 'firefox':
      return await PW.firefox.launch(opt);
    case 'webkit':
      return await PW.webkit.launch(opt);
    case 'chrome':
      opt.channel = 'chrome';
      return await PW.chromium.launch(opt);
    case 'msedge':
      opt.channel = 'msedge';
      return await PW.chromium.launch(opt);
    default:
      throw new Error(`Unknown browser: ${b}`);
  }
}

function inject() {
  console.log('Done!');
}