(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var contact = data.contact || {};
  var doc = document.documentElement;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* -----------------------------------------------------------
     Language (page <html lang>): es · va (valencià) · en
     ----------------------------------------------------------- */
  var htmlLang = (doc.getAttribute("lang") || "es").toLowerCase();
  var LANG = htmlLang.indexOf("ca") === 0 ? "va" : (htmlLang.indexOf("en") === 0 ? "en" : "es");
  var PAGES = { va: "va.html", es: "index.html", en: "en.html" };
  var I18N = {
    es: {
      days: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      openUntil: "Abierto ahora · hasta las 16:30", openClosing: "Abierto ahora · cerramos en {n} min",
      closedToday: "Cerrado · abrimos hoy a las 9:00", closedTomorrow: "Cerrado · abrimos mañana a las 9:00", closedDay: "Cerrado · abrimos el {day} a las 9:00",
      driveWalk: "estás a <b>un paseo</b>. Ven andando.", driveMin: "estás a unos <b>{n}</b> min en coche.",
      menuOpen: "Abrir menú", menuClose: "Cerrar menú",
      pause: "Pausar el pase de opiniones", resume: "Reanudar el pase de opiniones",
      minPeople: "mín. {n} personas",
      soloName: "Para uno, mejor picar", soloDesc: "Los arroces son para un mínimo de 2 personas",
      soloWhy: "Tellines amb salsa verda, unas croquetes o las braves del Racó. Y si te quedas con ganas de arroz, vuelve con compañía.",
      soloExtra: "De 9:00 a 12:00 también tienes el esmorzar.",
      extraBig: "Para el centro, mientras se hace: croquetes y braves del Racó.",
      extraSmall: "Para abrir boca mientras se hace: tellines amb salsa verda.",
      paellaMin: "La paella valenciana se hace a partir de 4 personas. Si sois más, cambia el número.",
      bookTable: "Reservar mesa", bookPaella: "Reservar y encargar paella", bookRice: "Reservar con este arroz",
      errName: "Dinos a nombre de quién reservamos.", errDate: "Elige un día.", errPast: "Ese día ya ha pasado.",
      errClosed: "Lunes y martes cerramos. Elige de miércoles a domingo.", errTime: "Elige una hora.",
      errLate: "Esa hora ya ha pasado o está muy justa. Para hoy, mejor llámanos.", errPeople: "¿Cuántos seréis?",
      errRice2: "Los arroces son para un mínimo de 2 personas.", errRice4: "La paella valenciana es a partir de 4 personas.",
      waHello: "Hola, Racó de Canya. Me gustaría reservar mesa:", waName: "Nombre", waDay: "Día", waTime: "Hora",
      waPeople: "Personas", waRice: "Encargo de arroz", waNotes: "Comentarios", waThanks: "¡Gracias!", more10: "Más de 10"
    },
    va: {
      days: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
      openUntil: "Obert ara · fins a les 16:30", openClosing: "Obert ara · tanquem en {n} min",
      closedToday: "Tancat · obrim hui a les 9:00", closedTomorrow: "Tancat · obrim demà a les 9:00", closedDay: "Tancat · obrim el {day} a les 9:00",
      driveWalk: "estàs a <b>un passeig</b>. Vine caminant.", driveMin: "estàs a uns <b>{n}</b> min en cotxe.",
      menuOpen: "Obrir el menú", menuClose: "Tancar el menú",
      pause: "Pausar les opinions", resume: "Reprendre les opinions",
      minPeople: "mín. {n} persones",
      soloName: "Si véns sol, millor picar", soloDesc: "Els arrossos són per a un mínim de 2 persones",
      soloWhy: "Tellines amb salsa verda, unes croquetes o les braves del Racó. I si et quedes amb ganes d'arròs, torna amb companyia.",
      soloExtra: "De 9:00 a 12:00 també tens l'esmorzar.",
      extraBig: "Per al mig, mentre es fa: croquetes i braves del Racó.",
      extraSmall: "Per a obrir boca mentre es fa: tellines amb salsa verda.",
      paellaMin: "La paella valenciana es fa a partir de 4 persones. Si sou més, canvia el número.",
      bookTable: "Reservar taula", bookPaella: "Reservar i encarregar paella", bookRice: "Reservar amb este arròs",
      errName: "Digues-nos a nom de qui fem la reserva.", errDate: "Tria un dia.", errPast: "Eixe dia ja ha passat.",
      errClosed: "Dilluns i dimarts tanquem. Tria de dimecres a diumenge.", errTime: "Tria una hora.",
      errLate: "Eixa hora ja ha passat o va molt justa. Per a hui, millor telefona'ns.", errPeople: "Quants sereu?",
      errRice2: "Els arrossos són per a un mínim de 2 persones.", errRice4: "La paella valenciana és a partir de 4 persones.",
      waHello: "Hola, Racó de Canya. M'agradaria reservar taula:", waName: "Nom", waDay: "Dia", waTime: "Hora",
      waPeople: "Persones", waRice: "Encàrrec d'arròs", waNotes: "Comentaris", waThanks: "Gràcies!", more10: "Més de 10"
    },
    en: {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      openUntil: "Open now · until 4:30 pm", openClosing: "Open now · closing in {n} min",
      closedToday: "Closed · opening today at 9:00", closedTomorrow: "Closed · opening tomorrow at 9:00", closedDay: "Closed · opening {day} at 9:00",
      driveWalk: "you're <b>a short walk</b> away.", driveMin: "you're about <b>{n}</b> min away by car.",
      menuOpen: "Open menu", menuClose: "Close menu",
      pause: "Pause reviews", resume: "Resume reviews",
      minPeople: "min. {n} people",
      soloName: "Just you? Go for starters", soloDesc: "Rice dishes are for 2 people minimum",
      soloWhy: "Try the tellines amb salsa verda, the croquetes or the braves del Racó. Craving rice? Come back with company.",
      soloExtra: "From 9:00 to 12:00 there's also the esmorzar, our Valencian mid-morning breakfast.",
      extraBig: "To share while it cooks: croquetes and braves del Racó.",
      extraSmall: "To start while it cooks: tellines amb salsa verda.",
      paellaMin: "Paella valenciana is for 4 people or more. If there are more of you, change the number.",
      bookTable: "Book a table", bookPaella: "Book and pre-order paella", bookRice: "Book with this rice",
      errName: "Tell us whose name the booking is under.", errDate: "Choose a day.", errPast: "That day has already passed.",
      errClosed: "We're closed on Mondays and Tuesdays. Choose Wednesday to Sunday.", errTime: "Choose a time.",
      errLate: "That time has passed or is too soon. For today, please call us.", errPeople: "How many of you?",
      errRice2: "Rice dishes are for 2 people minimum.", errRice4: "Paella valenciana is for 4 people or more.",
      waHello: "Hello Racó de Canya, I'd like to book a table:", waName: "Name", waDay: "Day", waTime: "Time",
      waPeople: "People", waRice: "Rice pre-order", waNotes: "Notes", waThanks: "Thank you!", more10: "More than 10"
    }
  };
  var T = I18N[LANG];
  var fill = function (s, o) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); };

  /* -----------------------------------------------------------
     One shared, rAF-throttled scroll dispatcher
     ----------------------------------------------------------- */
  var scrollFns = [];
  var scrollTicking = false;
  function onScroll(fn) { scrollFns.push(fn); }
  function runScroll() {
    scrollTicking = false;
    for (var i = 0; i < scrollFns.length; i++) {
      try { scrollFns[i](); } catch (e) { console.warn("[scroll]", e); }
    }
  }
  function requestScroll() { if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(runScroll); } }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);

  /* -----------------------------------------------------------
     Split words — keeps <em>, its classes, and <br> (gotcha A.4)
     ----------------------------------------------------------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = "1";
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var n = 0;
    var wrap = function (text) {
      return text.split(/(\s+)/).map(function (w) {
        if (!w) return "";
        if (/^\s+$/.test(w)) return " ";
        return '<span class="w" aria-hidden="true"><span class="wi" style="--d:' + (n++) + '">' + escHTML(w) + "</span></span>";
      }).join("");
    };
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrap(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var clone = node.cloneNode(false);
        clone.innerHTML = wrap(node.textContent);
        return clone.outerHTML;
      }
      return "";
    }).join("");
    el.innerHTML = html;
  }
  function initSplit() { $$("[data-split]").forEach(splitWords); }

  /* -----------------------------------------------------------
     Splash + hero intro
     ----------------------------------------------------------- */
  function initSplash() {
    var splash = $("[data-splash]");
    var done = false;
    var hide = function () {
      if (done) return;
      done = true;
      if (splash) splash.classList.add("is-out");
      setTimeout(function () {
        doc.classList.add("is-intro");
        var h1 = $('[data-split="intro"]');
        if (h1) h1.classList.add("is-in");
      }, splash ? 260 : 0);
    };
    if (document.readyState === "complete") setTimeout(hide, 650);
    else window.addEventListener("load", function () { setTimeout(hide, 450); });
    setTimeout(hide, 2600);
  }

  /* -----------------------------------------------------------
     Nav: solid on scroll, hide on scroll down, mobile menu, scroll-spy
     ----------------------------------------------------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var lastY = window.scrollY;
    onScroll(function () {
      var y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 30);
      if (!doc.classList.contains("menu-open")) {
        if (y > lastY + 2 && y > 420) nav.classList.add("is-hidden");
        else if (y < lastY - 2 || y < 420) nav.classList.remove("is-hidden");
      }
      lastY = y;
    });

    var btn = $("[data-menu-toggle]");
    var menu = $("#menu");
    var behind = [$("#main"), $(".footer"), $("[data-dock]")].filter(Boolean);
    if (btn && menu) {
      var setOpen = function (open) {
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.setAttribute("aria-label", open ? T.menuClose : T.menuOpen);
        menu.classList.toggle("is-open", open);
        doc.classList.toggle("menu-open", open);
        nav.classList.remove("is-hidden");
        behind.forEach(function (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
        if (open) {
          menu.removeAttribute("inert");
          menu.setAttribute("aria-hidden", "false");
          setTimeout(function () { var a = $("a", menu); if (a) a.focus(); }, 350);
        } else {
          menu.setAttribute("inert", "");
          menu.setAttribute("aria-hidden", "true");
        }
      };
      btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
      menu.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && doc.classList.contains("menu-open")) { setOpen(false); btn.focus(); }
      });
      var mq = matchMedia("(min-width: 960px)");
      var onMq = function (m) { if (m.matches && doc.classList.contains("menu-open")) setOpen(false); };
      if (mq.addEventListener) mq.addEventListener("change", onMq);
    }

    // scroll-spy (the hero clears it)
    var links = $$(".nav-links a");
    if (!("IntersectionObserver" in window) || !links.length) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var a = map[en.target.id];
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(map).concat(["top", "mesa"]).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* -----------------------------------------------------------
     Reveals (threshold ≤ 0.05 + 6s safety net)
     ----------------------------------------------------------- */
  function initReveals() {
    var els = $$(".reveal, [data-split]:not([data-split='intro'])");
    var showAll = function () { els.forEach(function (el) { el.classList.add("is-in"); }); };
    if (!("IntersectionObserver" in window)) { showAll(); return; }
    try {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
      els.forEach(function (el) { io.observe(el); });
    } catch (e) { showAll(); throw e; }
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      });
    }, 6000);
  }

  /* -----------------------------------------------------------
     SIGNATURE — Canyar: reeds in the logo's colours that sway
     and bend away from the pointer
     ----------------------------------------------------------- */
  function initReeds() {
    $$("[data-reeds]").forEach(function (canvas) { safe(function () { makeReeds(canvas); }, "reeds"); });
  }

  function makeReeds(canvas) {
    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    var density = parseFloat(canvas.dataset.density || "1");
    var taperLeft = canvas.hasAttribute("data-taper-left");
    var amp = reduced ? 0.5 : 1;
    var W = 0, H = 0, reeds = [], raf = 0, visible = true;
    var wind = 0, gust = 0;
    var ptr = { x: -1e4, y: -1e4 };
    var seed = 11;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    // back: pale gold · middle: golden cane · front: the logo's yellow and red brushstrokes
    var LAYERS = [
      { stem: "rgba(246, 201, 21, .42)", leaf: "rgba(246, 201, 21, .32)", plume: "rgba(196, 150, 20, .3)",  h: [.62, .95], w: 1.2, flex: .8,  push: .35 },
      { stem: "rgba(222, 168, 20, .72)", leaf: "rgba(222, 168, 20, .52)", plume: "rgba(120, 90, 20, .35)",  h: [.55, .88], w: 1.6, flex: 1,   push: .65 },
      { stem: "rgba(246, 201, 21, 1)",   leaf: "rgba(246, 201, 21, .8)",  plume: "rgba(21, 18, 15, .45)",   h: [.42, .74], w: 2.4, flex: 1.15, push: 1 }
    ];
    var RED = { stem: "rgba(227, 38, 27, .92)", leaf: "rgba(227, 38, 27, .7)", plume: "rgba(21, 18, 15, .45)", h: LAYERS[2].h, w: LAYERS[2].w, flex: LAYERS[2].flex, push: LAYERS[2].push };

    function build() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 11;
      reeds = [];
      var count = Math.round(clamp(W / 11, 36, 150) * density);
      for (var i = 0; i < count; i++) {
        var li = i % 5 === 0 ? 2 : (i % 2 ? 1 : 0);
        var L = LAYERS[li];
        if (li === 2 && i % 10 === 5) L = RED;
        var x = rnd() * W;
        var h = H * (L.h[0] + rnd() * (L.h[1] - L.h[0]));
        if (taperLeft && W >= 960) {
          var u = clamp((x / W - 0.1) / 0.5, 0, 1);
          h *= 0.38 + 0.62 * (u * u * (3 - 2 * u));
        }
        var leaves = [];
        var nl = 1 + Math.floor(rnd() * 3);
        for (var k = 0; k < nl; k++) {
          leaves.push({ t: .22 + rnd() * .5, dir: rnd() < .5 ? -1 : 1, len: h * (.12 + rnd() * .15), lift: .25 + rnd() * .45 });
        }
        reeds.push({
          x: x, h: h, w: L.w * (.7 + rnd() * .6),
          ph: rnd() * Math.PI * 2, sp: .55 + rnd() * .7,
          L: L, li: li, leaves: leaves,
          plume: rnd() < (li === 2 ? .6 : .4),
          push: 0
        });
      }
      reeds.sort(function (a, b) { return a.li - b.li; });
    }

    function frame(t) {
      raf = 0;
      if (!visible || document.hidden || !W) return;
      ctx.clearRect(0, 0, W, H);
      gust *= 0.965;
      wind += (gust - wind) * 0.045;
      var time = t / 1000;
      ctx.lineCap = "round";

      for (var i = 0; i < reeds.length; i++) {
        var r = reeds[i], L = r.L;
        var sway = (Math.sin(time * r.sp + r.ph) * 0.05 + Math.sin(time * r.sp * 0.43 + r.ph * 1.7) * 0.03) * amp;
        var target = 0;
        var dx = r.x - ptr.x;
        if (ptr.y > H - r.h - 60 && ptr.y < H + 40 && Math.abs(dx) < 150) {
          target = (dx >= 0 ? 1 : -1) * (1 - Math.abs(dx) / 150) * 0.32 * L.push;
        }
        r.push += (target - r.push) * 0.07;

        var bend = (sway + wind * 0.16 * L.flex + r.push) * r.h;
        var bx = r.x, by = H + 2;
        var tx = r.x + bend, ty = H - r.h + Math.abs(bend) * 0.2;
        var cx = r.x + bend * 0.12, cy = H - r.h * 0.55;

        ctx.strokeStyle = L.stem;
        ctx.lineWidth = r.w;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(cx, cy, tx, ty); ctx.stroke();

        ctx.strokeStyle = L.leaf;
        ctx.lineWidth = Math.max(.6, r.w * .75);
        for (var k = 0; k < r.leaves.length; k++) {
          var lf = r.leaves[k], u = lf.t, iu = 1 - u;
          var px = iu * iu * bx + 2 * iu * u * cx + u * u * tx;
          var py = iu * iu * by + 2 * iu * u * cy + u * u * ty;
          var ex = px + lf.dir * lf.len + bend * 0.3 * u;
          var ey = py - lf.len * lf.lift + lf.len * 0.38;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(px + lf.dir * lf.len * 0.5 + bend * 0.1, py - lf.len * 0.55, ex, ey);
          ctx.stroke();
        }

        if (r.plume) {
          ctx.strokeStyle = L.plume;
          ctx.lineWidth = .9;
          var lean = bend * 0.08;
          for (var p = 0; p < 6; p++) {
            var off = (p - 2.5) * 2.2;
            ctx.beginPath();
            ctx.moveTo(tx, ty + 4);
            ctx.quadraticCurveTo(tx + off * .6 + lean, ty - 6, tx + off + lean * 2.2, ty - 9 - (p % 3) * 4);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }

    build();
    start();

    var lastW = W;
    var rebuild = function () {
      var r = canvas.getBoundingClientRect();
      if (Math.abs(r.width - lastW) < 2 && Math.abs(r.height - H) < 40 && reeds.length) return; // ignore mobile URL-bar jitter
      lastW = r.width; build(); start();
    };
    if ("ResizeObserver" in window) new ResizeObserver(rebuild).observe(canvas);
    else window.addEventListener("resize", rebuild);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener("visibilitychange", start);

    var lastX = null;
    window.addEventListener("pointermove", function (e) {
      if (!visible) return;
      var rc = canvas.getBoundingClientRect();
      ptr.x = e.clientX - rc.left;
      ptr.y = e.clientY - rc.top;
      if (lastX !== null) gust = clamp(gust + (e.clientX - lastX) * 0.006, -1.6, 1.6);
      lastX = e.clientX;
    }, { passive: true });
    document.addEventListener("pointerleave", function () { ptr.x = ptr.y = -1e4; lastX = null; });
    var lastY = window.scrollY;
    onScroll(function () {
      var y = window.scrollY;
      if (visible) gust = clamp(gust + (y - lastY) * 0.004, -1.6, 1.6);
      lastY = y;
    });
  }

  /* -----------------------------------------------------------
     Live "open now" status (restaurant time, Europe/Madrid)
     ----------------------------------------------------------- */
  function madridNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[get("weekday")], mins: (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10) };
    } catch (_) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function initOpenStatus() {
    var pills = $$("[data-open-status]");
    if (!pills.length) return;
    var openDays = data.openDays || [0, 3, 4, 5, 6];
    var OPEN = 9 * 60, CLOSE = 16 * 60 + 30;
    var update = function () {
      var now = madridNow();
      var isOpenDay = openDays.indexOf(now.day) !== -1;
      var open = isOpenDay && now.mins >= OPEN && now.mins < CLOSE;
      var text;
      if (open) {
        var left = CLOSE - now.mins;
        text = left <= 60 ? fill(T.openClosing, { n: left }) : T.openUntil;
      } else if (isOpenDay && now.mins < OPEN) {
        text = T.closedToday;
      } else {
        var d = now.day;
        for (var i = 1; i <= 7; i++) { var nd = (now.day + i) % 7; if (openDays.indexOf(nd) !== -1) { d = nd; break; } }
        text = d === (now.day + 1) % 7 ? T.closedTomorrow : fill(T.closedDay, { day: T.days[d] });
      }
      pills.forEach(function (p) {
        p.classList.toggle("is-open", open);
        p.classList.toggle("is-closed", !open);
        var t = $("[data-open-text]", p);
        if (t) t.textContent = text;
      });
    };
    update();
    setInterval(update, 60000);
  }

  /* -----------------------------------------------------------
     Hero: "Desde [pueblo] estás a X min" + route sync with radar
     ----------------------------------------------------------- */
  function initDrive() {
    var sel = $("[data-origin]");
    if (!sel) return;
    var text = $("[data-drive-text]");
    var link = $("[data-drive-link]");
    var dest = encodeURIComponent(contact.mapsDestination || "Racó de Canya, C/ Molins 60, Almenara");
    var routeLinks = $$("[data-drive-list] a");
    var towns = $$(".radar .town");

    var update = function (persist) {
      var opt = sel.options[sel.selectedIndex];
      var town = opt.value;
      var min = parseInt(opt.getAttribute("data-min"), 10) || 0;
      if (town === "Almenara") {
        text.innerHTML = T.driveWalk;
        link.hidden = true;
      } else {
        text.innerHTML = fill(T.driveMin, { n: min });
        link.hidden = false;
        link.href = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(town + ", España") +
          "&destination=" + dest + "&travelmode=driving";
      }
      doc.setAttribute("data-origin", town);
      routeLinks.forEach(function (a) { a.classList.toggle("is-route", a.getAttribute("data-town") === town); });
      towns.forEach(function (g) { g.classList.toggle("is-route", g.getAttribute("data-town") === town); });
      if (persist) { try { localStorage.setItem("raco-origin", town); } catch (_) {} }
    };
    var setTown = function (town) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === town) { sel.selectedIndex = i; return true; }
      }
      return false;
    };
    try { var saved = localStorage.getItem("raco-origin"); if (saved) setTown(saved); } catch (_) {}
    sel.addEventListener("change", function () { update(true); });

    // tap a town on the radar → it becomes "your route"
    towns.forEach(function (g) {
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      var pick = function () { if (setTown(g.getAttribute("data-town"))) update(true); };
      g.addEventListener("click", pick);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });
    update(false);
  }

  /* -----------------------------------------------------------
     Ventajas: stacked cards scale back as the next one arrives
     ----------------------------------------------------------- */
  function initStack() {
    var cards = $$(".stack-card");
    if (cards.length < 2) return;
    var mq = matchMedia("(min-width: 960px) and (min-height: 640px)");
    var inners = cards.map(function (c) { return $(".stack-inner", c); });
    onScroll(function () {
      if (!mq.matches) {
        inners.forEach(function (el) { el.style.transform = ""; el.style.filter = ""; });
        return;
      }
      for (var i = 0; i < cards.length; i++) {
        var inner = inners[i];
        var next = cards[i + 1];
        if (!next) { inner.style.transform = ""; inner.style.filter = ""; continue; }
        var r = cards[i].getBoundingClientRect();
        var nr = next.getBoundingClientRect();
        var p = clamp(1 - (nr.top - r.top) / Math.max(r.height, 1), 0, 1);
        inner.style.transform = p > 0 ? "scale(" + (1 - p * 0.06).toFixed(4) + ")" : "";
        inner.style.filter = p > 0 ? "brightness(" + (1 - p * 0.25).toFixed(3) + ")" : "";
      }
    });
    runScroll();
  }

  /* -----------------------------------------------------------
     Carta: floating dish preview that follows the cursor
     ----------------------------------------------------------- */
  function initCartaPreview() {
    var mqDesk = matchMedia("(min-width: 960px)");
    if (!fineHover) return;
    var box = $("[data-carta-preview]");
    var section = $("[data-carta]");
    if (!box || !section) return;
    var items = {};
    $$("[data-preview]", box).forEach(function (f) { items[f.getAttribute("data-preview")] = f; });
    var x = 0, y = 0, tx = 0, ty = 0, raf = 0, active = null, shown = false;

    var loop = function () {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      var rot = clamp((tx - x) * 0.04, -8, 8);
      var bw = box.offsetWidth || 280, bh = bw * 1.25;
      // sit to the right of the cursor; flip to the left near the right edge
      var px = x + 32 + bw > window.innerWidth - 12 ? x - 32 - bw : x + 32;
      px = clamp(px, 12, window.innerWidth - bw - 12);
      var py = clamp(y - bh / 2, 12, window.innerHeight - bh - 12);
      box.style.transform = "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0) rotate(" + rot.toFixed(2) + "deg)";
      if (shown && (Math.abs(tx - x) > .3 || Math.abs(ty - y) > .3)) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    var kick = function () { if (!raf) raf = requestAnimationFrame(loop); };

    section.addEventListener("mousemove", function (e) {
      if (!mqDesk.matches) return;
      tx = e.clientX; ty = e.clientY;
      kick();
    });
    $$("[data-dish]", section).forEach(function (row) {
      row.addEventListener("mouseover", function (e) {
        if (!mqDesk.matches || row.contains(e.relatedTarget)) return;
        tx = e.clientX; ty = e.clientY;
        if (!shown) { x = tx; y = ty; }
        var id = row.getAttribute("data-dish");
        if (active && items[active]) items[active].classList.remove("is-active");
        active = id;
        if (items[id]) items[id].classList.add("is-active");
        shown = true;
        box.classList.add("is-visible");
        kick();
      });
      row.addEventListener("mouseout", function (e) {
        if (row.contains(e.relatedTarget)) return;
        var to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("[data-dish]");
        if (to) return;
        shown = false;
        box.classList.remove("is-visible");
      });
    });
  }

  /* -----------------------------------------------------------
     "¿Qué arroz pedimos?" — interactive picker
     All dishes are on the restaurant's real menu.
     ----------------------------------------------------------- */
  // [description, why] per language — es · va · en
  var RICES = {
    marisc: { name: "Arròs de marisc", min: 2, t: {
      es: ["Gambas, cigalas y almejas", "El de toda la vida: sabor a mar, en paella y al centro de la mesa para compartir."],
      va: ["Gambes, cigales i almejes", "El de tota la vida: sabor a mar, en paella i al mig de la taula per a compartir."],
      en: ["Prawns, langoustines and clams", "The classic: all the flavour of the sea, cooked in the pan and shared in the middle of the table."] } },
    negre: { name: "Arròs negre", min: 2, t: {
      es: ["Arroz negro con tinta de calamar", "Sabor a mar en estado puro. Con un poco de allioli por encima, mejor todavía."],
      va: ["Amb tinta de calamar", "Sabor a mar en estat pur. Amb un poquet d'allioli damunt, encara millor."],
      en: ["Black rice with squid ink", "The pure taste of the sea. Even better with a little allioli on top."] } },
    senyoret: { name: "Arròs de senyoret", min: 2, t: {
      es: ["Arroz del señorito, todo pelado", "Todo pelado y listo para comer: ni cáscaras ni dedos manchados."],
      va: ["Tot pelat", "Tot pelat i a punt per a menjar: ni closques ni dits bruts."],
      en: ["Everything peeled, ready to eat", "Everything comes peeled: no shells, no messy fingers."] } },
    llamantol: { name: "Arròs de llamàntol amb gambons", min: 2, t: {
      es: ["Arroz de bogavante con gambones", "El arroz de las grandes ocasiones. Llega a la mesa y todo el mundo saca el móvil."],
      va: ["Amb llamàntol i gambons", "L'arròs de les grans ocasions. Arriba a la taula i tothom trau el mòbil."],
      en: ["Lobster rice with king prawns", "The rice for big occasions. It reaches the table and out come the phones."] } },
    cigales: { name: "Arròs de cigales amb alls tendres", min: 2, t: {
      es: ["Arroz de cigalas con ajos tiernos", "Suave y aromático, con el punto dulce de los ajos tiernos."],
      va: ["Amb cigales i alls tendres", "Suau i aromàtic, amb el punt dolç dels alls tendres."],
      en: ["Langoustines and tender garlic", "Gentle and fragrant, with the sweetness of tender garlic."] } },
    valenciana: { name: "Paella valenciana", min: 4, encargo: true, t: {
      es: ["Por encargo · mín. 4 personas", "La de domingo, la de siempre. Se hace solo por encargo: pídela al reservar y te estará esperando."],
      va: ["Per encàrrec · mín. 4 persones", "La de diumenge, la de sempre. Només es fa per encàrrec: demana-la quan reserves i t'estarà esperant."],
      en: ["Pre-order only · min. 4 people", "The Sunday classic. It's made to order only: ask for it when you book and it'll be waiting for you."] } },
    ventall: { name: "Arròs de ventall ibèric amb setes", min: 2, t: {
      es: ["Abanico ibérico con setas", "Arroz de montaña con abanico ibérico y setas: sabroso y sin complicaciones."],
      va: ["Amb ventall ibèric i bolets", "Arròs de muntanya amb ventall ibèric i bolets: saborós i sense complicacions."],
      en: ["Iberian pork and mushrooms", "A mountain-style rice with Iberian pork and mushrooms: tasty and straightforward."] } },
    anec: { name: "Fideuà de confit d'ànec", min: 2, t: {
      es: ["Pato confitado con setas y foie", "Para los que buscan sabor de verdad: pato confitado, setas y foie."],
      va: ["Ànec confitat amb bolets i foie", "Per als que busquen sabor de veritat: ànec confitat, bolets i foie."],
      en: ["Duck confit, mushrooms and foie", "For serious flavour hunters: duck confit, mushrooms and foie."] } },
    verdures: { name: "Arròs de verdures", min: 2, t: {
      es: ["Arroz de verduras", "Nada que pelar, ligero y lleno de sabor. Perfecto si en la mesa hay quien no come carne ni pescado."],
      va: ["De verdures", "Res a pelar, lleuger i ple de sabor. Perfecte si a la taula hi ha qui no menja carn ni peix."],
      en: ["Vegetable rice", "Nothing to peel, light and full of flavour. Perfect if someone at the table skips meat and fish."] } }
  };
  function chooseRice(people, side, mood) {
    if (side === "mar") {
      return { clasico: "marisc", intenso: "negre", facil: "senyoret", fiesta: "llamantol", ligero: "cigales" }[mood] || "marisc";
    }
    if (mood === "clasico" || mood === "fiesta") return people >= 4 ? "valenciana" : (mood === "fiesta" ? "anec" : "ventall");
    return { intenso: "anec", facil: "verdures", ligero: "verdures" }[mood] || "ventall";
  }

  function initPicker() {
    var form = $("[data-picker]");
    if (!form) return;
    var out = $("[data-people]", form);
    var card = $("[data-pick-card]");
    var nameEl = $("[data-pick-name]"), esEl = $("[data-pick-es]"), whyEl = $("[data-pick-why]"), extraEl = $("[data-pick-extra]");
    var book = $("[data-pick-book]");
    var plates = $("[data-plates]");
    var disc = $(".pan-disc");
    var people = parseInt(out.textContent, 10) || 4;
    var current = null;

    var drawPlates = function () {
      if (!plates) return;
      var n = clamp(people, 1, 12);
      var html = "";
      for (var i = 0; i < n; i++) {
        html += '<span class="plate-dot" style="--i:' + i + ";--a:" + (360 / n * i - 90) + 'deg;--r:43cqw"></span>';
      }
      plates.innerHTML = html;
      if (disc) {
        var s = (0.78 + Math.min(n, 12) / 12 * 0.22).toFixed(3);
        disc.style.setProperty("--pan-s", s);
        disc.style.transform = "scale(" + s + ")";
      }
    };

    var render = function (animate) {
      var side = (form.querySelector('input[name="side"]:checked') || {}).value || "mar";
      var mood = (form.querySelector('input[name="mood"]:checked') || {}).value || "clasico";
      if (people < 2) {
        current = null;
        nameEl.textContent = T.soloName;
        esEl.textContent = T.soloDesc;
        whyEl.textContent = T.soloWhy;
        extraEl.textContent = T.soloExtra;
        book.querySelector("span").textContent = T.bookTable;
      } else {
        var key = chooseRice(people, side, mood);
        var r = RICES[key];
        var tr = r.t[LANG] || r.t.es;
        current = r;
        nameEl.textContent = r.name;
        esEl.textContent = r.encargo ? tr[0] : tr[0] + " · " + fill(T.minPeople, { n: r.min });
        whyEl.textContent = tr[1];
        extraEl.textContent = people >= 4 ? T.extraBig : T.extraSmall;
        if (side === "muntanya" && (mood === "clasico" || mood === "fiesta") && people < 4) {
          extraEl.textContent = T.paellaMin;
        }
        book.querySelector("span").textContent = r.encargo ? T.bookPaella : T.bookRice;
      }
      if (animate) {
        card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash");
        if (disc && !reduced) { disc.classList.remove("spin"); void disc.offsetWidth; disc.classList.add("spin"); }
      }
    };

    form.addEventListener("click", function (e) {
      var b = e.target.closest("[data-step]");
      if (!b) return;
      people = clamp(people + parseInt(b.getAttribute("data-step"), 10), 1, 12);
      out.textContent = String(people);
      out.classList.remove("bump"); void out.offsetWidth; out.classList.add("bump");
      drawPlates();
      render(true);
    });
    form.addEventListener("change", function () { render(true); });

    book.addEventListener("click", function () {
      var rf = $("[data-reserve]");
      if (!rf) return;
      var ps = rf.elements.people;
      if (ps) ps.value = people > 10 ? "11+" : String(people);
      if (rf.elements.rice) rf.elements.rice.value = current ? current.name : "";
      setTimeout(function () { var n = rf.elements.name; if (n) n.focus({ preventScroll: true }); }, 700);
    });

    drawPlates();
    render(false);
  }

  /* -----------------------------------------------------------
     GSAP: paella turns with scroll, gallery columns drift
     ----------------------------------------------------------- */
  function initScrollScenes() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var disc = $("[data-paella-disc]");
    if (disc) {
      gsap.to(disc, { rotation: 140, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    }
    var mm = gsap.matchMedia();
    mm.add("(min-width: 720px)", function () {
      $$("[data-speed]").forEach(function (col) {
        var s = (parseFloat(col.getAttribute("data-speed")) || 0) * (reduced ? 0.3 : 1);
        gsap.fromTo(col, { y: s }, { y: -s, ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* -----------------------------------------------------------
     Count-ups (HTML already holds the final value)
     ----------------------------------------------------------- */
  function initCounters() {
    var els = $$("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var locale = { es: "es-ES", va: "ca-ES", en: "en-GB" }[LANG];
    var fmt = function (v, dec) { return v.toLocaleString(locale, { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    var run = function (el) {
      var to = parseFloat(el.getAttribute("data-count"));
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var t0 = null, dur = 1600;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = clamp((t - t0) / dur, 0, 1);
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = fmt(to * e, dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); run(en.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -15% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function initYears() {
    var y = new Date().getFullYear();
    $$("[data-since]").forEach(function (el) {
      var since = parseInt(el.getAttribute("data-since"), 10);
      if (since) el.textContent = String(y - since);
    });
    $$("[data-year]").forEach(function (el) { el.textContent = String(y); });
  }

  /* -----------------------------------------------------------
     Testimonials carousel (progress bar drives the timing; pausable)
     ----------------------------------------------------------- */
  function initVoices() {
    var root = $("[data-voices]");
    if (!root) return;
    var items = $$(".voice", root);
    if (items.length < 2) return;
    root.classList.add("is-carousel");
    var idx = 0;
    var bar = $("[data-voice-bar]", root);
    var indexEl = $("[data-voice-index]", root);
    var totalEl = $("[data-voice-total]", root);
    var toggle = $("[data-voice-toggle]", root);
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    if (totalEl) totalEl.textContent = pad(items.length);
    var paused = reduced;

    var restartBar = function () {
      if (!bar) return;
      bar.classList.remove("is-running");
      void bar.offsetWidth;
      bar.classList.add("is-running");
    };
    var go = function (n) {
      items[idx].classList.remove("is-active");
      idx = (n + items.length) % items.length;
      items[idx].classList.add("is-active");
      if (indexEl) indexEl.textContent = pad(idx + 1);
      restartBar();
    };
    var setPaused = function (p) {
      paused = p;
      root.classList.toggle("is-paused", p);
      if (toggle) {
        toggle.setAttribute("aria-pressed", p ? "true" : "false");
        toggle.setAttribute("aria-label", p ? T.resume : T.pause);
        var use = $("use", toggle);
        if (use) use.setAttribute("href", p ? "#i-play" : "#i-pause");
      }
    };
    items.forEach(function (it, i) { it.classList.toggle("is-active", i === 0); });

    var prev = $("[data-voice-prev]", root);
    var next = $("[data-voice-next]", root);
    if (prev) prev.addEventListener("click", function () { go(idx - 1); });
    if (next) next.addEventListener("click", function () { go(idx + 1); });
    if (toggle) toggle.addEventListener("click", function () { setPaused(!paused); });
    if (bar) bar.addEventListener("animationend", function () { if (!paused) go(idx + 1); });

    var sx = null, sy = null;
    root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1));
      sx = sy = null;
    });

    if ("IntersectionObserver" in window && bar) {
      new IntersectionObserver(function (entries) {
        bar.style.animationPlayState = entries[0].isIntersecting ? "" : "paused";
      }).observe(root);
    }
    setPaused(paused);
    restartBar();
  }

  /* -----------------------------------------------------------
     Radar entrance
     ----------------------------------------------------------- */
  function initRadar() {
    var radar = $("[data-radar]");
    if (!radar) return;
    if (!("IntersectionObserver" in window)) { radar.classList.add("is-on"); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { radar.classList.add("is-on"); io.disconnect(); }
    }, { threshold: 0.05 });
    io.observe(radar);
  }

  /* -----------------------------------------------------------
     Mobile dock: visible after the hero, hidden over contact/footer
     ----------------------------------------------------------- */
  function initDock() {
    var dock = $("[data-dock]");
    var hero = $(".hero");
    if (!dock || !hero) return;
    var contactSec = $("#contacto");
    var footer = $(".footer");
    onScroll(function () {
      var vh = window.innerHeight;
      var pastHero = hero.getBoundingClientRect().bottom < vh * 0.35;
      var c = contactSec ? contactSec.getBoundingClientRect() : null;
      var f = footer ? footer.getBoundingClientRect() : null;
      var overContact = c && c.top < vh * 0.8 && c.bottom > 0;
      var overFooter = f && f.top < vh;
      dock.classList.toggle("is-visible", !!(pastHero && !overContact && !overFooter));
    });
    runScroll();
  }

  /* -----------------------------------------------------------
     Reservation → WhatsApp message (no backend needed)
     ----------------------------------------------------------- */
  function initReserve() {
    var form = $("[data-reserve]");
    var card = $("[data-reserve-card]");
    var done = $("[data-reserve-done]");
    if (!form || !card) return;
    var phone = contact.whatsapp || "34699093164";
    var openDays = data.openDays || [0, 3, 4, 5, 6];
    var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    if (form.elements.date) form.elements.date.min = iso(new Date());

    var setError = function (name, msg) {
      var el = form.elements[name];
      var out = $('[data-error-for="' + name + '"]', form);
      var field = el && el.closest(".field");
      if (field) field.classList.toggle("has-error", !!msg);
      if (el) { if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
      if (out) out.textContent = msg || "";
    };
    ["name", "date", "time", "people", "rice"].forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      el.addEventListener("input", function () { setError(n, ""); });
      el.addEventListener("change", function () { setError(n, ""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var ok = true, first = null;
      var fail = function (n, msg) { setError(n, msg); ok = false; if (!first) first = f[n]; };
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      var name = (f.name.value || "").trim();
      if (name.length < 2) fail("name", T.errName); else setError("name", "");

      var dateObj = null;
      if (!f.date.value) fail("date", T.errDate);
      else {
        var parts = f.date.value.split("-");
        dateObj = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        if (dateObj < today) fail("date", T.errPast);
        else if (openDays.indexOf(dateObj.getDay()) === -1) fail("date", T.errClosed);
        else setError("date", "");
      }

      if (!f.time.value) fail("time", T.errTime);
      else if (dateObj && dateObj.getTime() === today.getTime()) {
        var hm = f.time.value.split(":");
        var slot = new Date(today.getFullYear(), today.getMonth(), today.getDate(), +hm[0], +hm[1]);
        if (slot.getTime() - now.getTime() < 30 * 60000) fail("time", T.errLate);
        else setError("time", "");
      } else setError("time", "");

      if (!f.people.value) fail("people", T.errPeople); else setError("people", "");

      var rice = f.rice.value;
      var n = f.people.value === "11+" ? 11 : parseInt(f.people.value, 10) || 0;
      if (rice && n && n < 2) fail("rice", T.errRice2);
      else if (rice === "Paella valenciana" && n && n < 4) fail("rice", T.errRice4);
      else setError("rice", "");

      if (!ok) { if (first) first.focus(); return; }

      var dateTxt = T.days[dateObj.getDay()] + " " + dateObj.getDate() + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear();
      var lines = [
        T.waHello,
        "• " + T.waName + ": " + name,
        "• " + T.waDay + ": " + dateTxt,
        "• " + T.waTime + ": " + f.time.value,
        "• " + T.waPeople + ": " + (f.people.value === "11+" ? T.more10 : f.people.value)
      ];
      if (rice) lines.push("• " + T.waRice + ": " + rice);
      var notes = (f.notes.value || "").trim();
      if (notes) lines.push("• " + T.waNotes + ": " + notes);
      lines.push(T.waThanks);

      var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(lines.join("\n"));
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (_) {} } else { window.location.href = url; }

      form.hidden = true;
      if (done) { done.hidden = false; var h = $("h3", done); if (h) { h.setAttribute("tabindex", "-1"); h.focus(); } }
    });

    var again = $("[data-reserve-again]");
    if (again) again.addEventListener("click", function () {
      form.reset();
      form.hidden = false;
      if (done) done.hidden = true;
      if (form.elements.name) form.elements.name.focus();
    });
  }

  /* -----------------------------------------------------------
     Language: remember the choice, first-visit chooser
     ----------------------------------------------------------- */
  function initLangGate() {
    var KEY = "raco-lang";
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (_) {}
    var remember = function (l) { try { localStorage.setItem(KEY, l); } catch (_) {} };

    // every language link remembers the choice
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[data-lang]");
      if (a) remember(a.getAttribute("data-lang"));
    });

    // came back from outside on a different language than the one chosen → go to the chosen one
    var fromSameSite = false;
    try { fromSameSite = !!document.referrer && new URL(document.referrer).host === location.host; } catch (_) {}
    if (saved && saved !== LANG && PAGES[saved] && !fromSameSite && location.protocol !== "file:") {
      location.replace(PAGES[saved] + location.hash);
      return;
    }
    if (saved) return;

    var gate = $("[data-langgate]");
    if (!gate) return;
    var opts = $$(".langgate-options a", gate);
    var nav = (navigator.languages || [navigator.language || ""]).join(",").toLowerCase();
    var suggested = /(^|,)(ca|va)/.test(nav) ? "va" : (/(^|,)es/.test(nav) ? "es" : (/(^|,)en/.test(nav) ? "en" : LANG));
    opts.forEach(function (a) { a.classList.toggle("is-suggested", a.getAttribute("data-lang") === suggested); });

    var behind = [$("#main"), $(".footer"), $("[data-nav]"), $("[data-dock]")].filter(Boolean);
    var close = function () {
      gate.hidden = true;
      behind.forEach(function (el) { el.removeAttribute("inert"); });
      doc.classList.remove("menu-open");
    };
    var show = function () {
      gate.hidden = false;
      behind.forEach(function (el) { el.setAttribute("inert", ""); });
      doc.classList.add("menu-open");                 // reuse: locks page scroll, hides dock/chat
      var first = $(".is-suggested", gate) || opts[0];
      if (first) first.focus();
    };
    opts.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var l = a.getAttribute("data-lang");
        remember(l);
        if (l === LANG) { e.preventDefault(); close(); }
      });
    });
    gate.addEventListener("click", function (e) { if (e.target === gate) { remember(LANG); close(); } });
    gate.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { remember(LANG); close(); return; }
      if (e.key !== "Tab" || !opts.length) return;
      var i = opts.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); opts[opts.length - 1].focus(); }
      else if (!e.shiftKey && i === opts.length - 1) { e.preventDefault(); opts[0].focus(); }
    });
    setTimeout(show, 1200);                           // right after the splash
  }

  /* -----------------------------------------------------------
     Boot
     ----------------------------------------------------------- */
  function boot() {
    doc.classList.add("ready");
    safe(initLangGate, "initLangGate");
    safe(initSplit, "initSplit");
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initYears, "initYears");
    safe(initOpenStatus, "initOpenStatus");
    safe(initReeds, "initReeds");
    safe(initRadar, "initRadar");
    safe(initDrive, "initDrive");
    safe(initStack, "initStack");
    safe(initCartaPreview, "initCartaPreview");
    safe(initPicker, "initPicker");
    safe(initCounters, "initCounters");
    safe(initVoices, "initVoices");
    safe(initDock, "initDock");
    safe(initReserve, "initReserve");
    safe(initScrollScenes, "initScrollScenes");
    runScroll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
