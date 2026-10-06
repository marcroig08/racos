/* =============================================================
   Asistente del Racó — chat de soporte con IA (Google Gemini)
   El navegador NUNCA ve la clave: habla solo con api/chat.php,
   que es quien llama a Google desde el servidor.
   ============================================================= */
(function () {
  "use strict";

  var cfg = (window.__BRAND__ && window.__BRAND__.chat) || {};
  var ENDPOINT = cfg.endpoint || "api/chat.php";
  var MAX_LEN = 500;          // characters per message
  var MAX_TURNS = 11;         // turns sent as context (alternating, ending with the user)
  var STORE = "raco-chat-v2";
  var PHONE = "962 61 03 70";

  var htmlLang = (document.documentElement.getAttribute("lang") || "es").toLowerCase();
  var LANG = htmlLang.indexOf("ca") === 0 ? "va" : (htmlLang.indexOf("en") === 0 ? "en" : "es");

  var TXT = {
    es: {
      launcher: "¿Dudas? <b>Pregúntanos</b>", title: "Asistente del Racó", sub: "Asistente con IA · responde al momento",
      welcome: "¡Hola! Soy el asistente virtual del Racó de Canya (una IA, no una persona). Pregúntame por la carta, los arroces, el horario o cómo reservar.",
      suggestions: ["¿Qué arroz debería pedir?", "¿Cuál es el mejor entrante?", "¿Qué horario tenéis?", "¿Cómo reservo mesa?"],
      placeholder: "Escribe tu pregunta…", inputLabel: "Escribe tu pregunta", send: "Enviar pregunta", close: "Cerrar el asistente",
      typing: "El asistente está escribiendo",
      legal: "Asistente con inteligencia artificial: no es una persona y puede equivocarse. Confirma alérgenos, precios y disponibilidad con el personal. No escribas datos personales ni de salud. Tus mensajes se envían a Google (Gemini) para generar la respuesta. Para mayores de 18 años.",
      fallback: "Ahora mismo no puedo contestar. Llámanos al **" + PHONE + "** (miércoles a domingo, 9:00–16:30) y te ayudamos encantados."
    },
    va: {
      launcher: "Dubtes? <b>Pregunta'ns</b>", title: "Assistent del Racó", sub: "Assistent amb IA · respon al moment",
      welcome: "Hola! Sóc l'assistent virtual del Racó de Canya (una IA, no una persona). Pregunta'm per la carta, els arrossos, l'horari o com reservar.",
      suggestions: ["Quin arròs hauria de demanar?", "Quin és el millor entrant?", "Quin horari teniu?", "Com reserve taula?"],
      placeholder: "Escriu la teua pregunta…", inputLabel: "Escriu la teua pregunta", send: "Enviar la pregunta", close: "Tancar l'assistent",
      typing: "L'assistent està escrivint",
      legal: "Assistent amb intel·ligència artificial: no és una persona i pot equivocar-se. Confirma al·lèrgens, preus i disponibilitat amb el personal. No escrigues dades personals ni de salut. Els teus missatges s'envien a Google (Gemini) per a generar la resposta. Per a majors de 18 anys.",
      fallback: "Ara mateix no puc contestar. Telefona'ns al **" + PHONE + "** (de dimecres a diumenge, 9:00–16:30) i t'ajudarem encantats."
    },
    en: {
      launcher: "Questions? <b>Ask us</b>", title: "Racó assistant", sub: "AI assistant · instant answers",
      welcome: "Hi! I'm the Racó de Canya virtual assistant (an AI, not a person). Ask me about the menu, our rice dishes, opening hours or how to book.",
      suggestions: ["Which rice should I order?", "What's the best starter?", "What are your opening hours?", "How do I book a table?"],
      placeholder: "Type your question…", inputLabel: "Type your question", send: "Send question", close: "Close the assistant",
      typing: "The assistant is typing",
      legal: "AI assistant: not a person, and it can make mistakes. Please confirm allergens, prices and availability with our staff. Don't share personal or health data. Your messages are sent to Google (Gemini) to generate the answer. For over-18s.",
      fallback: "I can't answer right now. Call us on **+34 " + PHONE + "** (Wednesday to Sunday, 9:00–16:30) and we'll be happy to help."
    }
  }[LANG];

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };

  // Safe formatting: everything is escaped first; only **bold**, "- " bullets and paragraphs are rebuilt.
  function format(text) {
    var lines = esc(text).split(/\n+/);
    var html = "", inList = false;
    lines.forEach(function (line) {
      var l = line.trim();
      if (!l) return;
      var bullet = /^([-*•]|\d+\.)\s+/.test(l);
      l = l.replace(/^([-*•]|\d+\.)\s+/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      if (bullet) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += "<li>" + l + "</li>";
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        html += "<p>" + l + "</p>";
      }
    });
    if (inList) html += "</ul>";
    return html;
  }

  // history: [{role:"user"|"model", text, sig?}] — model turns carry the server's signature
  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(STORE) || "[]") || []; } catch (_) { history = []; }
  var save = function () { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-30))); } catch (_) {} };

  /* ---------- Build UI ---------- */
  var root = document.createElement("div");
  root.className = "chat";
  root.innerHTML =
    '<button class="chat-launcher" type="button" aria-expanded="false" aria-controls="chat-panel" data-chat-open>' +
      '<span class="chat-launcher-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5 5 16.1a8.4 8.4 0 1 1 15.5-4.5z"/></svg></span>' +
      '<span class="chat-launcher-text">' + TXT.launcher + "</span>" +
    "</button>" +
    '<section class="chat-panel" id="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>' +
      '<header class="chat-head">' +
        '<svg class="chat-head-mark" aria-hidden="true"><use href="#i-brush"/></svg>' +
        '<div><h2 id="chat-title">' + esc(TXT.title) + "</h2><p>" + esc(TXT.sub) + "</p></div>" +
        '<button class="chat-close" type="button" aria-label="' + esc(TXT.close) + '" data-chat-close>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      "</header>" +
      '<div class="chat-log" role="log" aria-live="polite" aria-relevant="additions" data-chat-log></div>' +
      '<div class="chat-suggest" data-chat-suggest></div>' +
      '<form class="chat-form" data-chat-form>' +
        '<label class="sr-only" for="chat-input">' + esc(TXT.inputLabel) + "</label>" +
        '<textarea id="chat-input" rows="1" maxlength="' + MAX_LEN + '" placeholder="' + esc(TXT.placeholder) + '" data-chat-input></textarea>' +
        '<button class="chat-send" type="submit" aria-label="' + esc(TXT.send) + '" data-chat-send>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>' +
      "</form>" +
      '<p class="chat-legal">' + esc(TXT.legal) + "</p>" +
    "</section>";
  document.body.appendChild(root);

  var launcher = $("[data-chat-open]", root);
  var panel = $(".chat-panel", root);
  var log = $("[data-chat-log]", root);
  var suggest = $("[data-chat-suggest]", root);
  var form = $("[data-chat-form]", root);
  var input = $("[data-chat-input]", root);
  var sendBtn = $("[data-chat-send]", root);
  var busy = false;

  function addBubble(role, text, opts) {
    var b = document.createElement("div");
    b.className = "chat-msg chat-msg--" + (role === "user" ? "user" : "bot") + (opts && opts.error ? " is-error" : "");
    if (role === "user") b.textContent = text;
    else b.innerHTML = format(text);
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function renderSuggestions() {
    suggest.innerHTML = "";
    if (history.length > 2) { suggest.hidden = true; return; }
    suggest.hidden = false;
    TXT.suggestions.forEach(function (q) {
      var c = document.createElement("button");
      c.type = "button";
      c.className = "chat-chip";
      c.textContent = q;
      c.addEventListener("click", function () { ask(q); });
      suggest.appendChild(c);
    });
  }

  function renderAll() {
    log.innerHTML = "";
    addBubble("model", TXT.welcome);
    history.forEach(function (m) { addBubble(m.role, m.text); });
    renderSuggestions();
  }

  function typing(on) {
    var t = $(".chat-typing", log);
    if (on && !t) {
      t = document.createElement("div");
      t.className = "chat-msg chat-msg--bot chat-typing";
      t.setAttribute("role", "status");
      t.setAttribute("aria-label", TXT.typing);
      t.innerHTML = "<span></span><span></span><span></span>";
      log.appendChild(t);
      log.scrollTop = log.scrollHeight;
    } else if (!on && t) { t.remove(); }
  }

  function setBusy(b) {
    busy = b;
    sendBtn.disabled = b;
    input.setAttribute("aria-busy", b ? "true" : "false");
    typing(b);
  }

  // Context sent to the server: last turns, alternating, starting and ending with the user.
  function contextTurns() {
    var turns = history.slice(-MAX_TURNS);
    while (turns.length && turns[0].role !== "user") turns.shift();
    return turns.map(function (m) {
      var o = { role: m.role, text: m.text };
      if (m.role === "model" && m.sig) o.sig = m.sig;
      return o;
    });
  }

  function ask(text) {
    text = String(text || "").trim().slice(0, MAX_LEN);
    if (!text || busy) return;
    // keep alternation: if the last turn was also the user's (a failed answer), replace it
    if (history.length && history[history.length - 1].role === "user") history.pop();
    history.push({ role: "user", text: text });
    addBubble("user", text);
    save();
    renderSuggestions();
    input.value = "";
    autoGrow();
    setBusy(true);

    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 35000);   // server worst case ≈ 27 s

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ lang: LANG, messages: contextTurns() }),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) { return { ok: res.ok, body: body }; });
      })
      .then(function (r) {
        clearTimeout(timer);
        setBusy(false);
        if (r.ok && r.body && typeof r.body.reply === "string" && r.body.reply) {
          history.push({ role: "model", text: r.body.reply, sig: r.body.sig || "" });
          save();
          addBubble("model", r.body.reply);
        } else {
          addBubble("model", (r.body && r.body.error) || TXT.fallback, { error: true });
        }
      })
      .catch(function () {
        clearTimeout(timer);
        setBusy(false);
        addBubble("model", TXT.fallback, { error: true });
      });
  }

  function autoGrow() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  }

  function open() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    root.classList.add("is-open");
    if (!log.children.length) renderAll();
    setTimeout(function () { input.focus(); }, 60);
  }
  function close() {
    root.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    launcher.focus();
  }

  launcher.addEventListener("click", function () { if (panel.hidden) open(); else close(); });
  $("[data-chat-close]", root).addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
  input.addEventListener("input", autoGrow);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input.value); }
  });

  // Any element with data-chat-ask="question" opens the chat with that question
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-chat-ask]");
    if (!t) return;
    e.preventDefault();
    open();
    ask(t.getAttribute("data-chat-ask"));
  });

  root.classList.add("is-ready");
})();
