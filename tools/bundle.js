// One self-contained HTML file with the 3 languages (to send the proposal as a single attachment).
// Usage: node tools/bundle.js . entrega/Raco-de-Canya-web.html
// Each language page is inlined (CSS, JS, favicon) and stored base64; the outer page shows the chosen
// one in a full-screen iframe (blob URL, so #anchors work) and swaps it when a language link is clicked.
const fs = require('fs'), path = require('path');
const [root, outFile] = process.argv.slice(2);
if (!root || !outFile) { console.error('usage: node tools/bundle.js <root> <out.html>'); process.exit(1); }
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const LANGS = { es: 'index.html', va: 'va.html', en: 'en.html' };
const FILE2LANG = { 'index.html': 'es', 'va.html': 'va', 'en.html': 'en' };

function must(s, from, to, what) {
  if (!s.includes(from)) throw new Error('bundle: patch target not found: ' + what);
  return s.split(from).join(to);
}

function patchMain(js) {
  js = must(js, 'var PAGES = { va: "va.html", es: "index.html", en: "en.html" };',
    'var PAGES = { va: "#idioma-va", es: "#idioma-es", en: "#idioma-en" };', 'PAGES');
  // no auto-redirect to the remembered language: the outer page already picks it
  js = must(js, '&& location.protocol !== "file:")', '&& false)', 'redirect');
  // once a language was chosen in the outer page, don't show the first-visit chooser again
  js = must(js, '    if (saved) return;\n', '    if (saved || window.__racoChosen) return;\n', 'gate');
  return js;
}

// Runs first inside each language page. A blob: page opened from a file has an opaque origin, so:
// - language links ask the outer page to switch; https links open in a new tab; tel:/mailto: go to the top window
// - #anchor links scroll by hand (the page can't navigate to its own #fragment)
// - localStorage/sessionStorage throw → in-memory stand-ins, seeded and saved by the outer page
// - IntersectionObserver ignores rootMargin without an explicit root → default root to the document
// SEED is replaced by the outer page with {chosen, local, session} before the page is shown.
const SEED = 'var SEED = {"chosen":false,"local":{},"session":{}}; /*raco-seed*/';
const INNER = `<script>
(function () {
  ${SEED}
  window.__racoChosen = SEED.chosen;
  var cur = document.documentElement.getAttribute("data-bundle-lang");

  function standIn(kind, data) {
    var m = {};
    for (var k in data) m[k] = String(data[k]);
    var save = function () { if (kind === "local") { var c = {}; for (var k in m) if (k !== "raco-lang") c[k] = m[k]; m2p(c); } else m2p(m); };
    var m2p = function (c) { parent.postMessage({ racoStore: kind, data: c }, "*"); };
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
      setItem: function (k, v) {
        m[k] = String(v); save();
        if (kind === "local" && k === "raco-lang") parent.postMessage({ racoChosen: String(v) }, "*");  // chooser answered
      },
      removeItem: function (k) { delete m[k]; save(); },
      clear: function () { m = {}; save(); },
      key: function (i) { return Object.keys(m)[i] || null; },
      get length() { return Object.keys(m).length; }
    };
  }
  [["localStorage", "local"], ["sessionStorage", "session"]].forEach(function (s) {
    try { window[s[0]].getItem("x"); return; } catch (_) {}
    try { Object.defineProperty(window, s[0], { value: standIn(s[1], SEED[s[1]] || {}), configurable: true }); } catch (_) {}
  });

  var IO = window.IntersectionObserver;
  if (IO) {
    var RootedIO = function (cb, o) {
      var c = {}; if (o) for (var k in o) c[k] = o[k];
      if (!c.root) c.root = document;
      try { return new IO(cb, c); } catch (_) { return new IO(cb, o); }
    };
    RootedIO.prototype = IO.prototype;
    window.IntersectionObserver = RootedIO;
  }

  document.addEventListener("DOMContentLoaded", function () { parent.postMessage({ racoTitle: document.title }, "*"); });
  window.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;                    // the page already handled it
    var a = e.target.closest && e.target.closest("a[href^='#']");
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    e.preventDefault();
    var el = id && document.getElementById(id);
    if (!el) { if (!id) scrollTo({ top: 0, behavior: "smooth" }); return; }
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (el.tabIndex < 0 && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");
    var m = /^#idioma-(es|va|en)$/.exec(href);
    if (m) {
      e.preventDefault();
      if (m[1] !== cur) parent.postMessage({ racoLang: m[1] }, "*");
      return;
    }
    if (/^https?:/i.test(href) && !a.target) { a.target = "_blank"; a.rel = "noopener"; }
    if (/^(tel|mailto|sms):/i.test(href) && !a.target) a.target = "_top";
  }, true);
})();
</script>`;

function page(file, lang) {
  let h = rd(file);
  const fav = 'data:image/svg+xml;base64,' + Buffer.from(rd('assets/favicon.svg')).toString('base64');
  h = h.replace(/<html\b/, `<html data-bundle-lang="${lang}"`);
  h = h.replace(/<link rel="icon" href="[^"]+"/, `<link rel="icon" href="${fav}"`);
  h = h.replace(/<link rel="stylesheet" href="styles\.css[^"]*">/, () => '<style>\n' + rd('styles.css') + '\n</style>');
  h = h.replace(/(<head[^>]*>)/, (m) => m + '\n' + INNER);
  h = h.replace(/<script defer src="([^"?]+)(\?[^"]*)?"><\/script>/g, (m, f) => {
    let js = rd(f); if (f === 'main.js') js = patchMain(js);
    if (/<\/script/i.test(js)) throw new Error('bundle: </script> inside ' + f);
    return '<script>\n' + js + '\n</script>';
  });
  h = h.replace(/href="(index|va|en)\.html"/g, (m, n) => `href="#idioma-${FILE2LANG[n + '.html']}"`);
  const left = h.match(/(?:src|href)="(?!https?:|data:|#|tel:|mailto:)[^"]+"/);
  if (left) throw new Error('bundle: local reference left in ' + file + ': ' + left[0]);
  return h;
}

