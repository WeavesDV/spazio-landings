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

  /* Convocatorias: al pulsar una fila de la tabla o un botón con data-fecha se abre el panel
     flotante de pre-reserva con esa sede y fecha ya cargadas. */
  var panel = document.getElementById('reserva-panel');
  var rows = document.querySelectorAll('.dates-table tbody tr');
  var sueltos = document.querySelectorAll('.js-reserva[data-fecha]');
  if (panel && (rows.length || sueltos.length)) {
    var pSede = panel.querySelector('.reserva-sede');
    var pFecha = panel.querySelector('.reserva-fecha');
    var pLugar = panel.querySelector('.reserva-lugar');
    var pImparte = panel.querySelector('.reserva-imparte');
    var pClose = panel.querySelector('.reserva-close');
    var pSel = document.getElementById('booking-sel');

    var pintar = function (d) {
      pSede.textContent = d.sede;
      pFecha.textContent = d.fecha;
      pLugar.textContent = d.lugar;
      pImparte.textContent = 'Imparte ' + d.imparte;
      if (pSel) pSel.textContent = d.sede + ' · ' + d.fecha;
      panel.hidden = false;
      pClose.focus({ preventScroll: true });
    };
    var abrir = function (row) {
      rows.forEach(function (r) { r.classList.toggle('is-sel', r === row); });
      pintar(row.dataset);
    };
    var cerrar = function () { panel.hidden = true; };

    rows.forEach(function (row) {
      var btn = row.querySelector('.js-reserva');
      if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); abrir(row); });
      row.addEventListener('click', function (e) { if (!e.target.closest('a, button')) abrir(row); });
    });
    sueltos.forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); pintar(b.dataset); });
    });
    pClose.addEventListener('click', cerrar);
    panel.querySelector('a[href="#form-reserva"]').addEventListener('click', cerrar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) cerrar(); });
  }

  /* Formato de entrega: fin de semana o intensivo.
     Un solo estado en <html data-formato>, y las secciones con data-fmt se muestran u ocultan.
     El selector y las tarjetas de «dos maneras» comparten el mismo estado. */
  var opts = document.querySelectorAll('[data-elegir]');
  if (opts.length) {
    var aplicarFormato = function (formato, mover) {
      if (formato !== 'anual' && formato !== 'intensivo') return;
      document.documentElement.dataset.formato = formato;
      document.querySelectorAll('.fmt-opt').forEach(function (b) {
        var on = b.dataset.elegir === formato;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var destino = document.getElementById(formato === 'anual' ? 'calendario' : 'intensivo');
      if (mover && destino) destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    opts.forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (el.tagName === 'A') e.preventDefault();
        aplicarFormato(el.dataset.elegir, el.tagName === 'A');
      });
    });
  }

  /* Sede del calendario: Madrid por defecto, Barcelona a un clic. */
  var sedes = document.querySelectorAll('[data-sede-btn]');
  if (sedes.length) {
    var aplicarSede = function (sede) {
      if (sede !== 'madrid' && sede !== 'barcelona') return;
      document.documentElement.dataset.sede = sede;
      sedes.forEach(function (b) {
        var on = b.dataset.sedeBtn === sede;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    };
    sedes.forEach(function (b) {
      b.addEventListener('click', function () { aplicarSede(b.dataset.sedeBtn); });
    });
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
  var singles = ['.sec-head', '.scene .label', '.scene-title', '#scene-title', '.scene-hours', '.answer',
    '.teacher-text', '.archive-head', '.ethic', '.split-aside', '.reviews-score'];
  var imgs = ['.rooms-stage', '.teacher-photo img'];  // la img, no la figure: el clip-path recortaba los círculos de marca
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
