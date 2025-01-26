#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const PW = require('playwright');

const browsers = ['chromium', 'firefox', 'webkit', 'chrome', 'msedge'];
var n, s, x;
var tst = {}, bro = {}, xml = {}, xpath = {}, xslt = {}, result = [];

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'tests.json'), 'utf8'));
const groups = {};
const tests = {};
for (x of list.groups) groups[x.name] = {};
for (x of list.tests) {
  tests[x.name] = x;
  groups[x.name.split('/')[0]][x.name] = x;
  if (x.xml) x.xml = path.join(__dirname, 'data', x.xml);
  if (x.xpath) x.xpath = path.join(__dirname, 'data', x.xpath);
  if (x.xslt) x.xslt = path.join(__dirname, 'data', x.xslt);
}
for (n = 2; n  < process.argv.length; n++) {
  s = process.argv[n];
  if (browsers.includes(s)) bro[s] = true;
  else if (s.endsWith('.xml')) xml[s] = true;
  else if (s.endsWith('.xpath')) xpath[s] = true;
  else if (s.endsWith('.xslt') || s.endsWith('.xsl')) xslt[s] = true;
  else if (tests[s]) tst[s] = tests[s];
  else if (groups[s]) for (x of Object.keys(groups[s])) tst[x] = tests[x];
  else quit('Unknown command line option: ' + s);
}
if (!Object.keys(bro).length) for (s of browsers) bro[s] = true;
if (Object.keys(xml).length) for (n of Object.keys(xml)) {
  x = { name: 'from file ' + n, xml: n };
  tst[x.name] = x;
}
if (!Object.keys(tst).length) tst = tests;

for (n of Object.keys(tst)) {
  x = tst[n];
  if (x.xml) x.xml = fs.readFileSync(x.xml, 'utf8').split(/\r?\n/).join('\n');
  if (x.xpath) x.xpath = fs.readFileSync(x.xpath, 'utf8');
  if (x.xslt) x.xslt = fs.readFileSync(x.xslt, 'utf8');
  for (s of Object.keys(bro)) run(x, s);
}

function quit(s) {
  console.error(s);
  process.exit();
}

async function run(tst, br) {
  var done;
  var finish = new Promise((resolve) => { done = resolve; });
  const browser = await launch(br, false);
  const out = { test: tst.name, browser: br, ver: browser.version()};
  const page = await browser.newPage();
  await page.addInitScript({ content: `(${inject.toString()})(${JSON.stringify(tst)})` });
  page.on('console', function(msg) {
    var x, k;
    if (msg.text() == 'Done!') done();
    else {
      try { x = JSON.parse(msg.text()); }
      catch (err) {/**/}
      if (typeof x == 'object') for (k of Object.keys(x)) out[k] = x[k];
      else console.log('✋', br, tst.name, '>>', msg.text());
    }
  });
  await page.goto('about:blank');
  await finish;
  await browser.close();
  console.log(out.pass ? '✅' : '❌', out.browser, out.test);
  result.push(out);
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
      var out = serializer.serializeToString(xml);
      console.log(JSON.stringify({ output: out, pass: out == data.xml }));
    }
  }
  catch (err) {
    console.log(JSON.stringify({ error: err.message, pass: false }));
  }
  console.log('Done!');
}