(function () {
  "use strict";

  // Renders public/data/*.json into [data-render] containers; re-renders on language change.
  var i18n = window.YildirimlarI18n;
  var pick = i18n.pick;

  var LABELS = {
    goal: { en: "Goal", tr: "Hedef" },
    exit: { en: "Exit criterion", tr: "Çıkış kriteri" },
    budget: { en: "Budget", tr: "Bütçe" },
    active: { en: "Now", tr: "Şimdi" },
    next: { en: "Next", tr: "Sırada" },
    later: { en: "Later", tr: "Sonra" },
    when: { en: "When", tr: "Ne zaman" },
    notes: { en: "Notes", tr: "Notlar" },
    lesson: { en: "Lesson for the cooperative", tr: "Kooperatife çıkan ders" },
    model: { en: "Model", tr: "Model" },
    works: { en: "What works", tr: "Ne işliyor" },
    fails: { en: "What does not", tr: "Ne işlemiyor" },
    why: { en: "Why it matters", tr: "Neden önemli" },
    all: { en: "All", tr: "Tümü" },
    book: { en: "Books", tr: "Kitaplar" },
    article: { en: "Publications", tr: "Yayınlar" },
    podcast: { en: "Podcasts", tr: "Podcastler" },
    film: { en: "Films", tr: "Filmler" },
    website: { en: "Websites", tr: "Siteler" },
    law: { en: "Law", tr: "Mevzuat" },
    empty: { en: "Nothing here yet.", tr: "Henüz bir şey yok." }
  };
  var SOURCE_TYPES = ["book", "article", "podcast", "film", "website", "law"];

  function label(key) {
    return pick(LABELS[key]);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function field(card, key, value) {
    var text = pick(value);
    if (!text) return;
    var row = el("p", "field");
    row.appendChild(el("strong", null, label(key) + ": "));
    row.appendChild(document.createTextNode(text));
    card.appendChild(row);
  }

  var renderers = {
    roadmap: function (item) {
      var card = el("article", "item phase phase-" + item.status);
      var title = el("h2", null, pick(item.title));
      title.appendChild(el("span", "badge", label(item.status)));
      card.appendChild(title);
      field(card, "goal", item.goal);
      field(card, "exit", item.exit);
      field(card, "budget", item.budget);
      return card;
    },
    journeys: function (item) {
      var card = el("article", "item");
      card.appendChild(el("h2", null, item.place));
      card.appendChild(el("p", "hint", pick(item.region)));
      field(card, "when", item.when);
      field(card, "notes", item.notes);
      field(card, "lesson", item.lesson);
      return card;
    },
    communities: function (item) {
      var card = el("article", "item");
      var title = el("h2");
      if (item.url) {
        var link = el("a", null, item.name);
        link.href = item.url;
        link.rel = "noopener";
        link.target = "_blank";
        title.appendChild(link);
      } else {
        title.textContent = item.name;
      }
      card.appendChild(title);
      card.appendChild(el("p", "hint", pick(item.place)));
      field(card, "model", item.model);
      field(card, "works", item.works);
      field(card, "fails", item.fails);
      field(card, "lesson", item.lesson);
      return card;
    },
    sources: function (item) {
      var card = el("article", "item source");
      card.dataset.type = item.type;
      var title = el("h2");
      if (item.url) {
        var link = el("a", null, item.title);
        link.href = item.url;
        link.rel = "noopener";
        link.target = "_blank";
        title.appendChild(link);
      } else {
        title.textContent = item.title;
      }
      card.appendChild(title);
      card.appendChild(el("p", "hint", [label(item.type), item.author, item.year].filter(Boolean).join(" · ")));
      field(card, "why", item.why);
      return card;
    },
    roles: function (group) {
      var card = el("article", "item");
      card.appendChild(el("h3", null, pick(group.area)));
      var list = el("ul", "list");
      group.roles.forEach(function (role) {
        list.appendChild(el("li", null, pick(role)));
      });
      card.appendChild(list);
      return card;
    }
  };

  var cache = {};
  var sourceFilter = "all";

  function load(name) {
    if (!cache[name]) {
      cache[name] = fetch("/data/" + name + ".json").then(function (res) {
        if (!res.ok) throw new Error(name + ".json " + res.status);
        return res.json();
      });
    }
    return cache[name];
  }

  function renderFilters(host, items) {
    host.textContent = "";
    var present = SOURCE_TYPES.filter(function (type) {
      return items.some(function (item) {
        return item.type === type;
      });
    });
    ["all"].concat(present).forEach(function (type) {
      var button = el("button", null, label(type));
      button.type = "button";
      button.setAttribute("aria-pressed", String(type === sourceFilter));
      button.addEventListener("click", function () {
        sourceFilter = type;
        render();
      });
      host.appendChild(button);
    });
  }

  function render() {
    document.querySelectorAll("[data-render]").forEach(function (host) {
      var name = host.getAttribute("data-render");
      load(name)
        .then(function (items) {
          var filters = document.querySelector('[data-filters="' + name + '"]');
          if (filters) renderFilters(filters, items);
          var shown = name === "sources" && sourceFilter !== "all"
            ? items.filter(function (item) { return item.type === sourceFilter; })
            : items;
          host.textContent = "";
          if (!shown.length) host.appendChild(el("p", "hint", label("empty")));
          shown.forEach(function (item) {
            host.appendChild(renderers[name](item));
          });
        })
        .catch(function (error) {
          host.textContent = "";
          host.appendChild(el("p", "hint", label("empty")));
          console.error(error);
        });
    });
  }

  window.addEventListener("yildirimlar-lang", render);
  render();
})();
