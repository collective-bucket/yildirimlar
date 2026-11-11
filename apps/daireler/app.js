(function () {
  "use strict";

  var CENTER = [36.6216, 29.1164];
  var LEGACY = "daireler-mine";
  var ADMIN = "admin@collectivebucket.com";
  var NOTES = "https://firestore.googleapis.com/v1/projects/collective-bucket/databases/(default)/documents/apps/yildirimlar/daireler";
  var tl = new Intl.NumberFormat("tr-TR");
  var state = { all: [], sort: "price", rooms: "all", view: "cards", picked: [], notes: {}, editor: false };
  var timers = {};
  var $ = function (id) { return document.getElementById(id); };

  function mine(id) { return state.notes[id] || (state.notes[id] = { stars: 0, note: "" }); }

  function loadNotes() {
    return fetch(NOTES + "?pageSize=300").then(function (r) { return r.ok ? r.json() : {}; }).then(function (body) {
      (body.documents || []).forEach(function (doc) {
        var f = doc.fields || {};
        state.notes[doc.name.split("/").pop()] = {
          note: f.note ? f.note.stringValue : "",
          stars: f.stars ? Number(f.stars.integerValue) : 0
        };
      });
    }).catch(function () { /* notes are optional */ });
  }

  function status(id, text) {
    var el = document.querySelector(".card[data-id=\"" + id + "\"] .save-state");
    if (el) el.textContent = text;
  }

  function save(id) {
    clearTimeout(timers[id]);
    status(id, "Kaydediliyor…");
    timers[id] = setTimeout(function () {
      var m = mine(id);
      window.DairelerAuth.token().then(function (token) {
        return fetch(NOTES + "/" + id + "?updateMask.fieldPaths=note&updateMask.fieldPaths=stars&updateMask.fieldPaths=updatedAt", {
          method: "PATCH",
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ fields: {
            note: { stringValue: m.note.slice(0, 4000) },
            stars: { integerValue: String(m.stars) },
            updatedAt: { timestampValue: new Date().toISOString() }
          } })
        });
      }).then(function (r) {
        status(id, r.ok ? "Kaydedildi · herkes görür" : "Kaydedilemedi (" + r.status + ")");
      }).catch(function () { status(id, "Kaydedilemedi"); });
    }, 700);
  }

  // Notes kept in this browser before they became shared.
  function migrate() {
    var old;
    try { old = JSON.parse(localStorage.getItem(LEGACY)) || {}; } catch (e) { return; }
    Object.keys(old).forEach(function (id) {
      var o = old[id], m = mine(id);
      if (!byId(id) || (!o.note && !o.stars) || m.note || m.stars) return;
      m.note = o.note || ""; m.stars = o.stars || 0; save(id);
    });
    try { localStorage.removeItem(LEGACY); } catch (e) { /* private mode */ }
  }

  function ytId(v) {
    var m = /(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([\w-]{11})/.exec(v || "") || /^([\w-]{11})$/.exec(v || "");
    return m && m[1];
  }

  function km(a, b) {
    var r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return tl.format(n) + " ₺"; }
  function yn(v) { return v == null ? "Belirtilmemiş" : v ? "Var" : "Yok"; }
  function nk(v) { return v == null || v === "" ? "Belirtilmemiş" : v; }
  function gross(d) { return d.gross == null ? "?" : d.gross; }
  function eh(v) { return v == null ? "Belirtilmemiş" : v ? "Evet" : "Hayır"; }
  function date(s) { return new Date(s + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }); }
  function list(a) { return a && a.length ? a.join(", ") : "—"; }

  // Comparison rows: get = display value; num = comparable number; better = "low" | "high".
  var ROWS = [
    { k: "Fiyat", get: function (d) { return money(d.price); }, num: function (d) { return d.price; }, better: "low" },
    { k: "₺/m² (net)", get: function (d) { return money(d.ppm); }, num: function (d) { return d.ppm; }, better: "low" },
    { k: "₺/m² (brüt)", get: function (d) { return d.gross ? money(Math.round(d.price / d.gross)) : "?"; }, num: function (d) { return d.gross ? d.price / d.gross : null; }, better: "low" },
    { k: "Net / brüt m²", get: function (d) { return d.net + " / " + gross(d); }, num: function (d) { return d.net; }, better: "high" },
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
    { k: "Tapu", get: function (d) { return nk(d.deed); } },
    { k: "Manzara", get: function (d) { return list(d.view); } },
    { k: "Cephe", get: function (d) { return list(d.facade); } },
    { k: "Asansör", get: function (d) { return yn(d.elevator); } },
    { k: "Otopark", get: function (d) { return nk(d.parking); } },
    { k: "Isınma", get: function (d) { return nk(d.heating); } },
    { k: "Takas", get: function (d) { return eh(d.swap); } },
    { k: "Öne çıkanlar", get: function (d) { return list(d.extras); } },
    { k: "İlan tarihi", get: function (d) { return date(d.listed); } },
    { k: "Puan", get: function (d) { var s = mine(d.id).stars; return s ? "★".repeat(s) : "—"; }, num: function (d) { return mine(d.id).stars || null; }, better: "high" },
    { k: "Not", get: function (d) { return mine(d.id).note || "—"; } }
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
    ].map(function (c) { return "<li class=\"" + (c[1] ? "yes" : "") + "\">" + (c[1] == null ? "? " : c[1] ? "✓ " : "✗ ") + c[0] + "</li>"; }).join("");
    var stars = [1, 2, 3, 4, 5].map(function (n) {
      return state.editor
        ? "<button type=\"button\" data-star=\"" + n + "\" class=\"" + (n <= m.stars ? "on" : "") + "\" aria-label=\"" + n + " yıldız\">★</button>"
        : "<span class=\"" + (n <= m.stars ? "on" : "") + "\" aria-hidden=\"true\">★</span>";
    }).join("");
    var notes = state.editor
      ? "<div class=\"mine\"><div class=\"stars\" role=\"group\" aria-label=\"Puan\">" + stars + "</div>" +
        "<textarea data-note maxlength=\"4000\" placeholder=\"Not (gezdim, sorular, izlenim…) · herkes görür\" aria-label=\"Not\">" + esc(m.note) + "</textarea>" +
        "<div class=\"save-state\" aria-live=\"polite\"></div></div>"
      : (m.note || m.stars
        ? "<div class=\"mine\"><div class=\"stars static\" role=\"img\" aria-label=\"Puan " + m.stars + "/5\">" + stars + "</div>" +
          (m.note ? "<p class=\"note-view\">" + esc(m.note) + "</p>" : "") + "</div>"
        : "");
    var vid = ytId(d.video);
    var photo = "<div class=\"photo\"><img src=\"/img/" + d.id + ".webp\" alt=\"" + esc(d.title) + "\" width=\"528\" height=\"396\" loading=\"lazy\">" +
      (d.aiPhoto ? "<span class=\"tag\">İlan görselleri yapay zekâ ile üretilmiş</span>" : "") +
      (vid ? "<button type=\"button\" class=\"play\" data-video=\"" + vid + "\" aria-label=\"Videoyu izle\">▶ Video</button>" : "") + "</div>";
    return "<article class=\"card" + (picked ? " picked" : "") + "\" data-id=\"" + d.id + "\">" + photo +
      "<div class=\"card-head\"><span class=\"no\">#" + d.no + "</span>" +
      "<div class=\"price\">" + money(d.price) + "</div>" +
      "<div class=\"ppm\">" + money(d.ppm) + " / net m²</div>" +
      "<h3>" + esc(d.title) + "</h3><div class=\"where\">" + esc(d.area) + " · merkeze " + d.dist.toFixed(1) + " km</div></div>" +
      "<ul class=\"chips\">" + chips + "</ul>" +
      "<dl class=\"facts\">" +
      "<dt>Oda</dt><dd>" + d.rooms + "</dd>" +
      "<dt>Net / brüt</dt><dd>" + d.net + " / " + gross(d) + " m²</dd>" +
      "<dt>Bina yaşı</dt><dd>" + esc(d.ageLabel) + "</dd>" +
      "<dt>Kat</dt><dd>" + esc(d.floor) + " · " + d.floors + " katlı</dd>" +
      "<dt>Aidat</dt><dd>" + (d.dues == null ? "Belirtilmemiş" : money(d.dues)) + "</dd>" +
      "<dt>Manzara</dt><dd>" + esc(list(d.view)) + "</dd>" +
      "<dt>İlan tarihi</dt><dd>" + date(d.listed) + "</dd>" +
      "</dl>" +
      (d.warnings && d.warnings.length ? "<div class=\"warn\"><strong>Dikkat</strong><ul>" + d.warnings.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul></div>" : "") +
      notes +
      "<div class=\"card-actions\">" +
      "<label class=\"pick\"><input type=\"checkbox\" data-pick" + (picked ? " checked" : "") + "> Kıyasla</label>" +
      "<a class=\"link\" href=\"https://www.google.com/maps?q=" + d.lat + "," + d.lon + "\" target=\"_blank\" rel=\"noopener\">Harita ↗</a>" +
      (d.url ? "<a class=\"link\" href=\"" + esc(d.url) + "\" target=\"_blank\" rel=\"noopener\">İlan ↗</a>" : "") +
      "</div></article>";
  }

  function renderCards(items) {
    $("slider").innerHTML = items.map(card).join("");
    $("slider").scrollLeft = 0;
    updatePos();
  }

  var COLS = [
    { k: "#", s: null, v: function (d) { return d.no; } },
    { k: "Daire", s: null, v: function (d) {
      return "<div class=\"row-flat\"><img class=\"thumb\" src=\"/img/" + d.id + ".webp\" alt=\"\" width=\"80\" height=\"60\" loading=\"lazy\">" +
        "<div>" + (d.url ? "<a href=\"" + esc(d.url) + "\" target=\"_blank\" rel=\"noopener\">" + esc(d.title) + "</a>" : "<strong>" + esc(d.title) + "</strong>") + "<div class=\"fine\">" + esc(d.area) + "</div></div></div>";
    } },
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
    var html = "<thead><tr><th></th>" + p.map(function (d) { return "<th><img src=\"/img/" + d.id + ".webp\" alt=\"\" width=\"528\" height=\"396\">#" + d.no + " " + esc(d.title) + "</th>"; }).join("") + "</tr></thead><tbody>";
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
    html += "<tr><th>İlan</th>" + p.map(function (d) { return "<td>" + (d.url ? "<a href=\"" + esc(d.url) + "\" target=\"_blank\" rel=\"noopener\">sahibinden ↗</a>" : "İlan yok") + "</td>"; }).join("") + "</tr></tbody>";
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
      m.stars = m.stars === n ? 0 : n; save(id);
      b.parentNode.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", Number(x.dataset.star) <= m.stars); });
      renderTable(visible());
    });
    $("slider").addEventListener("input", function (e) {
      if (!e.target.matches("[data-note]")) return;
      var id = e.target.closest(".card").dataset.id;
      mine(id).note = e.target.value; save(id);
    });
    $("slider").addEventListener("click", function (e) {
      var b = e.target.closest("[data-video]"); if (!b) return;
      $("videoFrame").innerHTML = "<iframe src=\"https://www.youtube-nocookie.com/embed/" + b.dataset.video +
        "?autoplay=1&rel=0\" title=\"Daire videosu\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>";
      $("video").showModal();
    });
    $("videoClose").addEventListener("click", function () { $("video").close(); });
    $("video").addEventListener("click", function (e) { if (e.target === this) this.close(); });
    $("video").addEventListener("close", function () { $("videoFrame").innerHTML = ""; });
    $("authBtn").addEventListener("click", function () {
      if (window.DairelerAuth && window.DairelerAuth.user) { window.DairelerAuth.signOut(); return; }
      $("authError").textContent = ""; $("login").showModal();
    });
    $("loginClose").addEventListener("click", function () { $("login").close(); });
    $("loginGoogle").addEventListener("click", function () {
      window.DairelerAuth.google().then(function () { if (window.DairelerAuth.user) $("login").close(); })
        .catch(function (err) { $("authError").textContent = "Giriş yapılamadı (" + (err.code || err.message) + ")."; });
    });
    $("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      window.DairelerAuth.signIn(this.email.value.trim(), this.password.value).then(function () { $("login").close(); })
        .catch(function (err) { $("authError").textContent = "Giriş yapılamadı (" + (err.code || err.message) + ")."; });
    });
    window.addEventListener("daireler-auth", function () { onAuth(); });
    $("overview").addEventListener("click", function (e) {
      var th = e.target.closest("th[data-sort]"); if (!th) return;
      state.sort = th.dataset.sort; $("sort").value = state.sort; render();
    });
    $("compareOpen").addEventListener("click", openCompare);
    $("compareClear").addEventListener("click", function () { state.picked = []; togglePick(null, false); });
    $("compareClose").addEventListener("click", function () { $("compare").close(); });
    $("compare").addEventListener("click", function (e) { if (e.target === this) this.close(); });
  }

  function onAuth() {
    var u = window.DairelerAuth && window.DairelerAuth.user;
    var editor = !!(u && u.verified && u.email === ADMIN);
    $("authBtn").textContent = u ? "Çıkış" : "Giriş";
    $("authInfo").textContent = u ? (editor ? "Notları düzenliyorsun" : u.email + " not yazamaz") : "";
    if (editor === state.editor) return;
    state.editor = editor;
    if (editor) migrate();
    if (state.all.length) render();
  }

  Promise.all([fetch("/data/daireler.json"), loadNotes()])
    .then(function (res) { return res[0].json(); }).then(function (rows) {
    state.all = rows.map(function (d, i) {
      d.no = i + 1; d.ppm = Math.round(d.price / d.net); d.dist = km(CENTER, [d.lat, d.lon]); return d;
    });
    var rooms = ["all"].concat(Array.from(new Set(rows.map(function (d) { return d.rooms; }))).sort());
    $("rooms").innerHTML = rooms.map(function (r) {
      return "<button type=\"button\" data-rooms=\"" + r + "\" aria-pressed=\"" + (r === "all") + "\">" + (r === "all" ? "Tümü" : r) + "</button>";
    }).join("");
    bind(); onAuth(); render(); map();
  }).catch(function () { $("slider").textContent = "Veri yüklenemedi."; });
})();
