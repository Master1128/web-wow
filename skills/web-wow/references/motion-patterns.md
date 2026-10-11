# Motion and interaction patterns

Vanilla CSS/JS first; GSAP, Lenis and Three.js where the effect needs them (versions and licenses: `libraries.md`).
Every snippet: honors `prefers-reduced-motion`, animates only `transform` / `opacity` / `filter` (plus `clip-path` for one
big wipe, and text rewrites for count-up and typing), and degrades safely when an API or library is missing.
Tokens come from the project `DESIGN.md`; the values here are defaults.

Pointer patterns cache `getBoundingClientRect()` on `pointerenter` (no layout reads while moving) and assume the page does not
scroll under a stationary cursor.

Status of the snippets: sections 1-5, 7, 8 and 10 and the period toggle and drawer in section 27 were smoke-tested in Chromium in
the project this method came from; the other snippets are adapted from the three prototypes and reviewed by reading.
Verify any pattern in a screenshot or measurement before reporting it as working.

Contents: 0 prelude, 1 crossfade, 2 shared element, 3 dock, 4 blur focus, 5 count-up, 6 stagger reveal, 7 hover lift and tilt,
8 spotlight, 9 magnetic, 10 blur-fade words, 11 marquee, 12 scroll-driven CSS, 13 one accent, 14 GSAP matchMedia,
15 logo to points, 16 smoothed scroll progress and adaptive quality, 17 fitted type, 18 element-to-fullscreen wipe,
19 pinned horizontal section, 20 nav theme follows the surface, 21 curtain transition, 22 skippable boot, 23 draggable window,
24 terminal command resolution, 25 simulated live monitor, 26 opt-in sound, 27 drawer, period toggle and chart tooltip,
28 custom cursor (concept-only).

---

## 0. Shared prelude (include once)

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 320ms;
}
.sr-only { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Global safety net: anything missed below still stops animating. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important; scroll-behavior: auto !important;
  }
}
```

```js
// motion.js
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
// Put this in <head> so "hidden until revealed" styles only apply when JS runs:
// <script>document.documentElement.classList.add('js')</script>
```

## 1. Crossfade between views

Same-document View Transition; the default `root` animation is already a cross-fade. Scope it to a region so the chrome stays still.

```css
main { view-transition-name: view; }
::view-transition-old(view), ::view-transition-new(view) {
  animation-duration: var(--dur-slow); animation-timing-function: var(--ease-in-out);
}
```

```js
import { reducedMotion } from './motion.js';

export function crossfade(update) {          // update(): synchronous or async DOM swap
  if (!document.startViewTransition || reducedMotion()) return Promise.resolve(update());
  return document.startViewTransition(update).finished.catch(() => {});
}
// crossfade(() => { current.hidden = true; next.hidden = false; });
```

## 2. Shared element (View Transitions API)

Same document: name the source before the snapshot, hand the name to the new element inside the callback.
Names must be unique at snapshot time or the transition is skipped.

```js
import { reducedMotion } from './motion.js';

export async function sharedElement(source, name, update) {
  // update() renders the destination and RETURNS the element that receives the name
  if (!document.startViewTransition || reducedMotion()) { await update(); return; }
  source.style.viewTransitionName = name;                 // old snapshot
  let target;
  const t = document.startViewTransition(async () => {
    source.style.viewTransitionName = '';                 // free the name
    target = await update();
    target.style.viewTransitionName = name;               // new snapshot
  });
  try { await t.finished; } finally { if (target) target.style.viewTransitionName = ''; }
}
```

Cross-document (multi-page site, no JS): opt in on every page, give matching elements the same unique name.

```css
@view-transition { navigation: auto; }
/* list page: <h3 style="view-transition-name: post-12">  detail page: <h1 style="view-transition-name: post-12"> */
::view-transition-old(root), ::view-transition-new(root) { animation-duration: var(--dur-slow); }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```
Support: same-document Chromium 111+, Safari 18+, Firefox 144+; cross-document Chromium 126+, Safari 18.2+. Unsupported browsers navigate normally.

## 3. Magnification dock (pointer-distance scale)

Centers are measured once on `pointerenter`; per move only `--s` is written.

```css
.dock { display: flex; align-items: flex-end; gap: 16px; }
.dock-item { transform: scale(var(--s, 1)); transform-origin: 50% 100%; transition: transform 100ms var(--ease-out); }
```

```js
import { reducedMotion, finePointer } from './motion.js';

