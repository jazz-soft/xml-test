#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const PW = require('playwright');

const browsers = ['chromium', 'firefox', 'webkit', 'chrome', 'msedge'];
var n, s, x;
var tst = {}, bro = {};
var xml_file, xpath_file, xslt_file;

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'tests.json'), 'utf8'));
const groups = {};
const tests = {};
for (x of list.groups) groups[x.name] = {};
for (x of list.tests) {
  tests[x.name] = x;
  groups[x.name.split('/')[0]][x.name] = x;
}
for (n = 2; n  < process.argv.length; n++) {
  s = process.argv[n];
  if (browsers.includes(s)) bro[s] = true;
  else if (s.endsWith('.xml')) {
    if (!xml_file) xml_file = s;
    else quit('Only a single .xml file is allowed');
  }
  else if (s.endsWith('.xpath')) {
    if (!xpath_file) xpath_file = s;
    else quit('Only a single .xpath file is allowed');
  }
  else if (s.endsWith('.xslt') || s.endsWith('.xsl')) {
    if (!xslt_file) xslt_file = s;
    else quit('Only a single .xslt file is allowed');
  }
  else if (tests[s]) tst[s] = tests[s];
  else if (groups[s]) for (x of Object.keys(groups[s])) tst[x] = tests[x];
  else quit('Unknown command line option: ' + s);
}
if (!Object.keys(bro).length) for (s of browsers) bro[s] = true;
if (!Object.keys(tst).length) tst = tests;

for (x of Object.keys(tst)) {
  for (s of Object.keys(bro)) run(x, s);
}

function quit(s) {
  console.error(s);
  process.exit();
}

async function run(tst, br) {
console.log(tst, br);
return;
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
    console.log(e.message);
  }
  console.log('Done!');
}