(function () {
  "use strict";

  var CENTER = [36.6216, 29.1164];
  var STORE = "daireler-mine";
  var tl = new Intl.NumberFormat("tr-TR");
  var state = { all: [], sort: "price", rooms: "all", view: "cards", picked: [], mine: load() };
  var $ = function (id) { return document.getElementById(id); };

  function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state.mine)); } catch (e) { /* private mode */ } }
  function mine(id) { return state.mine[id] || (state.mine[id] = { stars: 0, note: "" }); }

  function km(a, b) {
    var r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return tl.format(n) + " ₺"; }
  function yn(v) { return v ? "Var" : "Yok"; }
  function eh(v) { return v ? "Evet" : "Hayır"; }
  function date(s) { return new Date(s + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }); }
  function list(a) { return a && a.length ? a.join(", ") : "—"; }

  // Comparison rows: get = display value; num = comparable number; better = "low" | "high".
  var ROWS = [
    { k: "Fiyat", get: function (d) { return money(d.price); }, num: function (d) { return d.price; }, better: "low" },
    { k: "₺/m² (net)", get: function (d) { return money(d.ppm); }, num: function (d) { return d.ppm; }, better: "low" },
    { k: "₺/m² (brüt)", get: function (d) { return money(Math.round(d.price / d.gross)); }, num: function (d) { return d.price / d.gross; }, better: "low" },
    { k: "Net / brüt m²", get: function (d) { return d.net + " / " + d.gross; }, num: function (d) { return d.net; }, better: "high" },
    { k: "Oda", get: function (d) { return d.rooms; } },
    { k: "Bina yaşı", get: function (d) { return d.ageLabel; }, num: function (d) { return d.age; }, better: "low" },
    { k: "Kat", get: function (d) { return d.floor + " · " + d.floors + " katlı"; } },
    { k: "Konum", get: function (d) { return d.area; } },
    { k: "Merkeze uzaklık", get: function (d) { return d.dist.toFixed(1) + " km"; }, num: function (d) { return d.dist; }, better: "low" },
    { k: "Aidat", get: function (d) { return d.dues == null ? "Belirtilmemiş" : money(d.dues); }, num: function (d) { return d.dues; }, better: "low" },
    { k: "Site içi", get: function (d) { return eh(d.site); } },
    { k: "Havuz", get: function (d) { return yn(d.pool); } },
    { k: "Eşyalı", get: function (d) { return eh(d.furnished); } },
    { k: "Turizm belgesi", get: function (d) { return yn(d.tourism); } },
    { k: "Krediye uygun", get: function (d) { return eh(d.loan); } },
    { k: "Tapu", get: function (d) { return d.deed; } },
    { k: "Manzara", get: function (d) { return list(d.view); } },
    { k: "Cephe", get: function (d) { return list(d.facade); } },
    { k: "Asansör", get: function (d) { return yn(d.elevator); } },
    { k: "Otopark", get: function (d) { return d.parking; } },
    { k: "Isınma", get: function (d) { return d.heating; } },
    { k: "Takas", get: function (d) { return eh(d.swap); } },
    { k: "Öne çıkanlar", get: function (d) { return list(d.extras); } },
    { k: "İlan tarihi", get: function (d) { return date(d.listed); } },
    { k: "Puanım", get: function (d) { var s = mine(d.id).stars; return s ? "★".repeat(s) : "—"; }, num: function (d) { return mine(d.id).stars || null; }, better: "high" },
    { k: "Notum", get: function (d) { return mine(d.id).note || "—"; } }
  ];

  var SORTS = {
    price: function (a, b) { return a.price - b.price; },
    ppm: function (a, b) { return a.ppm - b.ppm; },
    net: function (a, b) { return b.net - a.net; },
    age: function (a, b) { return a.age - b.age; },
    dist: function (a, b) { return a.dist - b.dist; },
    listed: function (a, b) { return b.listed.localeCompare(a.listed); },
    stars: function (a, b) { return mine(b.id).stars - mine(a.id).stars; }
  };

  function visible() {
    return state.all
      .filter(function (d) { return state.rooms === "all" || d.rooms === state.rooms; })
      .sort(function (a, b) { return SORTS[state.sort](a, b) || a.price - b.price; });
  }

  function card(d) {
    var m = mine(d.id), picked = state.picked.indexOf(d.id) > -1;
    var chips = [
      ["Site içi", d.site], ["Havuz", d.pool], ["Eşyalı", d.furnished], ["Turizm belgesi", d.tourism], ["Krediye uygun", d.loan]
    ].map(function (c) { return "<li class=\"" + (c[1] ? "yes" : "") + "\">" + (c[1] ? "✓ " : "✗ ") + c[0] + "</li>"; }).join("");
    var stars = [1, 2, 3, 4, 5].map(function (n) {
      return "<button type=\"button\" data-star=\"" + n + "\" class=\"" + (n <= m.stars ? "on" : "") + "\" aria-label=\"" + n + " yıldız\">★</button>";
    }).join("");
    return "<article class=\"card" + (picked ? " picked" : "") + "\" data-id=\"" + d.id + "\">" +
      "<div class=\"card-head\"><span class=\"no\">#" + d.no + "</span>" +
      "<div class=\"price\">" + money(d.price) + "</div>" +
      "<div class=\"ppm\">" + money(d.ppm) + " / net m²</div>" +
      "<h3>" + esc(d.title) + "</h3><div class=\"where\">" + esc(d.area) + " · merkeze " + d.dist.toFixed(1) + " km</div></div>" +
      "<ul class=\"chips\">" + chips + "</ul>" +
      "<dl class=\"facts\">" +
      "<dt>Oda</dt><dd>" + d.rooms + "</dd>" +
      "<dt>Net / brüt</dt><dd>" + d.net + " / " + d.gross + " m²</dd>" +
      "<dt>Bina yaşı</dt><dd>" + esc(d.ageLabel) + "</dd>" +
      "<dt>Kat</dt><dd>" + esc(d.floor) + " · " + d.floors + " katlı</dd>" +
      "<dt>Aidat</dt><dd>" + (d.dues == null ? "Belirtilmemiş" : money(d.dues)) + "</dd>" +
      "<dt>Manzara</dt><dd>" + esc(list(d.view)) + "</dd>" +
      "<dt>İlan tarihi</dt><dd>" + date(d.listed) + "</dd>" +
      "</dl>" +
      (d.warnings && d.warnings.length ? "<div class=\"warn\"><strong>Dikkat</strong><ul>" + d.warnings.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul></div>" : "") +
      "<div class=\"mine\"><div class=\"stars\" role=\"group\" aria-label=\"Puanım\">" + stars + "</div>" +
      "<textarea data-note placeholder=\"Notum (gezdim, sorular, izlenim…)\" aria-label=\"Notum\">" + esc(m.note) + "</textarea></div>" +
      "<div class=\"card-actions\">" +
      "<label class=\"pick\"><input type=\"checkbox\" data-pick" + (picked ? " checked" : "") + "> Kıyasla</label>" +
      "<a class=\"link\" href=\"https://www.google.com/maps?q=" + d.lat + "," + d.lon + "\" target=\"_blank\" rel=\"noopener\">Harita ↗</a>" +
      "<a class=\"link\" href=\"" + esc(d.url) + "\" target=\"_blank\" rel=\"noopener\">İlan ↗</a>" +
      "</div></article>";
  }

  function renderCards(items) {
    $("slider").innerHTML = items.map(card).join("");
    $("slider").scrollLeft = 0;
    updatePos();
  }

  var COLS = [
    { k: "#", s: null, v: function (d) { return d.no; } },
    { k: "Daire", s: null, v: function (d) { return "<a href=\"" + esc(d.url) + "\" target=\"_blank\" rel=\"noopener\">" + esc(d.title) + "</a><div class=\"fine\">" + esc(d.area) + "</div>"; } },
    { k: "Fiyat", s: "price", n: 1, v: function (d) { return money(d.price); } },
    { k: "₺/m²", s: "ppm", n: 1, v: function (d) { return money(d.ppm); } },
    { k: "Oda", s: null, v: function (d) { return d.rooms; } },
    { k: "Net m²", s: "net", n: 1, v: function (d) { return d.net; } },
    { k: "Yaş", s: "age", n: 1, v: function (d) { return esc(d.ageLabel); } },
    { k: "Merkez", s: "dist", n: 1, v: function (d) { return d.dist.toFixed(1) + " km"; } },
    { k: "Site / havuz", s: null, v: function (d) { return (d.site ? "Site" : "—") + " / " + (d.pool ? "Havuz" : "—"); } },
    { k: "Eşya", s: null, v: function (d) { return eh(d.furnished); } },
    { k: "Puan", s: "stars", n: 1, v: function (d) { var s = mine(d.id).stars; return s ? "★".repeat(s) : "—"; } },
    { k: "Kıyas", s: null, v: function (d) { return "<input type=\"checkbox\" data-pick data-id=\"" + d.id + "\" aria-label=\"Kıyasla\"" + (state.picked.indexOf(d.id) > -1 ? " checked" : "") + ">"; } }
  ];

  function renderTable(items) {
    $("overview").innerHTML = "<thead><tr>" + COLS.map(function (c) {
      return "<th" + (c.n ? " class=\"num\"" : "") + (c.s ? " data-sort=\"" + c.s + "\"" : "") + (c.s === state.sort ? " aria-sort=\"" + (/net|listed|stars/.test(c.s) ? "descending" : "ascending") + "\"" : "") + ">" + c.k + "</th>";
    }).join("") + "</tr></thead><tbody>" + items.map(function (d) {
      return "<tr>" + COLS.map(function (c) { return "<td" + (c.n ? " class=\"num\"" : "") + ">" + c.v(d) + "</td>"; }).join("") + "</tr>";
    }).join("") + "</tbody>";
  }

  function render() {
    var items = visible();
    $("count").textContent = items.length + " / " + state.all.length + " daire";
    renderCards(items);
    renderTable(items);
    renderBar();
  }

  function updatePos() {
    var s = $("slider"), n = s.children.length;
    if (!n) { $("pos").textContent = "0 / 0"; return; }
    var w = s.children[0].getBoundingClientRect().width + 16;
    var i = Math.min(n - 1, Math.round(s.scrollLeft / w));
    var perView = Math.max(1, Math.floor((s.clientWidth + 16) / w));
    $("pos").textContent = (perView >= n ? "1–" + n : (i + 1)) + " / " + n;
    $("prev").disabled = s.scrollLeft <= 2;
    $("next").disabled = s.scrollLeft + s.clientWidth >= s.scrollWidth - 2;
  }
  function step(dir) {
    var s = $("slider"), first = s.children[0];
    if (first) s.scrollBy({ left: dir * (first.getBoundingClientRect().width + 16), behavior: "smooth" });
  }

  function togglePick(id, on) {
    var i = state.picked.indexOf(id);
    if (on && i < 0) { state.picked.push(id); if (state.picked.length > 2) state.picked.shift(); }
    if (!on && i > -1) state.picked.splice(i, 1);
    document.querySelectorAll("[data-pick]").forEach(function (box) {
      var bid = box.dataset.id || box.closest(".card").dataset.id;
      box.checked = state.picked.indexOf(bid) > -1;
    });
    document.querySelectorAll(".card").forEach(function (c) { c.classList.toggle("picked", state.picked.indexOf(c.dataset.id) > -1); });
    renderBar();
  }
  function byId(id) { return state.all.filter(function (d) { return d.id === id; })[0]; }
  function renderBar() {
    var n = state.picked.length;
    $("compareBar").hidden = n === 0;
    $("compareInfo").textContent = n === 1 ? "1 daire seçildi, bir tane daha seç" : n + " daire seçildi";
    $("compareOpen").disabled = n < 2;
  }

  function openCompare() {
    var p = state.picked.map(byId);
    if (p.length < 2) return;
    var html = "<thead><tr><th></th>" + p.map(function (d) { return "<th>#" + d.no + " " + esc(d.title) + "</th>"; }).join("") + "</tr></thead><tbody>";
    ROWS.forEach(function (r) {
      var vals = p.map(r.get), diff = vals[0] !== vals[1], best = -1;
      if (r.better && diff) {
        var a = r.num(p[0]), b = r.num(p[1]);
        if (a != null && b != null && a !== b) best = (r.better === "low" ? a < b : a > b) ? 0 : 1;
      }
      html += "<tr" + (diff ? " class=\"diff\"" : "") + "><th>" + r.k + "</th>" + vals.map(function (v, i) {
        return "<td" + (i === best ? " class=\"better\"" : "") + ">" + esc(v) + "</td>";
      }).join("") + "</tr>";
    });
    html += "<tr><th>İlan</th>" + p.map(function (d) { return "<td><a href=\"" + esc(d.url) + "\" target=\"_blank\" rel=\"noopener\">sahibinden ↗</a></td>"; }).join("") + "</tr></tbody>";
    $("cmpTable").innerHTML = html;
    $("compare").showModal();
  }

  function map() {
    if (!window.L) { $("map").textContent = "Harita yüklenemedi."; return; }
    var m = L.map("map", { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
    }).addTo(m);
    var pts = state.all.map(function (d) {
      L.marker([d.lat, d.lon], { icon: L.divIcon({ className: "", html: "<div class=\"pin\">" + d.no + "</div>", iconSize: [28, 28], iconAnchor: [14, 14] }) })
        .addTo(m).bindPopup("<strong>#" + d.no + " " + esc(d.title) + "</strong><br>" + money(d.price) + " · " + d.rooms);
      return [d.lat, d.lon];
    });
    L.circleMarker(CENTER, { radius: 5, color: "#52615a", weight: 2, fillOpacity: .6 }).addTo(m).bindTooltip("Fethiye merkez");
    m.fitBounds(pts.concat([CENTER]), { padding: [30, 30] });
  }

  function bind() {
    $("sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
    $("rooms").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.rooms = b.dataset.rooms;
      this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      render();
    });
    document.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.view = b.dataset.view;
        document.querySelectorAll("[data-view]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        $("cardsView").hidden = state.view !== "cards";
        $("tableView").hidden = state.view !== "table";
        if (state.view === "cards") updatePos();
      });
    });
    $("prev").addEventListener("click", function () { step(-1); });
    $("next").addEventListener("click", function () { step(1); });
    $("slider").addEventListener("scroll", function () { window.requestAnimationFrame(updatePos); }, { passive: true });
    window.addEventListener("resize", updatePos);
    document.addEventListener("keydown", function (e) {
      if (e.target.matches("textarea, input, select") || $("compare").open || state.view !== "cards") return;
      if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
    });
    document.addEventListener("change", function (e) {
      if (!e.target.matches("[data-pick]")) return;
      togglePick(e.target.dataset.id || e.target.closest(".card").dataset.id, e.target.checked);
    });
    $("slider").addEventListener("click", function (e) {
      var b = e.target.closest("[data-star]"); if (!b) return;
      var id = b.closest(".card").dataset.id, m = mine(id), n = Number(b.dataset.star);
      m.stars = m.stars === n ? 0 : n; save();
      b.parentNode.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", Number(x.dataset.star) <= m.stars); });
      renderTable(visible());
    });
    $("slider").addEventListener("input", function (e) {
      if (!e.target.matches("[data-note]")) return;
      mine(e.target.closest(".card").dataset.id).note = e.target.value; save();
    });
    $("overview").addEventListener("click", function (e) {
      var th = e.target.closest("th[data-sort]"); if (!th) return;
      state.sort = th.dataset.sort; $("sort").value = state.sort; render();
    });
    $("compareOpen").addEventListener("click", openCompare);
    $("compareClear").addEventListener("click", function () { state.picked = []; togglePick(null, false); });
    $("compareClose").addEventListener("click", function () { $("compare").close(); });
    $("compare").addEventListener("click", function (e) { if (e.target === this) this.close(); });
  }

  fetch("/data/daireler.json").then(function (r) { return r.json(); }).then(function (rows) {
    state.all = rows.map(function (d, i) {
      d.no = i + 1; d.ppm = Math.round(d.price / d.net); d.dist = km(CENTER, [d.lat, d.lon]); return d;
    });
    var rooms = ["all"].concat(Array.from(new Set(rows.map(function (d) { return d.rooms; }))).sort());
    $("rooms").innerHTML = rooms.map(function (r) {
      return "<button type=\"button\" data-rooms=\"" + r + "\" aria-pressed=\"" + (r === "all") + "\">" + (r === "all" ? "Tümü" : r) + "</button>";
    }).join("");
    bind(); render(); map();
  }).catch(function () { $("slider").textContent = "Veri yüklenemedi."; });
})();
