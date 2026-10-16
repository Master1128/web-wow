# Libraries: GSAP, Lenis, React Bits, Three.js

Versions as of 2026-10-11 (re-check with `npm view <pkg> version` before pinning). All four are per-project dependencies:
never global, never added "just in case". Prefer the vanilla patterns in `motion-patterns.md` first.
Licenses below are a plain-language reading, not legal advice: re-read the license text for anything you sell or redistribute.

| Library | Version | License | Source |
|---|---|---|---|
| GSAP | 3.15.0 (npm) | GreenSock "Standard no charge" license (not OSI open source) | https://github.com/greensock/GSAP, https://gsap.com/standard-license |
| Lenis | 1.3.26 (npm) | MIT | https://github.com/darkroomengineering/lenis |
| React Bits | no version (copy-paste / shadcn registry; repo `main`) | MIT + Commons Clause (custom wording) | https://github.com/DavidHDev/react-bits, https://reactbits.dev |
| Three.js | 0.186.1 (npm; release number is the `r` revision, so r186) | MIT | https://github.com/mrdoob/three.js |

Package names: `gsap`, `@gsap/react` (React hook), `lenis` (NOT the deprecated `@studio-freight/lenis`, renamed), `three`.
The original prototypes pinned GSAP 3.12.5 and three 0.160.0 from a CDN; new work should use the versions above.

## Typosquat warning: `react-bits`

React Bits has NO npm package. The npm package named `react-bits` is an unrelated 2017 library. Never run `npm i react-bits`
(and treat any "react bits" package that is not installed through the shadcn registry command below as suspect).
Also never install `@studio-freight/lenis` for new work. Check the package name, publisher and download history before every install.

## When to use / when NOT to

| Need | Use | Do NOT |
|---|---|---|
| Timelines, scrubbed/pinned scroll scenes, SplitText, Flip, sequencing | GSAP | Use GSAP for a simple fade-in or hover (vanilla patterns are smaller). |
| Smooth inertial page scroll on a marketing/brand site | Lenis (optional) | Use on dashboards or apps with internal scroll panels (tables, drawers, modals), or on trust-first public-service sites. |
| Ready-made animated React components (text effects, backgrounds) | React Bits, React projects only | Use on static/vanilla sites (rewrite the effect from `motion-patterns.md`). One "hero wow" max. |
| Smooth scroll AND GSAP | Lenis + ScrollTrigger sync (below) | Use GSAP `ScrollSmoother` together with Lenis: both smooth the same scroll. Pick Lenis (native scroll keeps `position: sticky`, anchors and keyboard working). |
| 3D, particles, shaders | Three.js loaded lazily | Put it in the initial bundle, run it off-screen, or ship it without a static fallback. |
| Mixing animation engines | One engine per project tree | Mix GSAP and Motion in one component tree. Check each React Bits component's `dependencies` first. |

`lenis.on('scroll', ...)` is a Lenis event, not `window.addEventListener('scroll')`, so it does not break the no-scroll-listener rule.

## Installation

```bash
# GSAP (ScrollTrigger, SplitText, Flip, ScrollSmoother, Observer... are all in the same package)
npm i gsap            # + `npm i @gsap/react` only for React (useGSAP hook, automatic cleanup)

# Lenis (React adapter is `lenis/react`, scroll snap is `lenis/snap`, same package)
npm i lenis           # CSS: import 'lenis/dist/lenis.css'

# Three.js
npm i three           # load with dynamic import('three') after first paint

# React Bits: official README method (shadcn registry). Needs a React project with components.json.
npx shadcn@latest init                                 # once per project
npx shadcn@latest add @react-bits/SplitText-TS-TW      # <Component>-<JS|TS>-<CSS|TW>
```

React Bits variants: `JS-CSS`, `JS-TW`, `TS-CSS`, `TS-TW` (language x styling). Use `TS-CSS` for projects without Tailwind and `TS-TW`
only when Tailwind is already there. Before installing a component, read what it will write and pull in (no execution):
`curl -s https://reactbits.dev/r/SplitText-TS-TW.json` and check `dependencies` and the file content. Review the diff the CLI makes
to `package.json`. The CLI writes remote JSON content into your source and installs npm dependencies: treat it like pasting
third-party code. Manual alternative: component page, Code tab, copy files, install the listed dependencies.