export function dock(root, { max = 1.5, radius = 120 } = {}) {
  if (reducedMotion() || !finePointer()) return;
  const items = [...root.querySelectorAll('.dock-item')];
  let centers = [], x = null, raf = 0;
  const falloff = d => 1 + (max - 1) * Math.max(0, 1 - d / radius) ** 2;
  const paint = () => {
    raf = 0;
    items.forEach((el, i) => el.style.setProperty('--s', x === null ? 1 : falloff(Math.abs(x - centers[i])).toFixed(3)));
  };
  const queue = () => { raf ||= requestAnimationFrame(paint); };
  root.addEventListener('pointerenter', () => {
    centers = items.map(el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; });
  });
  root.addEventListener('pointermove', e => { x = e.clientX; queue(); });
  root.addEventListener('pointerleave', () => { x = null; queue(); });
}
```
On phones the dock is a plain bottom bar with 44px targets and `padding-bottom: max(10px, env(safe-area-inset-bottom))`; no magnification.

## 4. Blur focus (blur everything except the focused element)

```css
.blur-group .blur-item { transition: filter var(--dur-slow) var(--ease-out), opacity var(--dur-slow) var(--ease-out); }
@media (hover: hover) {
  .blur-group:has(.blur-item:hover) .blur-item:not(:hover),
  .blur-group:has(.blur-item:focus-within) .blur-item:not(:focus-within) { filter: blur(6px); opacity: 0.5; }
}
```
Programmatic variant: `data-focused` on one child, `.blur-group:has([data-focused]) > :not([data-focused]) { filter: blur(6px); opacity: .5 }`.
Never blur text the user must read.

## 5. Count-up numbers

Markup keeps the final value (no-JS and SEO safe): `<span data-to="1284" data-decimals="0">1,284</span>`.

```css
[data-to] { font-variant-numeric: tabular-nums; min-inline-size: 4ch; }
```

```js
// count-up.js
import { reducedMotion } from './motion.js';

const state = new WeakMap();                                   // el -> { value, raf }
const easeOut = t => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));        // expo-out
const fmtFor = d => new Intl.NumberFormat(document.documentElement.lang || undefined,
  { minimumFractionDigits: d, maximumFractionDigits: d });

export function setNumber(el, to, { duration = 900, decimals = Number(el.dataset.decimals || 0) } = {}) {
  const fmt = fmtFor(decimals);
  const s = state.get(el) ?? { value: Number(el.dataset.from || 0), raf: 0 };
  state.set(el, s);
  cancelAnimationFrame(s.raf);                                 // retarget mid-flight (period toggles)
  const from = s.value;
  if (reducedMotion() || from === to) { s.value = to; el.textContent = fmt.format(to); return; }
  const t0 = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - t0) / duration);
    s.value = from + (to - from) * easeOut(p);
    el.textContent = fmt.format(s.value);
    if (p < 1) s.raf = requestAnimationFrame(tick);
  };
  s.raf = requestAnimationFrame(tick);
}

