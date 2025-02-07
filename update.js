#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const link = 'https://github.com/jazz-soft/xml-test/blob/main/tests.json#L';
const list_file = path.join(__dirname, 'tests.json');
const hist_file = path.join(__dirname, 'data', 'history.json');
const data_file = path.join(__dirname, 'test-result.json');
const rdme_file = path.join(__dirname, 'README.md');
const list_text = fs.readFileSync(list_file, 'utf8');
const list = JSON.parse(list_text);
const hist = fs.existsSync(hist_file) ? JSON.parse(fs.readFileSync(hist_file, 'utf8')) : {};
const data = JSON.parse(fs.readFileSync(data_file, 'utf8'));
const text = list_text.split(/\r?\n/);
const report = { chromium: true, firefox: true, webkit: true };
const new_hist = {};
const order = [];
const index = {};
const groups = {};
const bros = ['chromium', 'firefox', 'webkit'];
const rdme = [];
const table = [];
var k, x, s, w;
for (x of list.tests) {
  order.push(x.name);
  index[x.name] = x;
}
for (k = 0; k < text.length; k++) {
  w = text[k].match(/"name":\s*"([^"]*)"/);
  if (w && index[w[1]]) index[w[1]].line = k + 1;
}

for (x of data) if (index[x.test] && report[x.browser]) record(x);
for (k of order) new_hist[k] = hist[k];
fs.writeFileSync(hist_file, JSON.stringify(new_hist, null, 2), 'utf8');

for (x of list.groups) groups[x.name] = x.descr;
table.push('<table>');
s = '';
for (k of bros) s += `<th>❌ ${k}</th><th>✅ ${k}</th>`;
table.push(`<tr>${s}</tr>`);
for (x of list.tests) {
  table.push(`<tr><td colspan="${bros.length * 2}"><a href="${link}${x.line}">${groups[x.name.split('/')[0]]}: ${x.descr}</a></td></tr>`);
  s = '';
  for (k of bros) {
    w = fail_pass(x.name, k);
    s += `<td>${w[0] ? '❌ ' + w[0].split('.').slice(0, 2).join('.') : ''}</td><td>${w[1] ? '✅ ' + w[1].split('.').slice(0, 2).join('.') : ''}</td>`;
  }
  table.push(`<tr>${s}</tr>`);
}
table.push('</table>');
x = true;
for (s of fs.readFileSync(rdme_file, 'utf8').split(/\r?\n/)) {
  if (s == '<table>') {
    x = false;
    rdme.push(table.join('\n'));
  }
  if (x) rdme.push(s);
  if (s == '</table>') x = true;
}

fs.writeFileSync(rdme_file, rdme.join('\n'), 'utf8');

function record(x) {
  if (!hist[x.test]) hist[x.test] = { chromium: {}, firefox: {}, webkit: {} };
  hist[x.test][x.browser][x.ver] = x.pass;
}

function fail_pass(x, b) {
  var f0, f1, p0, p1, n;
  if (!hist[x] || !hist[x][b]) return [];
  for (n of Object.keys(hist[x][b]).sort()) {
    if (hist[x][b][n]) { f0 = undefined; p1 = n; if (!p0) p0 = n; }
    else { p0 = undefined; f1 = n; if (!f0) f0 = n; }
  }
  return !f1 || !p1 || p1 > f1 ? [f1, p0] : [f0, p1];
}