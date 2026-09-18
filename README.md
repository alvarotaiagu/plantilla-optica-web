# Óptica Sextante — plantilla de óptica

> **Sitio de demostración.** «Óptica Sextante» es un **negocio ficticio**. El nombre, la
> dirección (Rúa Nova do Faro, 14 · Pontevedra), el teléfono (986 00 00 21), el horario,
> los precios, los ocho modelos de montura y las tres personas del equipo son **datos de
> muestra inventados**. No corresponden a ningún negocio real. La página lleva
> `noindex, nofollow` a propósito.
>
> **Esta web no da ningún diagnóstico ni promete ningún resultado de salud.** Lo dice
> el propio sitio en tres lugares distintos.

**Demo:** https://alvarotaiagu.github.io/plantilla-optica-web/

---

## El concepto: «Optotipo»

La carta de letras de la pared es el objeto más reconocible de una óptica, y además es
una rejilla tipográfica perfecta: filas que menguan, una escala de agudeza al margen y
una regleta que señala la línea que toca leer. Aquí es el sistema visual entero:

- **El hero es literalmente una carta de optotipos**, y el mensaje del negocio está
  escrito en sus seis filas, de la más grande a la más pequeña. Al cargar, se leen una
  a una y la regleta azul va señalando cada línea.
- **Todo lo que entra, entra enfocándose**: los titulares llegan desenfocados y se
  afinan. Es lo que pasa cuando te ponen la lente correcta delante.
- **El simulador de graduación** convierte ese mismo desenfoque en una herramienta: una
  barra que enseña, muy por encima, cómo se lee un texto sin corregir.
- Registro **clínico y limpio**: mucho blanco, una sola tinta azul, rejilla ordenada y
  tipografía neutra. Es a propósito lo contrario de las otras plantillas de la tanda.

## Mapa de secciones

| # | Sección | Qué hace |
|---|---|---|
| — | Hero | Carta de optotipos con el mensaje y la regleta del examinador |
| — | Cifras | Cuatro contadores |
| 01 | Monturas | Catálogo de ocho monturas dibujadas, **filtrable** por material (funciona con y sin movimiento) |
| 02 | Tu graduación | Simulador de desenfoque con barra + glosario de la receta |
| 03 | La revisión | Los cinco momentos de la revisión, la foto del material y una caja negra con **lo que no hacemos** |
| 04 | Lentes | Tabla de precios por par y lista de servicios de taller |
| 05 | Taller | Las tres personas, cada una con su montura, y la foto del escaparate |
| 06 | Cita | Formulario de muestra, horario **en vivo** y mapa bajo clic |

## Recursos de movimiento

**0. Cortina de entrada.** **«Optotipo»** — la letra «E» entra desenfocada, se enfoca, y entonces se abre la pupila: un círculo que crece desde el centro hasta comerse la pantalla.

Es obligatoria en todas las plantillas (§5 del pliego) y está hecha para no dejar la
página tapada nunca: se retira al terminar la animación, se retira igual si el CDN de
GSAP no carga, se retira con `prefers-reduced-motion` y hay además un `setTimeout` de
5 s de red de seguridad. El `display` va en `.cortina:not([hidden])`, nunca en
`.cortina` a secas —si fuera a secas ganaría al atributo `hidden` y no se iría jamás.
El hero no entra hasta que la cortina va por la mitad (la constante `ESPERA` de
`main.js`), para que el relevo se vea como una sola cosa y no como dos animaciones
pegadas.

1. **Lenis** como único motor de scroll.
2. **La carta de optotipos** que se lee sola con la regleta saltando de fila — el
   recurso protagonista.
3. **Enfoque**: titulares que entran desenfocados y se afinan (`filter: blur`), siempre
   sobre elementos pequeños y con transición, nunca por fotograma ni a pantalla completa.
4. **Catálogo filtrable** con entrada animada de las fichas.
5. **Simulador de dioptrías** manejado por el visitante.
6. **Botones magnéticos** y **cursor** en forma de lente que engorda y cambia de texto.
7. **Contadores** y **horario en vivo** con el día de hoy resaltado.


## Rendimiento medido

Medido con `PerformanceObserver` de `longtask` (Chromium, 1440×900, recorrido completo
de la página con la rueda del ratón):

- **1 tarea larga en total**, de **141 ms**, y ocurre **al arrancar**: es GSAP más la
  webfont, no el código de la plantilla. La cortina de entrada no añade ninguna,
  porque su gesto son transformaciones, opacidad y un `width` de un solo círculo.
- **0 tareas largas mientras se recorre la página**: la carta de optotipos y el
  desenfoque de los titulares son filtros CSS sobre elementos sueltos, y el deslizador
  de dioptrías solo escribe una propiedad personalizada.

## Cómo reskinearlo a una óptica real

1. **El mensaje del hero está en las seis filas de la carta** (`.fila--1` a `.fila--6`):
   cada una tiene su tamaño en CSS y su valor de agudeza al margen. Hay que escribirlas
   de más corta a más larga, o la pirámide se rompe.
2. **Datos del negocio** — el `application/ld+json` del `<head>`, la sección `#cita`, el
   `<footer>` y la consulta del mapa (sección 13 de `js/main.js`).
   Quitar `noindex, nofollow` y el sello de demostración.
3. **Horario** — sección 10 de `js/main.js`: el objeto `HORARIO` en minutos desde
   medianoche, con `0 = domingo`, y el `<dl>` de `#cita` con su `data-dias`.
4. **Monturas** — los ocho SVG de `assets/monturas/`, generados con un script que dibuja
   media montura y la espeja. Para un cliente real lo normal es sustituirlos por fotos
   de producto: basta cambiar el `<img>` de cada `<li class="montura">` y mantener el
   `data-material`, que es lo que usa el filtro.
5. **Precios** — la tabla de `#lentes`, la lista de servicios y el precio de la revisión
   dentro de la caja «Lo que no hacemos».
6. **Paleta y tipografía** — las variables de `:root` en `css/estilo.css` y el `<link>`
   de Google Fonts.
7. **Textos legales** — `legal.html`. Ojo: si el formulario pregunta el motivo de la
   consulta, en una web real eso son datos de salud y necesita su propia base legal.

## Decisiones tomadas

- **Ni un diagnóstico ni una promesa.** La palabra «revisión visual» aparece siempre
  separada de «consulta médica», hay una sección entera dedicada a *lo que no hacemos*,
  y el simulador avisa de que nadie se gradúa la vista con una pantalla.
- **Sin `aggregateRating` ni `review`** en los datos estructurados, y sin testimonios.
- **Sin números de colegiado inventados**: los cargos se nombran, pero no se falsifica
  ningún registro profesional.
- **Fotos sin personas identificables**: solo material y escaparate, y con un pie que
  aclara que no es este negocio.
- **Las monturas son dibujo propio**, no fotos de producto de marcas reales.
- **El filtro del catálogo funciona sin GSAP**: es contenido, no adorno.
- **El contenido sigue vivo con `prefers-reduced-motion`**: filtro, simulador, horario
  y contadores funcionan igual; lo que se apaga es el movimiento.
- **Sin GSAP la página se lee entera**: los estados «vacíos» viven bajo `.has-motion`.

## Créditos

Ver [`CREDITOS.md`](CREDITOS.md). Dos fotos de Pexels acreditadas; el resto es dibujo
propio.

## Técnico

HTML + CSS + un `main.js`. Sin framework, sin build, sin backend, sin npm. GSAP,
ScrollTrigger y Lenis por CDN. Se abre con doble clic en `index.html` y se publica tal
cual en GitHub Pages.
