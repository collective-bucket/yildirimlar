#!/usr/bin/env node
"use strict";

// Syntax, data JSON, i18n parity (every data-i18n key has Turkish, no unused keys), internal links.
var assert = require("assert");
var childProcess = require("child_process");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var pub = path.join(root, "public");
var assets = path.join(pub, "assets");

fs.readdirSync(assets).filter(function (f) { return f.endsWith(".js"); }).forEach(function (file) {
  childProcess.execFileSync(process.execPath, ["--check", path.join(assets, file)], { stdio: "inherit" });
});

var data = {};
fs.readdirSync(path.join(pub, "data")).forEach(function (file) {
  var items = JSON.parse(fs.readFileSync(path.join(pub, "data", file), "utf8"));
  assert.ok(Array.isArray(items), file + " must be an array");
  data[file] = items;
});
function bilingual(value, where) {
  if (value == null) return;
  assert.ok(value.en && value.tr, where + " needs en and tr");
}
data["roadmap.json"].forEach(function (p, i) {
  ["title", "goal", "exit", "budget"].forEach(function (k) { bilingual(p[k], "roadmap[" + i + "]." + k); });
});
data["sources.json"].forEach(function (s, i) { assert.ok(s.type && s.title, "sources[" + i + "]"); bilingual(s.why, "sources[" + i + "].why"); });
function image(img, where) {
  if (!img) return;
  assert.ok(fs.existsSync(path.join(pub, img.src)), where + ".image missing: " + img.src);
  assert.ok(img.credit && img.credit.author && img.credit.license && img.credit.url, where + ".image needs credit");
}
data["journeys.json"].forEach(function (j, i) { ["region", "notes", "lesson"].forEach(function (k) { bilingual(j[k], "journeys[" + i + "]." + k); }); image(j.image, "journeys[" + i + "]"); });
data["communities.json"].forEach(function (c, i) {
  ["kind", "place", "model", "lesson"].forEach(function (k) { bilingual(c[k], "communities[" + i + "]." + k); });
  ["works", "fails"].forEach(function (k) { (c[k] || []).forEach(function (v, j) { bilingual(v, "communities[" + i + "]." + k + "[" + j + "]"); }); });
  image(c.image, "communities[" + i + "]");
});
data["principles.json"].forEach(function (p, i) { bilingual(p.title, "principles[" + i + "].title"); bilingual(p.body, "principles[" + i + "].body"); });
for (var page of fs.readdirSync(pub).filter(function (f) { return f.endsWith(".html"); })) {
  for (var s of fs.readFileSync(path.join(pub, page), "utf8").matchAll(/src="(\/assets\/img\/[^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(pub, s[1])), page + ": missing image " + s[1]);
  }
}
data["roles.json"].forEach(function (g, i) { bilingual(g.area, "roles[" + i + "]"); g.roles.forEach(function (r, j) { bilingual(r, "roles[" + i + "][" + j + "]"); }); });

var i18n = require(path.join(assets, "i18n.js"));
var html = fs.readdirSync(pub).filter(function (f) { return f.endsWith(".html"); });
var used = new Set();
var pages = new Set(html.map(function (f) { return f.replace(/\.html$/, ""); }));
var sources = html.map(function (f) { return fs.readFileSync(path.join(pub, f), "utf8"); });
sources.push(fs.readFileSync(path.join(assets, "layout.js"), "utf8"));
sources.forEach(function (text) {
  for (var m of text.matchAll(/data-i18n(?:-aria|-placeholder)?=\\?"([^"\\]+)/g)) used.add(m[1]);
  for (var l of text.matchAll(/href=\\?"\/([a-z0-9-]*)(?=[\\"#?])/g)) {
    assert.ok(l[1] === "" || pages.has(l[1]), "broken internal link: /" + l[1]);
  }
});
used.forEach(function (key) { assert.ok(i18n.tr[key], "missing tr: " + key); });
Object.keys(i18n.tr).forEach(function (key) { assert.ok(used.has(key), "unused tr: " + key); });

console.log("check ok: " + html.length + " pages, " + used.size + " i18n keys");