Heavy dependencies some React Bits components pull in: `three`, `ogl`, `matter-js`, `face-api.js`, `@react-three/*`, `postprocessing`.
Each adds bundle weight: lazy-load them.

CDN for prototypes only: pin an EXACT version in the URL (never `@latest` or a range), for example
`https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js`. For anything that ships, bundle from npm (or add SRI hashes if a CDN is unavoidable).

## Licensing in plain words

- **GSAP: usable for client work.** Free, including the former paid plugins (SplitText, ScrollSmoother, MorphSVG, Flip...), commercial
  use covered by the standard license. Restrictions: do not remove or alter GSAP's notices; do not reverse engineer it to build a
  competing product; do not use it inside a tool that competes with Webflow's visual animation builder (a no-code tool that lets end users build
  animations visually). It is not OSI open source (it is a custom license), so do not republish GSAP itself. Selling templates or
  themes that bundle GSAP is not explicitly addressed: check with GreenSock/Webflow before doing that. Read https://gsap.com/standard-license before client delivery.
- **Lenis: no strings.** MIT. Keep the license notice if you redistribute the library itself (the npm package carries it).
- **React Bits: usable inside a website or product, NOT for reselling the components.** The repo license is "MIT + Commons Clause" with custom
  wording: you may use, copy and modify components as part of an application, website or product, including commercially, as long as you do
  not sell, sublicense or redistribute the components themselves, alone, in a bundle or as a port. Delivering a client site whose source
  contains React Bits components is fine. Not fine: publishing or selling a component pack, UI kit, npm package, template whose main value is
  the components, or a port (Vue, Svelte, vanilla) of them. Keep the copyright notice with copied code (add a `THIRD_PARTY_LICENSES.md` entry).
  GitHub may show the license as "Other": that is expected. React Bits Pro is a separate paid product with its own terms.
- **Three.js: no strings.** MIT. Keep the notice if you redistribute the library.
- This skill itself is MIT and contains no third-party code or assets.

## Integration snippets

### (a) GSAP + ScrollTrigger with `gsap.matchMedia()` and a reduced-motion guard

See `motion-patterns.md` section 14. Rules: branch on `conditions.*` inside the handler (it re-runs whenever any condition flips) and include a `reduce` condition so the callback also runs for phone plus reduced motion;
animate only `transform`/`opacity`/`filter`/`clip-path`; do not `scrub` on phones unless tested; call `ScrollTrigger.refresh()` after late layout
changes (web fonts, lazy images). React: `useGSAP(() => {...}, { scope: ref })` from `@gsap/react`, with `matchMedia` inside it.

### (b) Lenis + ScrollTrigger sync (vanilla), reduced-motion opt-out and cleanup

Official sync: `lenis.on('scroll', ScrollTrigger.update)`, the GSAP ticker drives `raf`, `lagSmoothing(0)`. `autoRaf` stays `false`
because the GSAP ticker owns the loop; use `autoRaf: true` only when GSAP is not involved.

```js
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';                          // required CSS (also `.lenis`, `[data-lenis-prevent]` rules)
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  const lenis = new Lenis({ anchors: true });           // #links keep working with smoothing
  const tick = time => lenis.raf(time * 1000);          // GSAP time is seconds, Lenis wants ms
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);                          // no catch-up jumps while scrolling
  return () => {                                        // runs when the query stops matching / on revert
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);                  // restore GSAP defaults
    lenis.destroy();
  };
});
```

Lenis facts:
- Scrolls the real document, so keyboard (Space, PageUp/Down, Home/End, arrows), `position: sticky` and browser find keep working. It does
  intercept wheel events on desktop to smooth them: that is the accepted exception to the no-hijack rule. Do not hijack keys, do not add your own
  wheel or `preventDefault` handlers, no `scroll-behavior: smooth` in CSS alongside Lenis.
