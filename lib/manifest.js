(function () {
  "use strict";
  window.__BRAND__ = {
    name: "Racó de Canya",
    tagline: "Arrossos des de 1979",
    since: 1979,

    contact: {
      phone: "+34 962 61 03 70",
      mobile: "+34 699 09 31 64",
      whatsapp: "34699093164",
      address: "C/ Molins, 60 · 12590 Almenara (Castelló)",
      mapsDestination: "Racó de Canya, C/ Molins 60, Almenara",
      instagram: "https://www.instagram.com/racodecanya/"
    },

    // 0 = domingo … 6 = sábado. Abierto de miércoles a domingo.
    openDays: [0, 3, 4, 5, 6],
    hoursText: "Miércoles a domingo · 9:00 – 16:30",

    // Asistente con IA: el navegador solo habla con este archivo del servidor (la clave vive allí)
    chat: { endpoint: "api/chat.php" }
  };
})();
