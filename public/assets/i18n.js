(function (root) {
  "use strict";

  // English lives in the HTML; this file holds the Turkish strings, keyed by data-i18n.
  var STORAGE_KEY = "yildirimlar-lang";
  var LANGS = ["en", "tr"];

  var tr = {
      "404.pageTitle": "Bulunamadı · Yıldırımlar",
      "about.bringBody": "Yazılım ve açık kaynak pratiği; bu notları düzenli tutacak zaman.",
      "about.bringTitle": "Getirdiklerim",
      "about.contactBody": "<a href=\"https://github.com/collective-bucket/yildirimlar/issues\">GitHub</a> üzerinde bir issue açın ya da <a href=\"https://notebook.google.com/notebook/5e0cf351-25e7-417d-9867-60095276fa50\">gönüllü notebook'una</a> yazın.",
      "about.contactTitle": "İletişim",
      "about.lackBody": "Hukuk ve kooperatif bilgisi, inşaat ve atölye becerisi, arazi, sermaye ve kurucu ortaklar. <a href=\"/contribute\">Katkı rehberi</a> bunları açık roller olarak sıralıyor.",
      "about.lackTitle": "Eksiklerim",
      "about.lead": "Bunun arkasında kim var, neden.",
      "about.pageTitle": "Hakkında · Yıldırımlar",
      "about.soloBody": "<strong>Şu an bu proje tek bir kişiden ibaret.</strong> Bu site mütevazı bir başlangıç: kendi notlarımı — gördüğüm yerleri, ziyaret ettiğim toplulukları, yararlandığım kaynakları — derliyorum; bir yol haritası, ileride de bir proje grubu bunlardan doğsun diye.",
      "about.soloTitle": "Şimdilik tek kişi",
      "about.title": "Hakkında",
      "about.whoBody": "Ertuğrul Yıldırım; Fethiye, Muğla'da yaşayan bir yazılım geliştiricisi. Doğa yürüyüşü yapıyor, kamp kuruyor, kırsal yaşamı deniyorum; açık kaynak Collective Bucket inisiyatifini başlattım.",
      "about.whoTitle": "Ben kimim",
      "about.whyBody": "Modern çalışma düzeni birlikte üretmeye pek yer bırakmıyor. Küçük bir topluluğun atölyeleri, sosyal bilimleri, sanatı ve ortak yaşamı sömürü ve hiyerarşi olmadan bir araya getirip getiremeyeceğini görmek istiyorum.",
      "about.whyTitle": "Neden",
      "auth.backToLogin": "Girişe dön",
      "auth.consent": "Hesap oluşturarak <a href=\"/terms\">kullanım koşullarını</a> ve <a href=\"/privacy\">gizlilik bildirimini</a> kabul etmiş olursunuz.",
      "auth.email": "E-posta",
      "auth.google": "Google ile devam et",
      "auth.or": "ya da",
      "auth.password": "Parola",
      "auth.submitLogin": "Giriş yap",
      "auth.submitRegister": "Hesap oluştur",
      "auth.submitReset": "Bağlantı gönder",
      "auth.toForgot": "Parolanızı mı unuttunuz?",
      "auth.toLogin": "Hesabınız var mı? Giriş yapın",
      "auth.toRegister": "Yeni misiniz? Hesap oluşturun",
      "common.draft": "Taslak: bu notlar genişletiliyor.",
      "communities.disclaimer": "Bunlar, her kampta katılımcı olarak geçirdiğim döneme ait kişisel notlarım. Tek bir dönemi tek bir bakış açısından anlatıyorlar; işletmeler ya da onları yürütenler hakkında bir değerlendirme değiller.",
      "communities.lead": "Katıldığım kamplar ve topluluklar: nasıl işliyorlar, ne işliyor, ne işlemiyor, kooperatif bunlardan ne almalı.",
      "communities.principlesLead": "Bu notlardan çıkan ve kooperatifin tasarımına sabitlenmesi gereken beş kural.",
      "communities.principlesTitle": "Kooperatif için anlamı",
      "communities.pageTitle": "Topluluklar · Yıldırımlar",
      "communities.title": "Topluluklar",
      "contribute.conductBody": "Sömürü yok, kişisel hiyerarşi kurmak yok, başkalarının kişisel verilerini paylaşmak yok.",
      "contribute.conductTitle": "Davranış kuralları",
      "contribute.decideBody": "Sosyokrasi ve rıza. Herkes itiraz edebilir; ancak itirazın gerekçesi ve çözüm önerisi olmalı.",
      "contribute.decideTitle": "Karar alma",
      "contribute.lead": "Projenin neye ihtiyacı olduğu, kararların nasıl alındığı ve nasıl başlanacağı.",
      "contribute.level1": "Gözlemci: takip eder, yorum yapar",
      "contribute.level2": "Uzaktan: ayda birkaç saat",
      "contribute.level3": "Dönemsel: belirli dönemlerde yerinde",
      "contribute.level4": "Tam zamanlı",
      "contribute.levelsTitle": "Taahhüt seviyeleri",
      "contribute.notebookBody": "Bu sitede tartışma açacak kadar kişi olana kadar gönüllüler ortak bir notebook'ta çalışıyor: <a href=\"https://notebook.google.com/notebook/5e0cf351-25e7-417d-9867-60095276fa50\" rel=\"noopener\" target=\"_blank\">notebook'u aç</a>.",
      "contribute.notebookTitle": "Gönüllü notebook'u",
      "contribute.open1": "Kooperatif türü: üretim, yapı ya da tarımsal kalkınma. Kuruluş için en az yedi ortak gerekiyor (1163 sayılı Kanun).",
      "contribute.open2": "Ter sermayesinin ana sözleşme ve iç yönetmelikte nasıl tanımlanacağı; kanunda doğrudan bir karşılığı yok.",
      "contribute.open3": "Arazi: imar durumu, tarım arazisi kısıtları, yapı ruhsatı ve konaklama mevzuatı.",
      "contribute.open4": "Ortak yaşam ve ortak üretimde vergi, sigorta ve SGK durumu.",
      "contribute.open5": "Kişisel veriler: KVKK aydınlatma metni ve üye profillerinin görünürlüğü.",
      "contribute.open6": "Rıza temelli karar alma ve çatışma çözümü deneyimi.",
      "contribute.openTitle": "Açık konular (destek aranıyor)",
      "contribute.pageTitle": "Katkı · Yıldırımlar",
      "contribute.rolesTitle": "İhtiyaç duyulan roller",
      "contribute.solo": "Şu an tek başımayım, aşağıdaki rollerin hepsi açık. Kimse bir unvan için alınmaz: ne getirebileceğinizi söylersiniz; roller yalnızca rızayla değişir.",
      "contribute.start1": "<a href=\"/vision\">Vizyonu</a> ve <a href=\"/roadmap\">yol haritasını</a> okuyun.",
      "contribute.start2": "Gönüllü notebook'una hangi rol ya da açık konuda yardım edebileceğinizi yazın.",
      "contribute.start3": "Hesaplar ve üye profilleri sırada; yakında buradan kaydolabileceksiniz.",
      "contribute.startTitle": "Nasıl başlanır",
      "contribute.sweatBody": "Katkılar kayıt altında ve görünür tutulur. İleride ortaklığın temeli bunlardır, para değil.",
      "contribute.sweatTitle": "Ter sermayesi",
      "contribute.title": "Katkı rehberi",
      "contribute.type1": "Zaman ve emek",
      "contribute.type2": "Beceri",
      "contribute.type3": "Bilgi, özellikle başka toplulukların deneyimi",
      "contribute.type4": "Ağ",
      "contribute.type5": "Sınırlı sermaye; karar ağırlığı getirmez",
      "contribute.typesTitle": "Katkı türleri",
      "cookies.body1": "Site çerez kullanmaz ve analitik araç içermez. Yalnızca dil seçimi localStorage'da tutulur.",
      "cookies.lead": "İzleme yok.",
      "cookies.pageTitle": "Çerezler · Yıldırımlar",
      "cookies.title": "Çerezler",
      "footer.cookies": "Çerezler",
      "footer.links": "Bağlantılar",
      "footer.notebook": "Gönüllü notebook'u",
      "footer.privacy": "Gizlilik",
      "footer.solo": "Şimdilik tek kişilik bir not defteri. Buradaki her şey taslak.",
      "footer.terms": "Kullanım koşulları",
      "forgot.lead": "Size bir sıfırlama bağlantısı göndereceğiz.",
      "forgot.pageTitle": "Parola sıfırla · Yıldırımlar",
      "forgot.title": "Parolayı sıfırla",
      "home.card.communities": "Topluluklar",
      "home.card.communitiesBody": "Katıldığım kamplar ve topluluklar: ne işliyor, ne işlemiyor.",
      "home.card.journeys": "Yolculuklar",
      "home.card.journeysBody": "Gezip gördüğüm yerler ve bana öğrettikleri.",
      "home.card.sources": "Kaynakça",
      "home.card.sourcesBody": "Fikrin arkasındaki kitaplar, yayınlar, podcastler ve filmler.",
      "home.card.vision": "Vizyon",
      "home.card.visionBody": "Model: 40–60 kişilik, köy enstitüsü benzeri bir komün.",
      "home.ctaContribute": "Nasıl katkı verilir",
      "home.ctaRoadmap": "Yol haritasını oku",
      "home.lead": "Muğla kırsalında bir kooperatif için notlar: atölyeler, sosyal bilimler, sanat ve ortak yaşam; ter sermayesi ve rıza temelli kararlar üzerine.",
      "home.phaseBody": "Faz 0 — Keşif: bu siteyi kurmak, toplulukları haritalamak, hukuki modeli araştırmak.",
      "home.phaseTitle": "Şu an neredeyiz",
      "home.solo": "<strong>Şu an bu proje tek bir kişiden ibaret.</strong> Bu site mütevazı bir başlangıç: kendi notlarımı — gördüğüm yerleri, ziyaret ettiğim toplulukları, yararlandığım kaynakları — derliyorum; bir yol haritası, ileride de bir proje grubu bunlardan doğsun diye.",
      "index.pageTitle": "Yıldırımlar",
      "journeys.lead": "Gezip gördüğüm yerler ve her birinin birlikte yaşam ve üretim hakkında bana öğrettikleri.",
      "journeys.pageTitle": "Yolculuklar · Yıldırımlar",
      "journeys.title": "Yolculuklar",
      "login.lead": "Tekrar hoş geldiniz.",
      "login.pageTitle": "Giriş · Yıldırımlar",
      "login.title": "Giriş",
      "me.dangerBody": "Giriş bilginizi kalıcı olarak siler. Başarısız olursa yeniden giriş yapıp tekrar deneyin.",
      "me.dangerTitle": "Hesabı sil",
      "me.delete": "Hesabımı sil",
      "me.lead": "<span id=\"me-email\"></span> olarak giriş yapıldı.",
      "me.next": "Profiller, kişi listesi ve tartışmalar bir sonraki fazda açılacak. O zamana kadar birlikte çalıştığımız yer gönüllü notebook'u.",
      "me.pageTitle": "Hesap · Yıldırımlar",
      "me.signOut": "Çıkış yap",
      "me.title": "Hesabınız",
      "nav.about": "Hakkında",
      "nav.account": "Hesap",
      "nav.communities": "Topluluklar",
      "nav.contribute": "Katkı",
      "nav.journeys": "Yolculuklar",
      "nav.language": "Dil",
      "nav.main": "Ana menü",
      "nav.menu": "Menü",
      "nav.roadmap": "Yol haritası",
      "nav.sources": "Kaynakça",
      "nav.vision": "Vizyon",
      "notFound.lead": "<a href=\"/\">Ana sayfaya dön</a>.",
      "notFound.title": "Sayfa bulunamadı",
      "privacy.body1": "Site Firebase Hosting (Google) üzerinde barınıyor; Firebase IP adresi ve tarayıcı gibi standart sunucu kayıtları tutar. Hesap oluşturursanız Firebase Authentication e-posta adresinizi (Google ile girerseniz Google adınızı ve fotoğrafınızı) saklar.",
      "privacy.body2": "Dil seçiminiz tarayıcınızda (localStorage) saklanır. Başka bir şey toplanmaz.",
      "privacy.body3": "Hesaplarda henüz profil verisi tutulmuyor. Profiller açılmadan önce bu bildirim tam bir KVKK aydınlatma metniyle değiştirilecek. Hesabınızı hesap sayfasından istediğiniz zaman silebilirsiniz.",
      "privacy.body4": "Sorular: <a href=\"https://github.com/collective-bucket/yildirimlar/issues\">GitHub issues</a>.",
      "privacy.lead": "Bu sitenin sizinle ilgili neleri sakladığı.",
      "privacy.pageTitle": "Gizlilik · Yıldırımlar",
      "privacy.title": "Gizlilik bildirimi",
      "register.lead": "Hesap, projeyi takip etmenizi sağlar; profiller ve tartışmalar daha sonra gelecek.",
      "register.pageTitle": "Hesap oluştur · Yıldırımlar",
      "register.title": "Hesap oluşturun",
      "roadmap.budgetNote": "Bütçe rakamları güncel tahminlerdir; plan olgunlaştıkça değişir.",
      "roadmap.lead": "Fazlar, çıkış kriterleri ve bütçe. Bir faz, öncekinin çıkış kriteri karşılanınca başlar.",
      "roadmap.pageTitle": "Yol haritası · Yıldırımlar",
      "roadmap.title": "Yol haritası",
      "sources.lead": "Yararlandığım kitaplar, yayınlar, podcastler, filmler ve siteler.",
      "sources.pageTitle": "Kaynakça · Yıldırımlar",
      "sources.title": "Kaynakça",
      "terms.body1": "Bu site kişisel bir not defteridir. Buradaki hiçbir şey teklif, yatırım önerisi ya da hukuki tavsiye değildir.",
      "terms.body2": "Kod MIT lisanslıdır; bkz. <a href=\"https://github.com/collective-bucket/yildirimlar\">GitHub</a>.",
      "terms.lead": "Kısa ve açık.",
      "terms.pageTitle": "Kullanım koşulları · Yıldırımlar",
      "terms.title": "Kullanım koşulları",
      "vision.consentBody": "Sosyokrasi: gerekçeli bir itiraz yoksa öneri kabul edilir. İtiraz gerekçe ve çözüm önerisiyle gelir. Süreç açık ve yazılıdır.",
      "vision.consentTitle": "Rıza ile karar",
      "vision.equityBody": "Mülkiyet ve gelir, getirilen sermayeyi değil verilen emeği izler. Sermaye karar ağırlığı satın almaz.",
      "vision.equityTitle": "Ter sermayesi",
      "vision.fieldBody": "Katıldığım kamp ve topluluklardan çıkarıldı; arkasındaki notlar <a href=\"/communities\">Topluluklar</a> sayfasında.",
      "vision.fieldTitle": "Sahadan çıkan kurallar",
      "vision.lead": "Muğla kırsalında, köy enstitüsü benzeri bir komün.",
      "vision.modelBody": "Klasik bir tarım kooperatifi ya da ticari girişim değil, yeni nesil bir komün: sanat, sosyal bilimler, teknik üretim ve ortak yaşam tek bir yerde, yatay bir yapıyla.",
      "vision.modelTitle": "Model",
      "vision.openBody": "Planlar, kurallar ve hesaplar açık kaynak kod gibi herkese açıktır.",
      "vision.openTitle": "Varsayılan olarak açık",
      "vision.pageTitle": "Vizyon · Yıldırımlar",
      "vision.scaleBody": "40–60 kişilik kapasite, fazlar halinde. “Minimum Viable Community” olarak başlar; bir önceki faz işlediğinde büyür.",
      "vision.scaleTitle": "Ölçek",
      "vision.spacesBody": "Demir, ağaç, motor ve seramik atölyeleri; sosyal bilimler ve felsefe derslikleri; ortak yaşam alanları ve koğuşlar.",
      "vision.spacesTitle": "Alanlar",
      "vision.title": "Vizyon"
  };

  function detect() {
    var stored = null;
    try {
      stored = root.localStorage.getItem(STORAGE_KEY);
    } catch (error) {}
    if (LANGS.indexOf(stored) >= 0) return stored;
    var nav = (root.navigator && root.navigator.language) || "en";
    return nav.toLowerCase().indexOf("tr") === 0 ? "tr" : "en";
  }

  var lang = detect();

  function pick(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || "";
  }

  function swap(node, attr, key) {
    var store = "en" + (attr ? attr.replace(/(^|-)(\w)/g, function (m, d, c) { return c.toUpperCase(); }) : "Html");
    if (!(store in node.dataset)) node.dataset[store] = attr ? node.getAttribute(attr) || "" : node.innerHTML;
    var next = lang === "tr" && tr[key] ? tr[key] : node.dataset[store];
    if (attr) node.setAttribute(attr, next);
    else node.innerHTML = next;
  }

  function apply(scope) {
    var host = scope || root.document;
    host.querySelectorAll("[data-i18n]").forEach(function (node) {
      swap(node, null, node.getAttribute("data-i18n"));
    });
    host.querySelectorAll("[data-i18n-aria]").forEach(function (node) {
      swap(node, "aria-label", node.getAttribute("data-i18n-aria"));
    });
    host.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      swap(node, "placeholder", node.getAttribute("data-i18n-placeholder"));
    });
  }

  function setLang(next) {
    if (LANGS.indexOf(next) < 0 || next === lang) return;
    lang = next;
    try {
      root.localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {}
    root.document.documentElement.lang = lang;
    apply();
    root.dispatchEvent(new CustomEvent("yildirimlar-lang", { detail: lang }));
  }

  if (root.document) root.document.documentElement.lang = lang;

  var api = {
    LANGS: LANGS,
    tr: tr,
    get lang() {
      return lang;
    },
    pick: pick,
    apply: apply,
    setLang: setLang
  };
  root.YildirimlarI18n = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
