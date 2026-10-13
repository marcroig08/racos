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

// runs inside each language page: language links → ask the outer page to switch; external links → new tab;
// #anchor links scroll by hand (a blob: page can't navigate to its own #fragment when opened from a file)
const CHOSEN = 'window.__racoChosen = false; /*raco-chosen*/';
const INNER = `<script>
(function () {
  ${CHOSEN}
  var cur = document.documentElement.getAttribute("data-bundle-lang");
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
</head>
<body>
<iframe id="raco" title="Racó de Canya"></iframe>
${data}
<script>
(function () {
  var frame = document.getElementById("raco"), url = null, LANGS = ["es", "va", "en"];
  var LANG_ATTR = { es: "es", va: "ca-ES-valencia", en: "en" };
  function decode(lang, chosen) {
    var b = atob(document.getElementById("raco-" + lang).textContent);
    var u = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    var html = new TextDecoder("utf-8").decode(u);
    if (chosen) html = html.replace(${JSON.stringify(CHOSEN)}, "window.__racoChosen = true;");
    return new Blob([html], { type: "text/html;charset=utf-8" });
  }
  function show(lang, chosen) {
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(decode(lang, chosen));
    frame.src = url;
    document.documentElement.lang = LANG_ATTR[lang];
    try { history.replaceState(null, "", "#" + lang); } catch (_) {}
    try { localStorage.setItem("raco-lang", lang); } catch (_) {}
  }
  window.addEventListener("message", function (e) {
    if (e.source !== frame.contentWindow || !e.data || LANGS.indexOf(e.data.racoLang) < 0) return;
    show(e.data.racoLang, true);
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