const data = Object.entries(LANGS).map(([lang, file]) =>
  `<script type="text/plain" id="raco-${lang}">${Buffer.from(page(file, lang)).toString('base64')}</script>`).join('\n');

const fav = 'data:image/svg+xml;base64,' + Buffer.from(rd('assets/favicon.svg')).toString('base64');
const out = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Racó de Canya</title>
<link rel="icon" href="${fav}" type="image/svg+xml">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #fbf8f1; }
  iframe { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; display: block; background: #fbf8f1; }
</style>
<noscript><style>iframe { display: none; } html, body { overflow: auto; height: auto; }</style></noscript>
</head>
<body>
<noscript><p style="font:16px/1.6 system-ui,sans-serif;max-width:32em;margin:20vh auto;padding:0 1.5em;text-align:center;color:#15120f">
<b>Racó de Canya · propuesta de web</b><br><br>
Para ver la web, descarga este archivo y ábrelo con un navegador (Chrome, Safari, Edge o Firefox).<br><br>
Per a veure la web, descarrega este arxiu i obri'l amb un navegador.<br><br>
To view the website, download this file and open it in a web browser.</p></noscript>
${data}
<script>
(function () {
  var frame = null, url = null, stale = [], current = null, LANGS = ["es", "va", "en"];
  var LANG_ATTR = { es: "es", va: "ca-ES-valencia", en: "en" };
  // what the page saved (its storage can't be used from inside the frame), kept here
  var store = { local: {}, session: {} };
  try { store.local = JSON.parse(localStorage.getItem("raco-store") || "{}") || {}; } catch (_) {}
  try { store.session = JSON.parse(sessionStorage.getItem("raco-store") || "{}") || {}; } catch (_) {}
  function decode(lang, chosen) {
    var b = atob(document.getElementById("raco-" + lang).textContent);
    var u = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    var html = new TextDecoder("utf-8").decode(u);
    var seed = JSON.stringify({ chosen: !!chosen, local: store.local, session: store.session }).replace(/</g, "\\\\u003c");
    html = html.replace(${JSON.stringify(SEED)}, function () { return "var SEED = " + seed + ";"; });
    return new Blob([html], { type: "text/html;charset=utf-8" });
  }
  // the language is only written to the address and remembered once the visitor has chosen it
  function remember(lang, push) {
    try { history[push ? "pushState" : "replaceState"](null, "", "#" + lang); } catch (_) {}
    try { localStorage.setItem("raco-lang", lang); } catch (_) {}
  }
  // every page gets a NEW, uniquely named iframe: the browser can't match it to an old history entry
  // and reload a dead blob: URL into it. It loads underneath the current page, which is removed once it's ready.
  function show(lang, chosen, push) {
    if (url) stale.push(url);
    url = URL.createObjectURL(decode(lang, chosen));
    var f = frame = document.createElement("iframe");
    f.name = "raco-" + Date.now().toString(36) + Math.random().toString(36).slice(2);
    f.title = "Racó de Canya";
    f.addEventListener("load", function () {
      if (f !== frame) return;                       // a newer page is on its way
      try { f.contentWindow.focus(); } catch (_) {}  // keyboard scrolling works without clicking first
      [].slice.call(document.getElementsByTagName("iframe")).forEach(function (o) { if (o !== f) o.parentNode.removeChild(o); });
      while (stale.length) URL.revokeObjectURL(stale.pop());
    });
    f.src = url;
    document.body.insertBefore(f, document.getElementsByTagName("iframe")[0] || null);
    current = lang;
    document.documentElement.lang = LANG_ATTR[lang];
    if (chosen) remember(lang, push);
  }
  window.addEventListener("message", function (e) {
    if (!frame || e.source !== frame.contentWindow || !e.data) return;
    var d = e.data;
    if (typeof d.racoTitle === "string") { document.title = d.racoTitle; return; }
    if ((d.racoStore === "local" || d.racoStore === "session") && d.data && typeof d.data === "object") {
      store[d.racoStore] = d.data;
      try { (d.racoStore === "local" ? localStorage : sessionStorage).setItem("raco-store", JSON.stringify(d.data)); } catch (_) {}
      return;
    }
    if (d.racoChosen === current) { remember(current, false); return; }
    if (LANGS.indexOf(d.racoLang) >= 0 && d.racoLang !== current) show(d.racoLang, true, true);
  });
  window.addEventListener("popstate", function () {
    var l = location.hash.slice(1) || "es";
    if (LANGS.indexOf(l) >= 0 && l !== current) show(l, true, false);
  });
  var start = location.hash.slice(1), chosen = LANGS.indexOf(start) >= 0;
  if (!chosen) { try { start = localStorage.getItem("raco-lang"); chosen = LANGS.indexOf(start) >= 0; } catch (_) {} }
  show(chosen ? start : "es", chosen);
})();
</script>
</body>
</html>
`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(outFile, Math.round(out.length / 1024) + ' KB');