- `respectReducedMotion` defaults to `true` (smoothing off, programmatic scrolls instant). Do not set it to `false`. The wrapper above goes
  further: no Lenis instance at all under reduced motion.
- Intro screens: call `lenis.stop()` until the intro finishes, then `lenis.start()` and `ScrollTrigger.refresh()`.
- Nested scroll areas (modals, menus, code blocks): `data-lenis-prevent` on the element, or `allowNestedScroll: true` (perf cost). If many
  places need this, Lenis does not belong on that page.
- Known limits: capped at 60fps on Safari; smoothing stops over iframes; no CSS scroll-snap (use `lenis/snap`);
  leave `syncTouch` at `false` (touch stays native).
- Anchor links are blocked while scrolling unless `anchors: true`. After SPA navigation: `lenis.scrollTo(0, { immediate: true })`.

React / Next (`'use client'`), same sync through the adapter:

```jsx
'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { useEffect, useRef } from 'react';
gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  useLenis(ScrollTrigger.update);
  useEffect(() => {
    const tick = time => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); gsap.ticker.lagSmoothing(500, 33); };
  }, []);
  return <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>{children}</ReactLenis>;
}
```
Mount once in the layout, never per page. Reduced motion relies on Lenis' built-in `respectReducedMotion` here.

### (c) SplitText reveal (GSAP 3.13+ API)

SplitText ships in the `gsap` package. `autoSplit` re-splits after fonts load and on resize, and `onSplit` must return the tween so GSAP
carries progress over to the new split. Default `aria: "auto"` adds an `aria-label` and hides fragments from screen readers; it does not
preserve nested links (use `aria: "none"` plus an `.sr-only` copy then).

```css
@media (prefers-reduced-motion: no-preference) {
  .js [data-split] { visibility: hidden; }   /* avoids a flash of unsplit text; JS reveals it. The 3s failsafe from motion-patterns.md section 0 removes `.js` if init never sets data-ready */
}
```

```js
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(SplitText, ScrollTrigger);

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  document.documentElement.setAttribute('data-ready', '');   // tells the head failsafe that init ran
  document.querySelectorAll('[data-split]').forEach(el => {
    gsap.set(el, { visibility: 'visible' });
    SplitText.create(el, {
      type: 'lines, words', mask: 'lines', autoSplit: true,
      onSplit: self => gsap.from(self.words, {
        yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },   // hero: omit scrollTrigger to play on load
      }),
    });
  });
});
```
One reveal style per page, headlines only (never body copy). Neutral alternative without GSAP: `motion-patterns.md` section 10.
For fitted giant type split by characters: `SplitText.create(parts, { type: 'chars', charsClass: 'ch', aria: 'none' })`, then fit AFTER the font loads.

### (d) React Bits: install one component and restyle it to DESIGN.md

```bash
npx shadcn@latest add @react-bits/SplitText-TS-TW     # writes the component into your components dir, adds gsap + @gsap/react
```

```tsx
import SplitText from '@/components/SplitText';       // path follows components.json aliases; check where shadcn wrote it
export function Hero() {
  return <SplitText text="Your headline here." tag="h1" splitType="words" delay={40} textAlign="left" className="font-display text-5xl text-[var(--text)]" />;
}
```

Restyle rules (the component is yours once copied; edit the file, do not wrap it in overrides):
1. Tokens only: colors, fonts and radii come from the project's `DESIGN.md` CSS variables. WebGL props need resolved values, not `var()`:
   `const token = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()`.
2. One accent. Component defaults are often purple/green: delete them.
3. Fonts: pass `className`, use the project's self-hosted font; no new `<link>` to a font CDN.
4. Add what the components lack: the sampled ones (`SplitText`, `BlurText`, `Aurora`) did not check `prefers-reduced-motion`. Render the plain element
   (static text, flat background) when `matchMedia('(prefers-reduced-motion: reduce)').matches`.
