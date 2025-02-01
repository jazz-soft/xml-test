#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const PW = require('playwright');

const browsers = ['chromium', 'firefox', 'webkit', 'chrome', 'edge', 'msedge', 'safari'];
var n, s, x;
var tst = {}, bro = {}, xml = {}, xpath = {}, xpxpr = {}, xslt = {}, result = [], wait = [];
var print = false;

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
  else if (s == '--print') print = true;
  else if (s == '--xpath') { n++; xpxpr[process.argv[n]] = true; }
  else quit('Unknown command line option: ' + s);
}
if (!Object.keys(bro).length) for (s of ['chromium', 'firefox', 'webkit']) bro[s] = true;
if (Object.keys(xml).length) for (n of Object.keys(xml)) {
  x = { name: 'from file ' + n, xml: n, print: true };
  tst[x.name] = x;
}
if (Object.keys(xpath).length) for (n of Object.keys(xpath)) {
  x = { name: 'from file ' + n, xpath: n, print: true };
  tst[x.name] = x;
}
if (Object.keys(xpxpr).length) for (n of Object.keys(xpxpr)) {
  x = { name: 'from expression ' + n, xpath_expr: n, print: true };
  tst[x.name] = x;
}
if (!Object.keys(tst).length) tst = tests;

for (n of Object.keys(tst)) {
  x = tst[n];
  if (x.xml) x.xml = fs.readFileSync(x.xml, 'utf8').split(/\r?\n/).join('\n');
  if (x.xpath) x.xpath = fs.readFileSync(x.xpath, 'utf8');
  if (x.xpath_expr) x.xpath = x.xpath_expr;
  if (x.xslt) x.xslt = fs.readFileSync(x.xslt, 'utf8');
  if (print) x.print = true;
  for (s of Object.keys(bro)) wait.push(run(x, s));
}

Promise.all(wait).then(function() {
  console.log('Writing test-result.json ...');
  fs.writeFileSync(path.join(__dirname, 'test-result.json'), JSON.stringify(result, null, 2), 'utf8');
});

function quit(s) {
  console.error(s);
  process.exit();
}

async function run(tst, br) {
  var done;
  var finish = new Promise((resolve) => { done = resolve; });
  const browser = await launch(br, false);
  const out = { test: tst.name, browser: br, ver: browser.version()};
  const cons = [];
  const page = await browser.newPage();
  await page.addInitScript({ content: `(${inject.toString()})(${JSON.stringify(tst)})` });
  page.on('console', function(msg) {
    var x, k;
    if (msg.text() == 'Done!') done();
    else {
      try { x = JSON.parse(msg.text()); }
      catch (err) {/**/}
      if (typeof x == 'object') for (k of Object.keys(x)) out[k] = x[k];
      else cons.push(msg.text());
    }
  });
  await page.goto('about:blank');
  await finish;
  await browser.close();
  for (var msg of cons) format(out.browser, out.test, 'console:', msg);
  if (tst.print) {
    if (out.error != undefined) format(out.browser, out.test, 'error:', out.error);
    if (out.output != undefined) format(out.browser, out.test, 'output:', out.output);
  }
  console.log(out.pass ? '✅' : '❌', out.browser, out.test);
  result.push(out);
}

function format(a, b, c, msg) {
  if (('' + msg).includes('\n')) {
    console.log('✋', a, b, '>>>>', c);
    console.log(msg);
  }
  else console.log('✋', a, b, '>>>>', c, msg);
}

async function launch(br, h) {
  var opt = h ? { headless: false } : {};
  switch (br) {
    case 'chromium':
      return await PW.chromium.launch(opt);
    case 'firefox':
      return await PW.firefox.launch(opt);
    case 'safari':
    case 'webkit':
      return await PW.webkit.launch(opt);
    case 'chrome':
      opt.channel = 'chrome';
      return await PW.chromium.launch(opt);
    case 'edge':
    case 'msedge':
      opt.channel = 'msedge';
      return await PW.chromium.launch(opt);
    default:
      throw new Error(`Unknown browser: ${b}`);
  }
}

function inject(data) {
  var xml, out;
  const res_type = [
    'ANY_TYPE', 'NUMBER_TYPE', 'STRING_TYPE', 'BOOLEAN_TYPE', 'UNORDERED_NODE_ITERATOR_TYPE', 'ORDERED_NODE_ITERATOR_TYPE',
    'UNORDERED_NODE_SNAPSHOT_TYPE', 'ORDERED_NODE_SNAPSHOT_TYPE', 'ANY_UNORDERED_NODE_TYPE', 'FIRST_ORDERED_NODE_TYPE'
  ];

  try {
    if (data.xml) {
      var parser = new DOMParser();
      var serializer = new XMLSerializer();
      xml = parser.parseFromString(data.xml, "text/xml").documentElement;
      out = serializer.serializeToString(xml);
      console.log(JSON.stringify({ output: out, pass: out == data.xml }));
    }
    if (data.xpath) {
      var res = document.evaluate(data.xpath, document);
      switch (res.resultType) {
        case 1: out = res.numberValue; break;
        case 2: out = res.stringValue; break;
        case 3: out = res.booleanValue; break;
        default: out = res_type[res.resultType];
      }
      console.log(JSON.stringify({ output: out, pass: out == data.expect || data.expect == undefined }));
    }
  }
  catch (err) {
    console.log(JSON.stringify({ error: err.message, pass: false }));
  }
  console.log('Done!');
}