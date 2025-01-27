#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const list_file = path.join(__dirname, 'tests.json');
const hist_file = path.join(__dirname, 'data', 'history.json');
const data_file = path.join(__dirname, 'test-result.json');
const list = JSON.parse(fs.readFileSync(list_file, 'utf8'));
const hist = fs.existsSync(hist_file) ? JSON.parse(fs.readFileSync(hist_file, 'utf8')) : {};
const data = JSON.parse(fs.readFileSync(data_file, 'utf8'));
const report = { chromium: true, firefox: true, webkit: true };
const new_hist = {};
const order = [];
const index = {};
var k, x;
for (x of list.tests) {
  order.push(x.name);
  index[x.name] = x;
}

for (x of data) if (index[x.test] && report[x.browser]) record(x);
for (k of order) new_hist[k] = hist[k];
fs.writeFileSync(hist_file, JSON.stringify(new_hist, null, 2), 'utf8');

function record(x) {
  if (!hist[x.test]) hist[x.test] = { chromium: {}, firefox: {}, webkit: {} };
  hist[x.test][x.browser][x.ver] = x.pass;
}