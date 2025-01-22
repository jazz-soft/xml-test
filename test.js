#!/usr/bin/env node
const fs = require('fs');
const PW = require('playwright');

var n, s;
const browsers = ['chromium', 'firefox', 'webkit', 'chrome', 'msedge'];
var bro = {};
var xml_file, xml_data;

for (n = 2; n  < process.argv.length; n++) {
  s = process.argv[n];
  if (browsers.includes(s)) bro[s] = true;
  else if (s.endsWith('.xml') && !xml_file) xml_file = s;
}
if (xml_file) xml_data = fs.readFileSync(xml_file, 'utf8');

if (!Object.keys(bro).length) for (s of browsers) bro[s] = true;
for (s of Object.keys(bro)) run(s);

async function run(br) {
  var done;
  var finish = new Promise((resolve) => { done = resolve; });
  const browser = await launch(br, true);
  //console.log(br, browser.version());

  const page = await browser.newPage();
  const data = {};
  if (xml_data) data.xml = xml_data;
  await page.addInitScript({ content: `(${inject.toString()})(${JSON.stringify(data)})` });
  page.on('console', function(msg) {
    if (msg.text() == 'Done!') done();
    else console.log(br, '>>', msg);
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

function inject(data) {
  try {
    if (data.xml) {
      var parser = new DOMParser();
      var serializer = new XMLSerializer();
      var xml = parser.parseFromString(data.xml, "text/xml").documentElement;
      var str = serializer.serializeToString(xml);
      console.log('xml:', xml, str);
    }
  }
  catch (e) {
    console.log(e);
  }
  console.log('Done!');
}