export function countUpOnView(root = document, opts) {
  const els = [...root.querySelectorAll('[data-to]')];
  if (reducedMotion()) return;                                 // keep the server-rendered final values
  els.forEach(el => { el.textContent = fmtFor(Number(el.dataset.decimals || 0)).format(Number(el.dataset.from || 0)); });
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { setNumber(e.target, Number(e.target.dataset.to), opts); io.unobserve(e.target); }
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
}
```

## 6. Stagger-in on scroll

```css
@media (prefers-reduced-motion: no-preference) {
  .js .reveal { opacity: 0; transform: translateY(12px); }
  .js .reveal.in {
    opacity: 1; transform: none;
    transition: opacity 500ms var(--ease-out) calc(var(--i, 0) * 50ms),
                transform 500ms var(--ease-out) calc(var(--i, 0) * 50ms);
  }
}
```

```js
export function revealOnScroll(selector = '.reveal') {
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, i) => {   // index within the batch = stagger order
      e.target.style.setProperty('--i', i);
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  document.querySelectorAll(selector).forEach(el => io.observe(el));
}
```

## 7. Hover lift and tilt for cards

```css
.card { transition: transform var(--dur-base) var(--ease-out), border-color var(--dur-base); }
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .card:hover { transform: translateY(-2px); border-color: var(--line-strong); }
  .tilt { transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
  .tilt:hover { transform: perspective(800px) translateY(-2px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
}
```

```js
import { reducedMotion, finePointer } from './motion.js';

export function tilt(card, max = 6) {                          // degrees; keep it subtle
  if (reducedMotion() || !finePointer()) return;
  let rect, raf = 0, rx = 0, ry = 0;
  card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
  card.addEventListener('pointermove', e => {
    if (!rect) return;
    ry = ((e.clientX - rect.left) / rect.width - 0.5) * max * 2;
    rx = -((e.clientY - rect.top) / rect.height - 0.5) * max * 2;
    raf ||= requestAnimationFrame(() => {
      raf = 0;
      card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    });
  });
  card.addEventListener('pointerleave', () => { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
}
```

## 8. Cursor spotlight / glow on cards

A fixed-size radial gradient moved with `transform` (compositor only); the accent stays at low alpha.

```css
.spot { position: relative; overflow: hidden; isolation: isolate; }
.spot::before {
  content: ""; position: absolute; inset: 0 auto auto 0; inline-size: 320px; block-size: 320px;
  border-radius: 50%; pointer-events: none; z-index: -1; opacity: 0;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--accent) 16%, transparent), transparent);
  transform: translate3d(calc(var(--x, 0px) - 160px), calc(var(--y, 0px) - 160px), 0);
  transition: opacity var(--dur-slow) var(--ease-out);
}
@media (hover: hover) { .spot:hover::before { opacity: 1; } }
```

```js
import { reducedMotion, finePointer } from './motion.js';

export function spotlight(card) {
  if (reducedMotion() || !finePointer()) return;
  let rect;
  card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
  card.addEventListener('pointermove', e => {
    if (!rect) return;
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
}
```

## 9. Magnetic buttons

The wrapper (static, padded) is measured; only its child moves, so there is no feedback loop. Use on one primary CTA.

```css
[data-magnetic] { display: inline-block; padding: 20px; margin: -20px; }
[data-magnetic] > * { transition: transform 250ms var(--ease-out); }
```

```js
import { reducedMotion, finePointer } from './motion.js';

export function magnetic(zone, { pull = 0.3 } = {}) {
  const target = zone.firstElementChild;
  if (!target || reducedMotion() || !finePointer()) return;
  let rect;
  zone.addEventListener('pointerenter', () => { rect = zone.getBoundingClientRect(); });
  zone.addEventListener('pointermove', e => {
    if (!rect) return;
    const dx = (e.clientX - (rect.left + rect.width / 2)) * pull;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * pull;
    target.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
  });
  zone.addEventListener('pointerleave', () => { target.style.transform = ''; });
}
```
GSAP version (as in the prototypes): `gsap.quickTo(target, 'x', { duration: .7, ease: 'elastic.out(1, 0.45)' })` per axis, fed with `dx * 0.38`,
and the inner label moves at about 0.16 for depth. Keep it inside `matchMedia('(hover: hover) and (pointer: fine)')`.

## 10. Text blur-fade word reveal

Words animate; screen readers get one intact string via an `.sr-only` copy.

```css
.bw { display: inline-block; }
@media (prefers-reduced-motion: no-preference) {
  .bw { opacity: 0; filter: blur(8px); transform: translateY(0.25em);
        animation: bw-in 700ms var(--ease-out) forwards; animation-play-state: paused;
        animation-delay: calc(var(--i) * 60ms); }
  .in .bw { animation-play-state: running; }
  @keyframes bw-in { to { opacity: 1; filter: blur(0); transform: none; } }
}
.bw[data-accent] { color: var(--accent-text, var(--accent)); }
```

```js
export function blurWords(el, { accent = -1 } = {}) {          // accent: index of the one highlighted word
  const text = el.textContent.trim();
  const sr = Object.assign(document.createElement('span'), { className: 'sr-only', textContent: text });
  el.replaceChildren(sr);
  text.split(/\s+/).forEach((word, i) => {
    const s = Object.assign(document.createElement('span'), { className: 'bw', textContent: word });
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i);
    if (i === accent) s.dataset.accent = '';
    el.append(s, ' ');
  });
  return el;                                                   // add class "in" to play (hero: immediately; else via IntersectionObserver)
}
```

## 11. Logo marquee (at most one per page)

The track holds two identical groups; moving `-50%` loops seamlessly.

```html
<div class="marquee" aria-label="Partners">
  <div class="marquee-track">
    <ul class="marquee-group"><li><img src="a.svg" alt="Partner A" width="120" height="32"></li></ul>
    <ul class="marquee-group" aria-hidden="true"><li><img src="a.svg" alt="" width="120" height="32"></li></ul>
  </div>
</div>
```

```css
.marquee { overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 12% 88%, transparent); }
.marquee-track { display: flex; inline-size: max-content; animation: marquee 40s linear infinite; }
.marquee-group { display: flex; flex-shrink: 0; gap: 3rem; padding-inline-end: 3rem; list-style: none; margin: 0; }
@keyframes marquee { to { transform: translateX(-50%); } }
.marquee:hover .marquee-track, .marquee:focus-within .marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .marquee { mask-image: none; }
  .marquee-track { animation: none; inline-size: auto; flex-wrap: wrap; }
  .marquee-group[aria-hidden="true"] { display: none; }
}
```
Only real logos of real relationships. Never fill a marquee with invented clients.

## 12. Scroll-driven animations (`animation-timeline`) with fallback

Without support the content simply stays visible. Declare `animation-timeline` AFTER the `animation` shorthand (the shorthand resets it).

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .sd { animation: sd-in linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
    @keyframes sd-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }

    .progress { position: fixed; inset: 0 0 auto 0; block-size: 2px; background: var(--accent);
      transform-origin: 0 50%; transform: scaleX(0); animation: grow linear both; animation-timeline: scroll(root block); }
    @keyframes grow { to { transform: scaleX(1); } }
  }
}
```
Support: Chromium 115+, Safari 26+; Firefox behind a flag, so the fallback matters.

## 13. One accent recolors everything

Components reference only semantic tokens; swapping `--accent` (and its on-color) re-themes the UI.

```css
:root {
  --accent: #FF6B3D;
  --on-accent: #2A0F05;                                          /* pick for 4.5:1 contrast */
  --accent-hover: color-mix(in oklab, var(--accent), white 14%);
  --accent-soft: color-mix(in srgb, var(--accent) 16%, var(--bg));
  --accent-text: var(--accent);                                  /* override on light backgrounds */
}
.btn-primary { background: var(--accent); color: var(--on-accent); }
.btn-primary:hover { background: var(--accent-hover); }
```
Verdict colors (success/warning/danger) stay separate from the accent. Color means something or it is not used.

## 14. GSAP with `matchMedia` and a reduced-motion guard

