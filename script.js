/* ABM Custom Furniture — cotizador por WhatsApp */
(function () {
  'use strict';

  // ► CAMBIAR: número de WhatsApp con código de país, solo dígitos (Costa Rica = 506).
  var WHATSAPP_NUMBER = '50600000000';

  var form = document.getElementById('quote-form');
  var preview = document.getElementById('preview');
  var EMPTY_TEXT = 'Completá el formulario y tu mensaje aparece acá.';

  // Limpia texto: quita caracteres de control y recorta espacios.
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
    var lines = [];
    lines.push('Hola ABM Custom Furniture, quiero una cotización.');
    lines.push('');
    if (d.nombre) lines.push('Nombre: ' + d.nombre);
    lines.push('Para: ' + d.tipo);
    lines.push('Servicio: ' + d.servicio);
    if (d.ancho || d.alto) {
      var medidas = [];
      if (d.ancho) medidas.push(d.ancho + ' m de ancho');
      if (d.alto) medidas.push(d.alto + ' m de alto o fondo');
      lines.push('Medidas aproximadas: ' + medidas.join(' x '));
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
      var firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }
    window.open(waLink(buildMessage(d)), '_blank', 'noopener,noreferrer');
  });

  // Enlaces generales a WhatsApp (pie de página).
  var general = waLink('Hola ABM Custom Furniture, quiero información.');
  ['foot-wa'].forEach(function (id) {
    var a = document.getElementById(id);
    if (a) { a.href = general; a.target = '_blank'; }
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  updatePreview();
})();