5. Copy only the components you use, strip demo props, keep the copyright notice.
6. Engine consistency: if the project animates with GSAP, choose `gsap`/`ogl` components; skip `motion`-based ones.

### (e) Three.js, loaded lazily

```js
// Entry point: do not import 'three' at the top of the bundle.
export async function mountScene(canvas, { isPhone }) {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isPhone ? 1.5 : 2));   // cap it: pixel ratio is the biggest GPU lever
  // ...build the scene (see motion-patterns.md section 15)...
  return { THREE, renderer, dispose() { renderer.dispose(); /* geometry.dispose(), material.dispose(), texture.dispose() */ } };
}
```
- Prototype/CDN use: an import map such as `{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js" } }`, pinned exactly.
- One draw call for thousands of points (`THREE.Points` plus a `ShaderMaterial`); GPU instancing for repeated meshes.
- Pause the loop off-screen (IntersectionObserver) and when the tab is hidden; reduce point count on phones to about a third.
- Always ship the fallback: reduced motion, no WebGL, or a load timeout shows a static image/SVG with the same message.
- Fonts used in canvas textures must be loaded first: `await document.fonts.load('700 40px "YourFont"')` with a short timeout.
- Headless browsers may need a software GL flag; see `mobile-qa.md`.

### (f) Astro / Vite note

- **Static site (Astro, Vite vanilla, plain HTML):** `npm i gsap lenis`, bundle them (do not hot-link CDN script tags on a shipped site). In Astro put
  the code in a `<script>` in the layout and import `lenis/dist/lenis.css`. With Astro view transitions (`<ClientRouter />`) re-run init on
  `astro:page-load` and call `mm.revert()` / `lenis.destroy()` before the swap, or listeners stack.
- **React / Next / Vite+React:** `@gsap/react` `useGSAP`, `ReactLenis` in the root layout, React Bits via shadcn. Heavy components load with
  `next/dynamic(..., { ssr: false })` or `React.lazy` behind an IntersectionObserver. Also follow `vercel-react-best-practices` if installed.

## Performance and accessibility rules

- Lazy-load heavy components (`three`, `ogl`, `matter-js`): never in the initial bundle, never above the fold unless it IS the single hero effect.
- One hero "wow" per page (one WebGL background OR one SplitText headline OR one pinned scene), plus the marquee cap.
- Phones: no WebGL or pinned scrubbed scenes below about 900px or on `(pointer: coarse)` unless tested on a real device; otherwise show a static image or gradient,
  or a reduced version (fewer points, no pin).
- No scroll-jacking: no hijacked wheel/keys, no forced snap, no scroll locks, no custom scrollbars. Lenis only smooths the wheel; touch and keyboard stay native.
- Reduced motion everywhere; every effect has a static equivalent carrying the same content.
- Budget: LCP < 2.5s, CLS < 0.1, INP < 200ms. SplitText and pin spacers can shift layout: reserve space, split after fonts, run a performance audit after adding them.
- Verify with Playwright at 390x844 and 1440x900, then reduced motion (`mobile-qa.md`). Check: no console errors, nothing animates under reduced motion,
  no horizontal scroll, keyboard `End`/`Space`/`Tab` still scroll and focus correctly, anchor links land, modals/drawers scroll natively, ScrollTrigger positions
  stay correct after a resize.

## Security notes (checked 2026-10-11, re-check when versions change)

- No `preinstall`/`install`/`postinstall` scripts were found in `gsap@3.15.0` or `lenis@1.3.26`; the published files contained no `fetch`, `XMLHttpRequest`,
  `sendBeacon`, `WebSocket` or `eval`. Neither npm tarball had provenance attestations, so verify the package name and version when installing.
- React Bits: the repo `package.json` is the docs site (private), not what you install. The registry items sampled (`SplitText`, `BlurText`, `Aurora`) had no network
  calls, storage, cookies or eval, but only 3 of hundreds were read: review each component's JSON before `add`.
- Pin exact versions, commit the lockfile, review dependency diffs, and read any third-party skill before installing it into your agent.
