const http = require('http');
const fs = require('fs');
const path = require('path');
// Dev-only preview server (not part of the website). Usage: node tools/serve.js . 5173
const root = path.resolve(process.argv[2] || '.');
const port = +process.argv[3] || 5173;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

// Local preview only: PHP doesn't run here, so /api/chat.php answers with a mock reply.
function mockChat(req, res) {
  let body = '';
  req.on('data', c => { body += c; if (body.length > 20000) req.destroy(); });
  req.on('end', () => {
    let last = '';
    try { const j = JSON.parse(body); last = (j.messages || []).slice(-1)[0].text || ''; } catch (_) {}
    const reply = /arroz/i.test(last)
      ? '(Modo prueba local) ¡Buena pregunta! ¿Cuántos sois y preferís **mar** o **montaña**?\n- Mar clásico: **Arròs de marisc**\n- Intenso: **Arròs negre**\n- Sin pelar nada: **Arròs de senyoret**'
      : '(Modo prueba local) Aquí responderá Gemini cuando la web esté en el hosting con tu clave configurada.';
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ reply, sig: 'mock' }));
    }, 900);
  });
}

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/api/chat.php' && req.method === 'POST') return mockChat(req, res);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
}).listen(port, () => console.log('serving ' + root + ' on http://localhost:' + port));
