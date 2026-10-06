<?php
/*
 * Configuración del asistente del Racó de Canya.
 *
 * DÓNDE PONERLO (elige una opción):
 *  A) Recomendado: súbelo con el Administrador de archivos de Hostinger FUERA de public_html,
 *     en la carpeta del dominio (al lado de public_html), con el nombre  raco-config.php
 *  B) Alternativa: déjalo en esta carpeta  api/  con el nombre  _config.php
 *     (está protegido: nadie puede descargarlo desde el navegador).
 *
 * QUÉ CAMBIAR: solo la línea GEMINI_API_KEY, pegando tu clave de Google AI Studio.
 *
 * IMPORTANTE:
 *  - La clave NUNCA va en el HTML ni en los archivos .js. Solo aquí.
 *  - No subas este archivo con la clave a GitHub (ya está en .gitignore).
 *  - Las condiciones de Google solo permiten ofrecer el chat a clientes de la UE con el
 *    plan DE PAGO de la API de Gemini (prepago mínimo 5 $; cuesta aprox. 1 $ cada 1.000 mensajes).
 *    El plan gratuito sirve para probarlo, no para publicarlo.
 */
return [
    'GEMINI_API_KEY'    => 'PEGA_AQUI_TU_CLAVE',

    // Modelo recomendado por Google para proyectos nuevos (rápido y económico).
    'MODEL'             => 'gemini-3.5-flash-lite',
    // Modelo de reserva si el principal está saturado (déjalo vacío '' para no usarlo).
    'FALLBACK_MODEL'    => 'gemini-3.8-flash',

    // Tu dominio (con y sin www).
    'ALLOWED_ORIGINS'   => ['https://racodecanya.es', 'https://www.racodecanya.es'],

    // Límites anti-abuso: por visitante y en total (ajústalos a los límites de tu proyecto en AI Studio).
    'PER_MINUTE'        => 6,
    'PER_DAY'           => 40,
    'GLOBAL_PER_MINUTE' => 12,
    'GLOBAL_PER_DAY'    => 600,
];