Everything created inside `mm.add` is reverted when the query stops matching, so under reduced motion the page is the static layout.

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();
mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 900px)' }, ({ conditions }) => {
  if (!conditions.motion) return;                                // reduced motion: create nothing
  gsap.set('.reveal', { opacity: 0, y: 12 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%', once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05, overwrite: true }),
  });
  if (conditions.wide) {                                         // pinned scene only where there is room
    gsap.timeline({ scrollTrigger: { trigger: '.story', start: 'top top', end: '+=1500', pin: true, scrub: 0.5 } })
      .from('.story-step', { opacity: 0, y: 24, stagger: 0.3 });
  }
});
```

---

# Signature techniques from the three prototypes

## 15. Logo to points (direction A)

Turn outlined SVG paths into point clouds by drawing once to a canvas and reading pixels. Use path data (`d` strings), not live text.
If counters (the hole in R, A, O) fill in, fill with the `'evenodd'` rule.

```js
// Returns two pools of [x, y, x, y, ...] in SVG user units: interior pixels and edge pixels.
export function sampleSvgPath(d, box /* { x, y, w, h } covering the path */, res = 2) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(box.w * res); c.height = Math.ceil(box.h * res);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.setTransform(res, 0, 0, res, -box.x * res, -box.y * res);
  g.fillStyle = '#fff';
  g.fill(new Path2D(d) /*, 'evenodd' */);
  const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
  const on = (x, y) => x >= 0 && y >= 0 && x < width && y < height && data[(y * width + x) * 4 + 3] > 128;
  const fill = [], edge = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!on(x, y)) continue;
    const isEdge = !on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1);
    (isEdge ? edge : fill).push(box.x + x / res, box.y + y / res);
  }
  return { fill, edge };
}

