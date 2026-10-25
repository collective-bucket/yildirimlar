(function () {
  "use strict";

  // Sign-in, register, reset and account pages on top of window.YildirimlarAuth.
  var i18n = window.YildirimlarI18n;

  var MESSAGES = {
    invalid: { en: "Email or password is wrong.", tr: "E-posta ya da parola hatalı." },
    exists: { en: "An account with this email already exists.", tr: "Bu e-postayla bir hesap zaten var." },
    weak: { en: "Use at least 8 characters.", tr: "En az 8 karakter kullanın." },
    email: { en: "Enter a valid email address.", tr: "Geçerli bir e-posta adresi girin." },
    popup: { en: "The Google window was closed.", tr: "Google penceresi kapatıldı." },
    many: { en: "Too many attempts. Try again later.", tr: "Çok fazla deneme. Daha sonra tekrar deneyin." },
    network: { en: "Network error. Check your connection.", tr: "Ağ hatası. Bağlantınızı kontrol edin." },
    domain: { en: "Sign-in is not enabled for this domain yet.", tr: "Bu alan adı için giriş henüz etkin değil." },
    recent: { en: "For safety, sign in again and retry.", tr: "Güvenlik için yeniden giriş yapıp tekrar deneyin." },
    resetSent: { en: "If an account exists, a reset link is on its way.", tr: "Hesap varsa sıfırlama bağlantısı gönderildi." },
    confirmDelete: { en: "Delete your account permanently?", tr: "Hesabınız kalıcı olarak silinsin mi?" },
    error: { en: "Something went wrong.", tr: "Bir şeyler ters gitti." }
  };
  var ERRORS = {
    "auth/invalid-credential": "invalid",
    "auth/invalid-login-credentials": "invalid",
    "auth/wrong-password": "invalid",
    "auth/user-not-found": "invalid",
    "auth/missing-password": "invalid",
    "auth/email-already-in-use": "exists",
    "auth/weak-password": "weak",
    "auth/password-does-not-meet-requirements": "weak",
    "auth/invalid-email": "email",
    "auth/missing-email": "email",
    "auth/popup-closed-by-user": "popup",
    "auth/cancelled-popup-request": "popup",
    "auth/too-many-requests": "many",
    "auth/network-request-failed": "network",
    "auth/unauthorized-domain": "domain",
    "auth/unauthorized-continue-uri": "domain",
    "auth/requires-recent-login": "recent"
  };

  function msg(key) {
    return i18n.pick(MESSAGES[key]);
  }

  var shown = null;

  function setStatus(node, key, kind) {
    shown = key ? { node: node, key: key, kind: kind } : null;
    node.textContent = key ? msg(key) : "";
    node.hidden = !key;
    node.classList.toggle("error", kind === "error");
  }

  window.addEventListener("yildirimlar-lang", function () {
    if (shown) setStatus(shown.node, shown.key, shown.kind);
  });

  function safeNext(fallback) {
    var next = new URLSearchParams(window.location.search).get("next") || "";
    if (!/^\/(?!\/)/.test(next) || /^\/(login|register|forgot)\b/.test(next)) return fallback;
    return next;
  }

  function authReady() {
    if (window.YildirimlarAuth) return Promise.resolve(window.YildirimlarAuth);
    return new Promise(function (resolve) {
      window.addEventListener("yildirimlar-auth", function () {
        resolve(window.YildirimlarAuth);
      }, { once: true });
    });
  }

  var page = document.body.getAttribute("data-page");
  var status = document.querySelector("#auth-status");

  function fail(error, restore) {
    if (restore) restore();
    var key = ERRORS[error && error.code];
    setStatus(status, key || "error", "error");
    if (!key) console.error(error);
  }

  if (page === "me") {
    var fillEmail = function () {
      var user = window.YildirimlarAuth && window.YildirimlarAuth.currentUser();
      var slot = document.querySelector("#me-email");
      if (slot && user) slot.textContent = user.email || user.displayName || user.uid;
    };
    window.addEventListener("yildirimlar-lang", fillEmail);
    authReady().then(function (auth) {
      auth.ready.then(function (user) {
        if (!user) {
          window.location.replace("/login?next=/me");
          return;
        }
        fillEmail();
      });
      document.querySelector("#sign-out").addEventListener("click", function () {
        auth.signOut().then(function () {
          window.location.replace("/");
        }, fail);
      });
      document.querySelector("#delete-account").addEventListener("click", function () {
        if (!window.confirm(msg("confirmDelete"))) return;
        auth.deleteAccount().then(function () {
          window.location.replace("/");
        }, fail);
      });
    });
    return;
  }

  var form = document.querySelector("#auth-form");
  if (!form) return;
  var google = document.querySelector("#google");
  var next = safeNext("/me");

  document.querySelectorAll("[data-keep-next]").forEach(function (link) {
    if (next !== "/me") link.href = link.getAttribute("href") + "?next=" + encodeURIComponent(next);
  });

  function busy(on) {
    form.querySelectorAll("input, button").forEach(function (node) {
      node.disabled = on;
    });
  }
  function idle() {
    busy(false);
  }
  function done() {
    window.location.replace(next);
  }

  authReady().then(function (auth) {
    auth.ready.then(function (user) {
      if (user && page !== "forgot") done();
    });
  });

  if (google) {
    google.addEventListener("click", function () {
      busy(true);
      setStatus(status, "");
      authReady()
        .then(function (auth) {
          return auth.google();
        })
        .then(function (result) {
          if (result) done();
        })
        .catch(function (error) {
          fail(error, idle);
        });
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var email = form.querySelector("#email").value.trim();
    var input = form.querySelector("#password");
    var password = input ? input.value : "";
    if (page === "register" && password.length < 8) {
      setStatus(status, "weak", "error");
      return;
    }
    busy(true);
    setStatus(status, "");
    authReady()
      .then(function (auth) {
        if (page === "forgot") {
          return auth.reset(email).then(function () {
            idle();
            setStatus(status, "resetSent");
          });
        }
        var action = page === "register" ? auth.register : auth.signIn;
        return action(email, password).then(done);
      })
      .catch(function (error) {
        if (page === "forgot" && error && error.code === "auth/user-not-found") {
          idle();
          setStatus(status, "resetSent");
          return;
        }
        fail(error, idle);
      });
  });
})();
