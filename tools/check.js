// Static checks for the 3 language pages (skill invariants + structural parity)
const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const pages = ['index.html', 'va.html', 'en.html'];
const KEEP = ['class', 'id', 'href', 'src', 'style', 'type', 'name', 'value', 'for', 'role', 'hidden'];
let problems = 0;
const say = (p, m) => { problems++; console.log('  [!] ' + p + ': ' + m); };

function skeleton(html) {
  const out = [];
  const re = /<([a-zA-Z][\w:-]*)([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    if (tag === 'meta' || tag === 'title') continue;
    const attrs = {};
    const ar = /([\w:-]+)(?:="([^"]*)")?/g;
    let a;
    while ((a = ar.exec(m[2]))) {
      const n = a[1].toLowerCase();
      if (KEEP.includes(n) || n.startsWith('data-')) attrs[n] = a[2] ?? '';
    }
    // allowed differences
    if (tag === 'link' && attrs.rel === undefined) {}
    out.push(tag + JSON.stringify(attrs));
  }
  return out;
}

const base = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const baseSk = skeleton(base);
for (const p of pages) {
  const f = path.join(root, p);
  if (!fs.existsSync(f)) { say(p, 'missing'); continue; }
  const h = fs.readFileSync(f, 'utf8');
  console.log('\n== ' + p + ' (' + h.length + ' bytes)');
  if (/type="module"/.test(h)) say(p, 'module script');
  for (const m of h.matchAll(/<script\s+([^>]*?)src="([^"]+)"([^>]*)>/g)) if (!/defer|async/.test(m[1] + m[3])) say(p, 'no defer: ' + m[2]);
  if (/["'(][^"'()]+\.(jpg|jpeg|png)["')]/i.test(h)) say(p, 'jpg/png reference');
  const h1 = (h.match(/<h1\b/g) || []).length; if (h1 !== 1) say(p, h1 + ' <h1>');
  const lang = (h.match(/<html[^>]*lang="([^"]+)"/) || [])[1]; console.log('  lang=' + lang);
  for (const m of h.matchAll(/<img\s+([^>]+)>/g)) if (!/alt=/.test(m[1])) say(p, 'img without alt');
  if (!/chat\.js/.test(h)) say(p, 'chat.js not loaded');
  if (!/<\/html>\s*$/.test(h)) say(p, 'does not end with </html>');
  const cur = [...h.matchAll(/<a href="([^"]+)"[^>]*aria-current="page"/g)].map(m => m[1]);
  console.log('  aria-current on: ' + cur.join(', '));
  if (!cur.every(c => c === p)) say(p, 'aria-current points to ' + cur.join(','));
  const gateA = (base.match(/<div class="langgate"[\s\S]*?<\/div>\s*<\/div>/) || [''])[0];
  const gateB = (h.match(/<div class="langgate"[\s\S]*?<\/div>\s*<\/div>/) || [''])[0];
  if (gateA !== gateB) say(p, 'language chooser differs from index.html');
  for (const id of ['top', 'casa', 'carta', 'tu-arroz', 'mesa', 'opiniones', 'contacto', 'reservar']) if (!h.includes('id="' + id + '"')) say(p, 'missing #' + id);
  if (p !== 'index.html') {
    const sk = skeleton(h);
    const ignore = s => s.replace(/"aria-current":"[^"]*",?/g, '');
    let diffs = 0;
    const n = Math.max(sk.length, baseSk.length);
    for (let i = 0; i < n && diffs < 8; i++) {
      if (sk[i] !== baseSk[i]) { diffs++; say(p, 'structure #' + i + ': ' + (baseSk[i] || '∅').slice(0, 110) + '  ≠  ' + (sk[i] || '∅').slice(0, 110)); }
    }
    if (!diffs) console.log('  structure: identical to index.html (' + sk.length + ' tags)');
  }
}
console.log('\n' + (problems ? problems + ' problem(s)' : 'ALL CHECKS PASSED'));