// Seeded RNG so every load produces the same cloud (mulberry32).
export const rng = seed => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
```

World space: `wx = (ux - cx) / UNIT`, `wy = -(uy - cy) / UNIT` (SVG y points down, three.js y points up). Draw about 30% of points
from the edge pool so the silhouette stays crisp. Give each point a small z in `[-0.3, 0.3]` so it has thickness when the camera moves.

Wiring (three.js, loaded with dynamic `import('three')`):

```js
const THREE = await import('three');
const N = isPhone ? 7000 : 22000;
const rand = rng(1337);
const aLogo = new Float32Array(N * 3), aNet = new Float32Array(N * 3), aScat = new Float32Array(N * 3), aRand = new Float32Array(N * 4);
// fill aLogo from the pools, aNet from node/edge positions (random point along a random edge, or inside a node sphere),
// aScat on a large shell, aRand with four random numbers per point.
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(aLogo, 3));
geo.setAttribute('aNet', new THREE.BufferAttribute(aNet, 3));
geo.setAttribute('aScat', new THREE.BufferAttribute(aScat, 3));
geo.setAttribute('aRand', new THREE.BufferAttribute(aRand, 4));
const uniforms = {
  uTime: { value: 0 }, uAssemble: { value: 0 }, uMorph: { value: 0 }, uStrength: { value: 0 }, uRadius: { value: 0.3 },
  uPointer: { value: new THREE.Vector2(9, 9) }, uAspect: { value: 1 }, uScale: { value: 1 }, uSize: { value: 0.045 },
  uColor: { value: new THREE.Color('#F6F2F0') },
};
const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false });
const points = new THREE.Points(geo, material); points.frustumCulled = false; scene.add(points);
// per resize: uScale = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
```

Vertex shader (reduced from the prototype: intro assemble, scroll morph with mid-flight burst, pointer repel in screen space):

```glsl
attribute vec3 aNet; attribute vec3 aScat; attribute vec4 aRand;
uniform float uTime, uAssemble, uMorph, uStrength, uRadius, uAspect, uScale, uSize;
uniform vec2 uPointer;
varying float vAlpha;
void main() {
  float ia = clamp(uAssemble * 1.75 - aRand.x * 0.75, 0., 1.);        // per-point stagger of the intro
  ia = 1. - pow(1. - ia, 3.);
  float m = clamp(uMorph * 1.65 - aRand.y * 0.65, 0., 1.);            // per-point stagger of the morph
  m = m * m * (3. - 2. * m);
  vec3 target = mix(position, aNet, m);
  target += normalize(aScat + vec3(1e-3)) * sin(m * 3.14159265) * (2. + aRand.z * 6.);   // burst while morphing
  target += vec3(sin(uTime * .7 + aRand.x * 40.), cos(uTime * .6 + aRand.y * 37.), sin(uTime * .5 + aRand.z * 31.)) * .04;
  vec3 p = mix(aScat, target, ia);

  vec4 mv = modelViewMatrix * vec4(p, 1.);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 d = (ndc - uPointer) * vec2(uAspect, 1.);
  float dist = length(d);
  float infl = smoothstep(uRadius, 0., dist) * uStrength * ia;        // 1 near the pointer, 0 far away
  vec2 push = d / (dist + 1e-4) * infl * .17 * (.55 + aRand.z * .9);  // radial repel
  push += vec2(-d.y, d.x) / (dist + 1e-4) * infl * .075;              // small swirl
  push.x /= uAspect;
  mv.xy += push * clip.w / vec2(projectionMatrix[0][0], projectionMatrix[1][1]);   // NDC offset back to view space

  gl_PointSize = clamp(uSize * (1. + infl * .6) * uScale / max(-mv.z, .1), 1., 64.);
  gl_Position = projectionMatrix * mv;
  vAlpha = ia * mix(.55, 1., aRand.w);
}
```

```glsl
uniform vec3 uColor; varying float vAlpha;
void main() {
  float a = smoothstep(1., .25, length(gl_PointCoord - .5) * 2.);
  if (a < .01) discard;
  gl_FragColor = vec4(uColor, a * vAlpha);
}
```

Pointer: store `ndc = (clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1`, ease it toward the target each frame,
ease `uStrength` to 1 while the pointer moved in the last ~2s and back to 0 after. On touch devices drive the pointer with a slow Lissajous drift.
The coral cursor block, labels and node glows in the prototype are extra draw calls: add them only after the core reads well.

Fallback contract: reduced motion, no WebGL, or the scene not ready in 9s => static outlined logo + final caption.

```js
const scene = await Promise.race([createScene(), new Promise((_, rej) => setTimeout(() => rej(new Error('scene timeout')), 9000))])
  .catch(() => null);
if (!scene) document.documentElement.classList.add('no-gl');      // CSS shows the static SVG hero
```

## 16. Smoothed scroll progress and adaptive quality

A tall empty scroll space drives a fixed WebGL stage. Never write ScrollTrigger progress straight into the camera: ease it.

```js
const stage = { target: 0, value: 0 };
ScrollTrigger.create({ trigger: '#scroll-space', start: 'top top', end: 'bottom bottom', onUpdate: s => { stage.target = s.progress; } });

let last = performance.now(), fpsEma = 60, prev = last, slow = 0, steps = 0, pixelRatio = Math.min(devicePixelRatio, isPhone ? 1.5 : 2);
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  stage.value += (stage.target - stage.value) * (1 - Math.exp(-dt * 4.2));      // frame-rate independent easing
  fpsEma += (1000 / Math.max(now - prev, 1) - fpsEma) * 0.05; prev = now;
  slow = fpsEma < 42 ? slow + dt : Math.max(0, slow - dt);
  if (slow > 2.2 && pixelRatio > 1 && steps < 3) {                               // adaptive resolution, max 3 steps
    pixelRatio = Math.max(1, pixelRatio - 0.3); steps++; slow = 0;
    renderer.setPixelRatio(pixelRatio); renderer.setSize(innerWidth, innerHeight, false);
  }
  // camera.position / uniforms from stage.value; renderer.render(scene, camera);
}
requestAnimationFrame(frame);
```
Overlay copy tied to the same scroll uses a scrubbed GSAP timeline on the same trigger (`scrub: 0.6`), with blur and opacity only.

## 17. Fitted type (every giant line fills its measure)

```css
[data-fit] { display: inline-block; white-space: nowrap; line-height: 0.85; }
```

```js
export function fitText(el) {
  const box = el.closest('[data-fit-box]') || el.parentElement;
  const cs = getComputedStyle(box);
  const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  el.style.fontSize = '100px';                                   // measure at a known size; letter-spacing is in em so it scales linearly
  const natural = el.scrollWidth;
  el.style.fontSize = ((100 * avail) / natural * 0.99).toFixed(2) + 'px';
}
export const fitAll = () => document.querySelectorAll('[data-fit]').forEach(fitText);

Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]).then(fitAll);   // never measure before the font loads
let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fitAll, 120); });
// With ScrollTrigger: ScrollTrigger.addEventListener('refreshInit', fitAll);
```
Mobile: after fitting, if the stacked lines are taller than the viewport box, multiply all their font sizes by `avail / need * 0.97`.

## 18. Element-to-fullscreen wipe (cursor block becomes the page)

Clone the hero as an inverted layer (ink on accent) BEFORE splitting text so both layers register to the pixel. Clip the layer to the
rect of a small element (the cursor block), then scrub its clip-path to `inset(0)`.

```js
const insetFromEl = (container, el) => () => {
  const a = container.getBoundingClientRect(), r = el.getBoundingClientRect();
  const px = n => Math.max(0, n).toFixed(1) + 'px';
  return `inset(${px(r.top - a.top)} ${px(a.right - r.right)} ${px(a.bottom - r.bottom)} ${px(r.left - a.left)})`;
};

gsap.timeline({ scrollTrigger: { trigger: act, start: 'top top', end: () => '+=' + innerHeight * 1.9, pin: true, scrub: 0.6, invalidateOnRefresh: true } })
  .set(band, { visibility: 'visible' }, 0.02)
  .set(block, { visibility: 'hidden' }, 0.02)                    // the band now shows the block, so hide the original
  .fromTo(band, { clipPath: insetFromEl(act, block) }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 4, ease: 'power3.inOut' }, 0.02);
