/* ABM Custom Furniture — cotizador por WhatsApp, filtros y lightbox */
(function () {
  'use strict';

  // Número de WhatsApp con código de país (Costa Rica = 506), solo dígitos.
  var WHATSAPP_NUMBER = '50684906198';

  /* ---------- Cotizador ---------- */
  var form = document.getElementById('quote-form');
  var preview = document.getElementById('preview');
  var EMPTY_TEXT = 'Completá el formulario y tu mensaje aparece acá.';

  function clean(value, max) {
    return String(value || '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, max);
  }

  function num(value) {
    var n = parseFloat(String(value).replace(',', '.'));
    return isFinite(n) && n > 0 && n <= 100 ? n : null;
  }

  function getData() {
    var f = form.elements;
    return {
      tipo: f.tipo.value === 'Negocio' ? 'Negocio' : 'Hogar',
      servicio: clean(f.servicio.value, 60),
      ancho: num(f.ancho.value),
      alto: num(f.alto.value),
      ubicacion: clean(f.ubicacion.value, 80),
      nombre: clean(f.nombre.value, 60),
      detalles: clean(f.detalles.value, 400)
    };
  }

  function buildMessage(d) {
    var lines = ['Hola ABM Custom Furniture, quiero una cotización.', ''];
    if (d.nombre) lines.push('Nombre: ' + d.nombre);
    lines.push('Para: ' + d.tipo);
    lines.push('Necesito: ' + d.servicio);
    if (d.ancho || d.alto) {
      var m = [];
      if (d.ancho) m.push(d.ancho + ' m de ancho');
      if (d.alto) m.push(d.alto + ' m de alto o fondo');
      lines.push('Medidas aproximadas: ' + m.join(' x '));
    }
    if (d.ubicacion) lines.push('Ubicación: ' + d.ubicacion);
    if (d.detalles) lines.push('Detalles: ' + d.detalles);
    return lines.join('\n');
  }

  function updatePreview() {
    var d = getData();
    var touched = d.nombre || d.ubicacion || d.ancho || d.alto || d.detalles;
    preview.textContent = touched ? buildMessage(d) : EMPTY_TEXT;
  }

  function setError(id, message) {
    var el = document.getElementById('err-' + id);
    var input = document.getElementById(id);
    if (el) el.textContent = message;
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate(d) {
    var ok = true;
    setError('nombre', '');
    setError('ubicacion', '');
    if (d.nombre.length < 2) { setError('nombre', 'Escribí tu nombre.'); ok = false; }
    if (d.ubicacion.length < 3) { setError('ubicacion', 'Indicá el cantón y la provincia.'); ok = false; }
    return ok;
  }

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = getData();
    if (!validate(d)) {
      var bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
      return;
    }
    window.open(waLink(buildMessage(d)), '_blank', 'noopener,noreferrer');
  });

  var footWa = document.getElementById('foot-wa');
  if (footWa) {
    footWa.href = waLink('Hola ABM Custom Furniture, quiero información.');
    footWa.target = '_blank';
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Filtros de galería ---------- */
  var gallery = document.getElementById('gallery');
  var filters = document.querySelectorAll('.filter');
  var items = gallery ? Array.prototype.slice.call(gallery.querySelectorAll('li')) : [];

  function applyFilter(name) {
    items.forEach(function (li) {
      li.hidden = !(name === 'todo' || li.getAttribute('data-cat') === name);
    });
    filters.forEach(function (b) {
      var on = b.getAttribute('data-filter') === name;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  filters.forEach(function (b) {
    b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); });
  });

  // Las tarjetas de servicios llevan a la galería ya filtrada.
  document.querySelectorAll('[data-go]').forEach(function (a) {
    a.addEventListener('click', function () { applyFilter(a.getAttribute('data-go')); });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var current = -1;

  function visibleShots() {
    return items.filter(function (li) { return !li.hidden; })
      .map(function (li) { return li.querySelector('.shot'); });
  }

  function show(index) {
    var shots = visibleShots();
    if (!shots.length) return;
    current = (index + shots.length) % shots.length;
    var s = shots[current];
    lbImg.src = s.getAttribute('data-full');
    lbImg.alt = s.querySelector('img').alt;
    lbCap.textContent = s.getAttribute('data-cap');
  }

  if (gallery && lb && typeof lb.showModal === 'function') {
    gallery.addEventListener('click', function (e) {
      var btn = e.target.closest('.shot');
      if (!btn) return;
      var shots = visibleShots();
      show(shots.indexOf(btn));
      lb.showModal();
    });
    document.getElementById('lb-close').addEventListener('click', function () { lb.close(); });
    document.getElementById('lb-prev').addEventListener('click', function () { show(current - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  updatePreview();
})();
