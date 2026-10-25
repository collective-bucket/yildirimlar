(function () {
  "use strict";

  var HEADER = "<a class=\"brand\" href=\"/\">Yıldırımlar</a><button class=\"nav-toggle\" type=\"button\" aria-expanded=\"false\" data-i18n-aria=\"nav.menu\" aria-label=\"Menu\"><span></span></button><nav class=\"nav\" data-i18n-aria=\"nav.main\" aria-label=\"Main\"><a href=\"/vision\" data-page=\"vision\" data-i18n=\"nav.vision\">Vision</a><a href=\"/roadmap\" data-page=\"roadmap\" data-i18n=\"nav.roadmap\">Roadmap</a><a href=\"/journeys\" data-page=\"journeys\" data-i18n=\"nav.journeys\">Journeys</a><a href=\"/communities\" data-page=\"communities\" data-i18n=\"nav.communities\">Communities</a><a href=\"/sources\" data-page=\"sources\" data-i18n=\"nav.sources\">Sources</a><a href=\"/contribute\" data-page=\"contribute\" data-i18n=\"nav.contribute\">Contribute</a><a href=\"/about\" data-page=\"about\" data-i18n=\"nav.about\">About</a></nav><div class=\"lang\" role=\"group\" data-i18n-aria=\"nav.language\" aria-label=\"Language\"><button type=\"button\" data-lang=\"en\">EN</button><button type=\"button\" data-lang=\"tr\">TR</button></div>";
  var FOOTER = "<div class=\"footer-cols\"><div><p data-i18n=\"footer.solo\">A one-person notebook for now. Everything here is a draft.</p></div><nav data-i18n-aria=\"footer.links\" aria-label=\"Links\"><a href=\"https://notebook.google.com/notebook/5e0cf351-25e7-417d-9867-60095276fa50\" rel=\"noopener\" target=\"_blank\" data-i18n=\"footer.notebook\">Volunteer notebook</a><a href=\"https://github.com/collective-bucket/yildirimlar\" rel=\"noopener\" target=\"_blank\">GitHub</a><a href=\"/privacy\" data-i18n=\"footer.privacy\">Privacy</a><a href=\"/terms\" data-i18n=\"footer.terms\">Terms</a><a href=\"/cookies\" data-i18n=\"footer.cookies\">Cookies</a></nav></div><p class=\"footer-meta\">© Yıldırımlar · <a href=\"https://collectivebucket.com\">Collective Bucket</a> · MIT</p>";

  var i18n = window.YildirimlarI18n;
  var header = document.querySelector(".site-header");
  var footer = document.querySelector(".site-footer");
  header.innerHTML = HEADER;
  footer.innerHTML = FOOTER;

  var current = document.body.getAttribute("data-page");
  header.querySelectorAll("[data-page]").forEach(function (link) {
    if (link.getAttribute("data-page") === current) link.setAttribute("aria-current", "page");
  });

  var toggle = header.querySelector(".nav-toggle");
  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  function markLang() {
    header.querySelectorAll("[data-lang]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-lang") === i18n.lang));
    });
  }
  header.querySelectorAll("[data-lang]").forEach(function (button) {
    button.addEventListener("click", function () {
      i18n.setLang(button.getAttribute("data-lang"));
    });
  });
  window.addEventListener("yildirimlar-lang", markLang);

  i18n.apply();
  markLang();
})();
