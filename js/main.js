/* ==========================================================================
   Óptica Sextante (SITIO DE DEMOSTRACIÓN, negocio ficticio)
   Concepto «Optotipo»: la carta de la pared manda. Las filas se leen de la
   más grande a la más pequeña, una marca señala la que toca y todo lo que
   entra lo hace enfocándose, que es lo que pasa cuando te ponen la lente
   correcta delante.

   - `has-motion` solo se enciende si GSAP y ScrollTrigger existen de verdad.
   - `motion` y `gsapReady` van por separado: con prefers-reduced-motion el
     contenido sigue vivo (filtro del catálogo, simulador, horario, contadores).
   - El desenfoque solo se aplica a elementos pequeños y con transición CSS,
     nunca por fotograma ni a pantalla completa.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = gsapReady && !reduce.matches;

  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    if (motion) raiz.classList.add('has-motion');
  }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── Cortina de entrada ────────────────────────────────────────────────
     Obligatoria (§5 del pliego) y con RETIRADA GARANTIZADA: se quita
     siempre —sin GSAP, con movimiento reducido, o si algo falla a mitad—,
     porque si se queda tapa la página entera. `ESPERA` es lo que el hero
     aguanta antes de entrar, para que el relevo sea limpio.
     ────────────────────────────────────────────────────────────────────── */
  var ESPERA = 0;
  (function cortina() {
    var el = document.querySelector('[data-cortina]');
    if (!el) return;
    var fuera = false;
    function quitar() { if (fuera) return; fuera = true; el.hidden = true; }
    if (!motion) { quitar(); return; }
    ESPERA = 1.25;

    var iris = el.querySelector('[data-iris]');
    var centro = el.querySelector('.cortina__centro');
    var diagonal = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) * 1.1;
    gsap.set(centro, { opacity: 0, filter: 'blur(18px)' });
    var tl = gsap.timeline({ onComplete: quitar });
    tl.to(centro, { opacity: 1, filter: 'blur(0px)', duration: 0.62, ease: 'power2.out' })
      .to(centro, { opacity: 0, duration: 0.3, ease: 'power1.in' }, '+=0.12')
      .fromTo(iris, { width: 0, height: 0 },
        { width: diagonal, height: diagonal, duration: 0.9, ease: 'expo.inOut', immediateRender: false }, '-=0.16');
    setTimeout(quitar, 5000);   // red de seguridad: pase lo que pase, se va
  })();


  /* ── 1. Scroll suave ─────────────────────────────────────────────────── */
  var lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var destino = document.getElementById(id.slice(1));
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      if (lenis) lenis.scrollTo(destino, { offset: -70 });
      else destino.scrollIntoView();
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });

  /* ── 2. La carta: filas que se leen y la marca del examinador ────────── */
  (function carta() {
    var filas = $$('[data-fila]');
    var marca = $('[data-marca-fila]');
    if (!filas.length) return;
    if (!motion) { if (marca) marca.style.opacity = '0'; return; }

    var tl = gsap.timeline({ delay: ESPERA + 0.2 });
    filas.forEach(function (fila, i) {
      tl.fromTo(fila,
        { opacity: 0, filter: 'blur(14px)', y: 12 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.55, ease: 'power2.out', immediateRender: false },
        i === 0 ? 0 : '-=0.25');
      // la regleta salta a la fila que se acaba de leer
      tl.to(marca, {
        opacity: 1,
        y: fila.offsetTop + fila.offsetHeight / 2 - 1.5,
        duration: 0.3, ease: 'power2.inOut'
      }, '-=0.4');
    });
    tl.to(marca, { opacity: 0, duration: 0.5 }, '+=0.6');
  })();

  /* ── 3. Titulares que se enfocan ─────────────────────────────────────── */
  if (motion) {
    $$('[data-optotipo]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ── 4. Entradas ─────────────────────────────────────────────────────── */
  if (motion) {
    [['.hero__pie > *', 14, true], ['.datos li', 18], ['.montura', 22],
     ['.momentos li', 18], ['.limite', 22], ['.revision__foto', 22],
     ['.glosario > div', 16], ['.tabla tbody tr', 12], ['.servicios li', 16],
     ['.equipo li', 20], ['.taller__foto', 24]
    ].forEach(function (par) {
      $$(par[0]).forEach(function (el, i) {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          startAt: { y: par[1] },
          delay: par[2] ? ESPERA + 1.4 + i * 0.1 : (i % 4) * 0.06,
          scrollTrigger: par[2] ? null : { trigger: el, start: 'top 92%', once: true }
        });
      });
    });
  }

  /* ── 5. Catálogo filtrable (funciona con o sin movimiento) ───────────── */
  (function catalogo() {
    var chips = $$('.chip');
    var monturas = $$('.montura');
    var cuenta = $('[data-cuenta]');
    if (!chips.length || !monturas.length) return;

    function aplicar(filtro) {
      var visibles = 0;
      monturas.forEach(function (m) {
        var vale = filtro === 'todas' || m.getAttribute('data-material') === filtro;
        m.hidden = !vale;
        if (vale) {
          visibles++;
          if (motion) gsap.fromTo(m, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' });
        }
      });
      if (cuenta) cuenta.textContent = visibles + (visibles === 1 ? ' montura' : ' monturas');
      if (gsapReady) ScrollTrigger.refresh();
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          var esEste = c === chip;
          c.classList.toggle('esta-activo', esEste);
          c.setAttribute('aria-pressed', String(esEste));
        });
        aplicar(chip.getAttribute('data-filtro'));
      });
    });
  })();

  /* ── 6. Simulador de graduación (herramienta, no adorno) ─────────────── */
  (function simulador() {
    var rango = $('[data-rango]');
    var texto = $('[data-borroso]');
    var valor = $('[data-valor]');
    if (!rango || !texto) return;

    function pintar() {
      var v = parseInt(rango.value, 10);       // 0 a 60 → 0,00 a 6,00 dioptrías
      var dioptrias = v / 10;
      texto.style.setProperty('--desenfoque', (v * 0.14).toFixed(2) + 'px');
      if (!valor) return;
      if (v === 0) {
        valor.textContent = '0,00 dioptrías · así lo ves con tu corrección puesta';
      } else {
        var txt = ('−' + dioptrias.toFixed(2)).replace('.', ',');
        valor.textContent = txt + ' dioptrías · a un metro y medio del cartel';
      }
    }
    rango.addEventListener('input', pintar);
    pintar();
  })();

  /* ── 7. Contadores ───────────────────────────────────────────────────── */
  $$('[data-contador]').forEach(function (el) {
    var fin = parseFloat(el.getAttribute('data-contador'));
    var sufijo = el.getAttribute('data-sufijo') || '';
    if (!motion) { el.textContent = fin + sufijo; return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: fin, duration: 1.3, ease: 'power2.out',
      onUpdate: function () { el.textContent = Math.round(obj.v) + sufijo; },
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });

  /* ── 8. Botones magnéticos ───────────────────────────────────────────── */
  if (motion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-iman]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var c = el.getBoundingClientRect();
        qx((e.clientX - (c.left + c.width / 2)) * 0.28);
        qy((e.clientY - (c.top + c.height / 2)) * 0.38);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
      el.addEventListener('blur', function () { qx(0); qy(0); });
    });
  }

  /* ── 9. Cursor con forma de lente ────────────────────────────────────── */
  (function cursor() {
    var el = $('[data-cursor]');
    if (!el || !motion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var texto = $('.cursor__texto', el);
    var qx = gsap.quickTo(el, 'x', { duration: 0.2, ease: 'power3.out' });
    var qy = gsap.quickTo(el, 'y', { duration: 0.2, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) { qx(e.clientX); qy(e.clientY); });

    var zonas = [
      ['.montura', 'probártela'],
      ['.simulador', 'mueve'],
      ['.carta', 'lee'],
      ['[data-mapa-boton]', 'cargar'],
      ['a, button, input, select, textarea', 'adelante']
    ];
    document.addEventListener('pointerover', function (e) {
      for (var i = 0; i < zonas.length; i++) {
        if (e.target.closest(zonas[i][0])) {
          el.classList.add('es-grande');
          texto.textContent = zonas[i][1];
          return;
        }
      }
      el.classList.remove('es-grande');
      texto.textContent = '';
    });
  })();

  /* ── 10. Horario en vivo ─────────────────────────────────────────────── */
  (function horario() {
    var estado = $('[data-estado]');
    if (!estado) return;
    var filas = $$('[data-horario] > div');
    // Horario ficticio. 0 = domingo. Minutos desde medianoche.
    var HORARIO = {
      0: [],
      1: [[600, 810], [990, 1230]],
      2: [[600, 810], [990, 1230]],
      3: [[600, 810], [990, 1230]],
      4: [[600, 810], [990, 1230]],
      5: [[600, 810], [990, 1230]],
      6: [[630, 810]]
    };
    var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    function dosDigitos(n) { return String(n).padStart(2, '0'); }
    function enTexto(m) { return dosDigitos(Math.floor(m / 60)) + ':' + dosDigitos(m % 60); }

    function refrescar() {
      var ahora = new Date();
      var d = ahora.getDay();
      var min = ahora.getHours() * 60 + ahora.getMinutes();
      var tramos = HORARIO[d];
      var abierto = null, siguienteHoy = null;

      tramos.forEach(function (t) {
        if (min >= t[0] && min < t[1]) abierto = t[1];
        else if (min < t[0] && siguienteHoy === null) siguienteHoy = t[0];
      });

      if (abierto !== null) {
        estado.textContent = 'Abierto ahora · hasta las ' + enTexto(abierto);
        estado.classList.add('esta-abierto');
      } else if (siguienteHoy !== null) {
        estado.textContent = 'Cerrado · abre hoy a las ' + enTexto(siguienteHoy);
        estado.classList.remove('esta-abierto');
      } else {
        var salto = 1;
        while (salto < 8 && HORARIO[(d + salto) % 7].length === 0) salto++;
        var dd = (d + salto) % 7;
        estado.textContent = 'Cerrado · abre el ' + DIAS[dd] + ' a las ' + enTexto(HORARIO[dd][0][0]);
        estado.classList.remove('esta-abierto');
      }

      filas.forEach(function (f) {
        var dias = (f.getAttribute('data-dias') || '').split(',');
        f.classList.toggle('es-hoy', dias.indexOf(String(d)) !== -1);
      });
    }
    refrescar();
    setInterval(refrescar, 30000);
  })();

  /* ── 11. Cabecera ────────────────────────────────────────────────────── */
  (function cabecera() {
    var el = $('[data-cabecera]');
    if (!el) return;
    function mirar() { el.classList.toggle('esta-pegada', window.scrollY > 20); }
    mirar();
    window.addEventListener('scroll', mirar, { passive: true });
  })();

  /* ── 12. Menú móvil ──────────────────────────────────────────────────── */
  var boton = $('[data-menu-boton]');
  var menu = $('[data-menu]');
  function cerrarMenu() {
    if (!boton || !menu) return;
    boton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('esta-abierto');
  }
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abiertoYa = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abiertoYa));
      menu.classList.toggle('esta-abierto', !abiertoYa);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  }

  /* ── 13. Mapa solo bajo clic ─────────────────────────────────────────── */
  (function mapa() {
    var caja = $('[data-mapa]');
    var btn = $('[data-mapa-boton]');
    if (!caja || !btn) return;
    btn.addEventListener('click', function () {
      var marco = document.createElement('iframe');
      marco.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Rúa Nova do Faro 14, Pontevedra') + '&output=embed';
      marco.title = 'Mapa de la dirección de muestra: Rúa Nova do Faro, 14, Pontevedra';
      marco.loading = 'lazy';
      marco.referrerPolicy = 'no-referrer-when-downgrade';
      btn.remove();
      caja.insertBefore(marco, caja.firstChild);
      if (gsapReady) ScrollTrigger.refresh();
    });
  })();

  /* ── 14. Formulario de cita (de muestra) ─────────────────────────────── */
  (function cita() {
    var form = $('[data-cita]');
    if (!form) return;
    var salida = $('[data-cita-estado]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.querySelector('#nombre');
      var tel = form.querySelector('#tel');
      if (!nombre.value.trim()) { salida.textContent = 'Escribe un nombre para la cita.'; nombre.focus(); return; }
      if (!tel.value.trim()) { salida.textContent = 'Hace falta un teléfono para confirmarte la hora.'; tel.focus(); return; }
      salida.textContent = 'Formulario de demostración: la cita de ' + nombre.value.trim() + ' no se ha enviado a ningún sitio.';
    });
  })();

  /* ── 15. Aviso de cookies ────────────────────────────────────────────── */
  (function cookies() {
    var banner = $('[data-cookies]');
    if (!banner) return;
    var CLAVE = 'sextante-cookies';
    var visto = null;
    try { visto = localStorage.getItem(CLAVE); } catch (err) { visto = null; }
    if (!visto) banner.hidden = false;
    var ok = $('[data-cookies-ok]', banner);
    if (ok) {
      ok.addEventListener('click', function () {
        banner.hidden = true;
        try { localStorage.setItem(CLAVE, '1'); } catch (err) { /* modo privado */ }
      });
    }
  })();

  /* ── 16. Refrescos ───────────────────────────────────────────────────── */
  if (gsapReady) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