```
Function-based `from` values are re-read on refresh (`invalidateOnRefresh`). On phones finish the wipe first, then fade the statement
in over the finished field, so nothing is ever half-clipped. Use this once per page.

## 19. Pinned horizontal section

```js
mm.add('(min-width: 900px)', () => {
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const h = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + Math.round(dist() * 0.6),
      pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: self => { bar.style.transform = `scaleX(${self.progress})`; } },
  });
  items.forEach(item => gsap.fromTo(item.querySelector('.cap'), { x: 90 }, { x: -90, ease: 'none',
    scrollTrigger: { trigger: item, containerAnimation: h, start: 'left right', end: 'right left', scrub: true } }));  // parallax inside the pin
});
mm.add('(max-width: 899px)', () => {                              // no pin on phones: vertical reveals
  items.forEach(item => gsap.from(item.querySelector('.word'), { yPercent: 110, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: item, start: 'top 82%', once: true } }));
});
```
`end` uses `dist() * 0.6` so the horizontal movement feels quick; raise it for a slower read. Pin at most two sections per page.

## 20. Nav theme follows the surface under it

```js
const setTheme = t => { if (nav.dataset.theme !== t) nav.dataset.theme = t; };   // CSS keys colors off [data-theme]
ScrollTrigger.create({ trigger: '.services', start: 'top 56px', onEnter: () => setTheme('dark'), onLeaveBack: () => setTheme('accent') });
ScrollTrigger.create({ trigger: '.cta', start: 'top 56px', onEnter: () => setTheme('paper'), onLeaveBack: () => setTheme('dark') });
```

## 21. Curtain transition for in-page navigation

```js
function go(y) {
  gsap.timeline()
    .set(curtain, { visibility: 'visible', yPercent: 100 })
    .to(curtain, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
    .add(() => { lenis.scrollTo(y, { immediate: true, force: true }); ScrollTrigger.update(); })
    .to({}, { duration: 0.35 })
    .to(curtain, { yPercent: -100, duration: 0.85, ease: 'expo.inOut' })
    .set(curtain, { visibility: 'hidden' });
}
```
Guard against double clicks with a `busy` flag. Under reduced motion call `lenis.scrollTo(y, { immediate: true })` and skip the curtain.

## 22. Skippable boot sequence

Rules: at most about 2s, skippable on the first pointer or key event, shown once per session, never blocks content if a library fails.

```js
const seen = (() => { try { return sessionStorage.getItem('booted') === '1'; } catch { return false; } })();
const force = new URLSearchParams(location.search).has('boot');
if (reducedMotion() || (seen && !force)) { showDesktop(); }
else {
  const tl = gsap.timeline({ onComplete: () => { showDesktop(); try { sessionStorage.setItem('booted', '1'); } catch {} } });
  tl.fromTo('.boot-grid', { opacity: 0 }, { opacity: 0.6, duration: 0.45 }, 0)
    .to('.boot-logo-path', { strokeDashoffset: 0, duration: 0.75, ease: 'power2.inOut' }, 0.05)     // path has pathLength="1", dasharray 1
    .to('.boot-line', { opacity: 1, x: 0, duration: 0.14, stagger: 0.27 }, 0.42)                    // "[ ok ] connecting ..." lines
    .to('.boot-bar', { scaleX: 1, duration: 1.45, ease: 'power1.inOut' }, 0.4)
    .to('#boot', { clipPath: 'inset(50% 0% 50% 0%)', duration: 0.55, ease: 'expo.inOut' }, 1.95);
  const skip = () => tl.timeScale(7);                             // fast-forward instead of cutting, so the end state is always clean
  addEventListener('pointerdown', skip, { once: true }); addEventListener('keydown', skip, { once: true });
}
```

## 23. Draggable window (Pointer Events, keyboard alternative)

```css
.win-bar { touch-action: none; cursor: grab; }
.win.dragging .win-bar { cursor: grabbing; }
```

```js
let zTop = 20;
export function makeDraggable(win, handle, { keep = 140, topInset = 48 } = {}) {
  const s = { x: 0, y: 0 };
  let raf = 0, bounds;
  const render = () => { raf = 0; win.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`; };
  const measure = () => {                                         // layout read: only at drag start / key press
    const r = win.getBoundingClientRect(), bl = r.left - s.x, bt = r.top - s.y;   // window position at zero offset
    bounds = { minX: keep - r.width - bl, maxX: innerWidth - keep - bl, minY: topInset - bt, maxY: innerHeight - 60 - bt };
  };
  const clampPos = () => {
    s.x = Math.min(Math.max(s.x, bounds.minX), bounds.maxX);
    s.y = Math.min(Math.max(s.y, bounds.minY), bounds.maxY);
  };
  win.addEventListener('pointerdown', () => { win.style.zIndex = ++zTop; }, true);        // focus: raise on any press

  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button')) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    measure();
    const ox = e.clientX - s.x, oy = e.clientY - s.y;
    win.classList.add('dragging');
    const move = ev => { s.x = ev.clientX - ox; s.y = ev.clientY - oy; clampPos(); raf ||= requestAnimationFrame(render); };
    const up = ev => {
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up);
      win.classList.remove('dragging');
    };
    handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
  });

  handle.tabIndex = 0;                                            // keyboard alternative: arrows move the focused title bar
  handle.addEventListener('keydown', e => {
    const d = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[e.key];
    if (!d) return;
    e.preventDefault(); measure(); s.x += d[0]; s.y += d[1]; clampPos(); render();
  });
}
```
Window manager structure from the OS prototype: one state object per window (`px, py` for the user position, `ox, oy, s, o, b` for animation
offsets), a single `render(w)` that composes `translate3d(px+ox, py+oy) scale(s)` plus opacity and blur, writes batched in rAF.
Minimize animates the offsets toward the dock icon center and fades out; "tidy" tweens positions back to computed defaults.
Phones: no dragging. Windows become cards in normal flow; secondary windows open as full-width sheets, ONE at a time
(close the open sheet without animation before opening the next), with a scrim, a 44px close target, Esc and scrim-tap to dismiss.

## 24. Terminal command resolution (typeable, accessible, simulated)

```js
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();   // accent- and case-insensitive

const COMMANDS = [
  { names: ['help', 'ayuda', '?'], run: () => print(HELP_LINES) },
  { names: ['services', 'servicios'], run: () => openWindow('services') },
  { names: ['clear'], run: () => out.replaceChildren() },
  { names: ['sudo hire me'], run: () => print(['[sudo] password for visitor: ********', 'permission granted', 'opening contact...']) },   // one easter egg
];
const resolve = raw => COMMANDS.find(c => c.names.some(n => norm(n) === norm(raw))) ?? null;
const complete = raw => {                                         // Tab
  const q = norm(raw); if (!q) return raw;
  const hits = COMMANDS.flatMap(c => c.names).filter(n => norm(n).startsWith(q));
  return hits.length === 1 ? hits[0] : raw;
};

const history = []; let hi = 0;
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') { const raw = input.value; history.push(raw); hi = history.length; run(raw); input.value = ''; }
  else if (e.key === 'Tab') { e.preventDefault(); input.value = complete(input.value); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = history[hi] ?? ''; }
  else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(history.length, hi + 1); input.value = history[hi] ?? ''; }
});
document.addEventListener('keydown', e => {                       // "/" focuses the terminal when no field is active
  if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); input.focus({ preventScroll: true }); }
});

function run(raw) {
  line('prompt', raw);                                            // echo with textContent, never innerHTML
  const cmd = resolve(raw);
  if (cmd) cmd.run(); else print([`command not found: ${raw}`, 'Type help to see the available commands.']);
}
const wait = ms => new Promise(r => setTimeout(r, reducedMotion() ? 0 : ms));
async function demo(steps, result) {                              // scripted "agent" run
  for (const s of steps) { await wait(380); line('ok', `[ ok ] ${s}`); }
  line('result', result);
}
```
Markup: `<div role="log" aria-live="polite">` for output, a real `<input>` with an `aria-label`, and tappable suggestion chips for phones.
The banner states that everything is a simulation. Never evaluate typed text.

## 25. Simulated live monitor

```js
const agents = [{ name: 'agent-1', load: 0.4, target: 0.6, hist: Array(24).fill(0.3), until: 0 } /* ... */];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sparkPath = (h, W = 120, H = 28) => h.map((v, i) => `${i ? 'L' : 'M'}${((i / (h.length - 1)) * W).toFixed(1)},${(H - 2 - v * (H - 4)).toFixed(1)}`).join('');

function tick() {
  const now = performance.now();
  for (const a of agents) {
    if (now > a.until) { a.target = Math.random() < 0.7 ? 0.5 + Math.random() * 0.45 : 0.06 + Math.random() * 0.12; a.until = now + 1600 + Math.random() * 3600; }
    a.load = clamp(a.load + (a.target - a.load) * 0.38 + (Math.random() - 0.5) * 0.12, 0.03, 1);
    a.hist.push(a.load); a.hist.shift();
  }
  paint();                                                        // set bar width via transform: scaleX, sparkline via path d, append log lines
}
let timer;
const start = () => { clearInterval(timer); timer = setInterval(tick, reducedMotion() ? 2200 : 700); };
document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : start()));
start();
```
Label the panel "simulation". Seed the log with a few older entries so it is never empty on first paint.

## 26. Opt-in sound (default off)

Create the `AudioContext` only after the user turns sound on (autoplay policies, and respect). Tiny synthesized blips, no assets.

```js
export const sfx = (() => {
  let ctx, master, on = false;
  const ensure = () => {
    if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination); }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  };
  const tone = (f, dur, type = 'sine', vol = 0.06, f2 = f) => {
    if (!on || !ensure()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  };
  return {
    get on() { return on; }, set(v) { on = v; if (on) { ensure(); this.open(); } },
    open() { tone(240, 0.16, 'triangle', 0.07, 420); }, close() { tone(380, 0.14, 'triangle', 0.06, 190); },
    ok() { tone(980, 0.09, 'sine', 0.035); }, boot() { tone(110, 0.5, 'sine', 0.08, 220); },
  };
})();
```
The toggle is a real button with `aria-pressed`. Never play sound on load.

## 27. Product-UI patterns: drawer/sheet, period toggle, chart tooltip

### Drawer / bottom sheet (native `<dialog>`)

`showModal()` gives a focus trap, Esc to close, an inert page and a backdrop. The slide uses `@starting-style` and discrete transitions;
where unsupported the drawer just appears. For a phone bottom sheet, swap `translateX(100%)` for `translateY(100%)` and anchor to the bottom.

```html
<dialog class="drawer" aria-labelledby="drawer-title">
  <div class="drawer-body"><h2 id="drawer-title">Details</h2><button type="button" data-close>Close</button></div>
</dialog>
```

```css
.drawer {
  margin: 0 0 0 auto; padding: 0; border: 0; height: 100dvh; max-height: none; width: min(480px, 100vw);
  background: var(--surface); color: var(--text); overscroll-behavior: contain; transform: translateX(100%);
  transition: transform var(--dur-slow) var(--ease-out), overlay var(--dur-slow) allow-discrete, display var(--dur-slow) allow-discrete;
}
.drawer[open] { transform: none; }
@starting-style { .drawer[open] { transform: translateX(100%); } }
.drawer::backdrop { background: rgb(0 0 0 / .6); opacity: 0;
  transition: opacity var(--dur-slow), overlay var(--dur-slow) allow-discrete, display var(--dur-slow) allow-discrete; }
.drawer[open]::backdrop { opacity: 1; }
@starting-style { .drawer[open]::backdrop { opacity: 0; } }
.drawer-body { padding: 24px; }                                  /* padding lives here so backdrop clicks target the dialog itself */
```

```js
export function drawer(dialog, opener) {
  opener.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('click', e => { if (e.target === dialog || e.target.closest('[data-close]')) dialog.close(); });
  dialog.addEventListener('close', () => opener.focus());        // return focus
}
```

### KPI tiles with a period toggle that re-counts

The delta keeps its sign so color is never the only signal. URL reflects state; `setNumber` (section 5) retargets from the current value.

```js
import { setNumber } from './count-up.js';
const DATA = { 7: { leads: 48 }, 30: { leads: 191 }, 90: { leads: 562 } };   // structure only: replace with real data and label mock data in the UI
export function periodToggle(group) {
  const apply = p => {
    const d = DATA[p]; if (!d) return;
    group.querySelectorAll('[data-period]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.period === p)));
    for (const [k, v] of Object.entries(d)) { const el = document.querySelector(`[data-kpi="${k}"]`); if (el) setNumber(el, v, { duration: 600 }); }
  };
  group.addEventListener('click', e => {
    const b = e.target.closest('[data-period]'); if (!b) return;
    apply(b.dataset.period);
    const u = new URL(location.href); u.searchParams.set('period', b.dataset.period); history.replaceState(null, '', u);
  });
  apply(new URL(location.href).searchParams.get('period') ?? '7');
}
```

### Chart crosshair tooltip

One `pointermove` snaps a vertical line and tooltip to the nearest point. Provide a data table or `aria-describedby` summary for screen readers.

```js
export function chart(root, data /* [{ label, value }] */) {
  const svg = root.querySelector('svg'), line = svg.querySelector('.line');
  const hair = svg.querySelector('.xhair line'), dot = svg.querySelector('.xhair circle'), tip = root.querySelector('.tip');
  const W = 600, H = 220, pad = 8, fmt = new Intl.NumberFormat();
  const max = Math.max(...data.map(d => d.value)) * 1.1;
  const x = i => pad + (i / (data.length - 1)) * (W - pad * 2), y = v => H - pad - (v / max) * (H - pad * 2);
  line.setAttribute('d', data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' '));
  let rect;
  svg.addEventListener('pointerenter', () => { rect = svg.getBoundingClientRect(); root.dataset.hover = ''; });
  svg.addEventListener('pointerleave', () => { delete root.dataset.hover; });
  svg.addEventListener('pointermove', e => {
    if (!rect) return;
    const u = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.min(data.length - 1, Math.max(0, Math.round(((u - pad) / (W - pad * 2)) * (data.length - 1))));
    hair.setAttribute('x1', x(i)); hair.setAttribute('x2', x(i)); dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(data[i].value));
    tip.textContent = `${data[i].label}: ${fmt.format(data[i].value)}`;
    tip.style.transform = `translate(${Math.min((x(i) / W) * rect.width + 12, rect.width - tip.offsetWidth)}px, ${Math.max((y(data[i].value) / H) * rect.height - 36, 0)}px)`;
  });
}
```
Colors: one monochrome series plus the series that matters in the accent; never rainbow series.

## 28. Custom cursor (concept-only, fine pointers)

Use only when the cursor is part of the concept (editorial or 3D directions). The native cursor stays on touch, the focus ring is never
hidden, and nothing depends on the custom cursor to be usable.

```js
gsap.matchMedia().add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
  const cur = document.querySelector('.cursor'), dot = cur.querySelector('.cursor-dot');
  document.documentElement.classList.add('has-cursor');          // CSS hides the native cursor ONLY under this class
  gsap.set(cur, { xPercent: -50, yPercent: -50, x: -200, y: -200 });
  const qx = gsap.quickTo(cur, 'x', { duration: 0.3, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: 0.3, ease: 'power3' });
  const move = e => { qx(e.clientX); qy(e.clientY); };
  const over = e => {                                            // data-cursor="text|link|band" on hosts switches the shape
    const kind = e.target.closest?.('[data-cursor]')?.dataset.cursor ?? 'default';
    gsap.to(dot, { width: kind === 'link' ? 96 : kind === 'text' ? 118 : 14, height: kind === 'link' ? 96 : kind === 'text' ? 118 : 22, duration: 0.55, ease: 'expo.out', overwrite: 'auto' });
  };
  addEventListener('pointermove', move, { passive: true }); addEventListener('pointerover', over, { passive: true });
  return () => { removeEventListener('pointermove', move); removeEventListener('pointerover', over); document.documentElement.classList.remove('has-cursor'); };
});
```
When the page scrolls under a still pointer the hovered element changes without a pointer event: poll `document.elementFromPoint` every few
frames (via `gsap.ticker`) to keep the state honest.
