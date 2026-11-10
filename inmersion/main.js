/* Movimiento de la landing «La Inmersión en la esencia».
   Progresivo: sin JS todo se ve; con JS las piezas aparecen al entrar en pantalla. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cabecera: cristal más opaco al bajar
  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('is-scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* Menú móvil: el nav ya no desaparece sin sustituto por debajo de 760px */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    var setNav = function (open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    toggle.addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
  }

  /* Convocatorias: al pulsar una fila (o su botón) se elige esa fecha en el widget de reserva y se
     salta directo al paso «Tus datos». El panel flotante queda solo como respaldo si el widget no
     está en la página o el plugin cambia sus selectores. */
  var panel = document.getElementById('reserva-panel');
  var rows = document.querySelectorAll('.dates-table tbody tr');

  var elegirFecha = function (sessionId) {
    var widget = document.querySelector('.spazio-booking-root');
    if (!widget || !sessionId) return false;
    var lista;
    try { lista = JSON.parse(widget.getAttribute('data-events') || '[]'); } catch (e) { return false; }
    var idx = -1;
    for (var i = 0; i < lista.length; i++) { if (lista[i].id === sessionId) { idx = i; break; } }
    if (idx < 0) return false;
    var opcion = widget.querySelector('[data-event-index="' + idx + '"]');
    if (!opcion) return false;
    opcion.click();                                  // paso 1: fija la fecha
    var reservar = widget.querySelector('.spazio-reserve');
    if (reservar) reservar.click();                  // paso 2: se salta la pantalla de detalles
    return true;
  };

  if (rows.length) {
    var pSede = panel && panel.querySelector('.reserva-sede');
    var pFecha = panel && panel.querySelector('.reserva-fecha');
    var pLugar = panel && panel.querySelector('.reserva-lugar');
    var pImparte = panel && panel.querySelector('.reserva-imparte');
    var pClose = panel && panel.querySelector('.reserva-close');
    var pSel = document.getElementById('booking-sel');

    var abrir = function (row) {
      if (!panel) return;
      pSede.textContent = row.dataset.sede;
      pFecha.textContent = row.dataset.fecha;
      pLugar.textContent = row.dataset.lugar;
      pImparte.textContent = 'Imparte ' + row.dataset.imparte;
      if (pSel) pSel.textContent = row.dataset.sede + ' · ' + row.dataset.fecha;
      panel.hidden = false;
      pClose.focus({ preventScroll: true });
    };
    var cerrar = function () { if (panel) panel.hidden = true; };

    var activar = function (row) {
      rows.forEach(function (r) { r.classList.toggle('is-sel', r === row); });
      var id = row.dataset.evento || String(row.id || '').replace(/^conv-/, '');
      if (!elegirFecha(id)) { abrir(row); return; }
      var destino = document.getElementById('form-reserva');
      if (destino) destino.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    };

    rows.forEach(function (row) {
      var btn = row.querySelector('.js-reserva');
      if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); activar(row); });
      row.addEventListener('click', function (e) { if (!e.target.closest('a, button')) activar(row); });
    });
    if (panel) {
      pClose.addEventListener('click', cerrar);
      var irAlFormulario = panel.querySelector('a[href="#form-reserva"]');
      if (irAlFormulario) irAlFormulario.addEventListener('click', cerrar);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) cerrar(); });
    }
  }

  /* Formulario de dudas del pie: en la maqueta no envía; al publicar va al formulario del sitio */
  var dudas = document.querySelector('.dudas-form');
  if (dudas) {
    dudas.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = dudas.querySelector('.dudas-ok');
      if (ok) {
        ok.textContent = 'Maqueta: al publicar, este envío va al formulario de dudas del sitio.';
        ok.hidden = false;
      }
      var b = dudas.querySelector('button[type="submit"]');
      if (b) { b.disabled = true; b.textContent = 'Enviado'; }
    });
  }

  if (reduce || !('IntersectionObserver' in window)) return;

  // Grupos que entran escalonados (cada hijo con su retardo)
  var groups = [
    '.scene-body', '.q-list', '.cards--3', '.cards--price', '.terms', '.days-extra',
    '.take-grid', '.reviews-head', '.archive-strip', '.dates-table tbody',
    '.booking', '.faq-list', '.footer-close', '.footer-main'
  ];
  // Piezas sueltas
  var singles = ['.sec-head', '.scene .label', '.scene-title', '#scene-title', '.scene-hours', '.sedes', '.answer',
    '.teacher-text', '.archive-head', '.ethic', '.split-aside', '.reviews-score'];
  var imgs = ['.teacher-photo img'];  // la img, no la figure: el clip-path recortaba los círculos de marca
  singles.push('.reviews-track');  // carrusel horizontal: entra entero (sus tarjetas fuera de pantalla nunca «intersecan»)

  var els = [];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.classList.add('reveal'); c.style.setProperty('--i', Math.min(i, 5)); els.push(c);
      });
    });
  });
  singles.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (e) { if (!e.classList.contains('reveal')) { e.classList.add('reveal'); els.push(e); } });
  });
  imgs.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (e) { e.classList.add('reveal', 'reveal--img'); els.push(e); });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();
