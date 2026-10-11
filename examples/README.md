# Examples: three prototypes built with this method

Live demo (chooser page with all three): https://rafchn-propuestas.vercel.app

The prototypes were built for one brand (the author's personal brand: warm near-black background, coral accent, Geist, terminal motif;
credit: Rafael Chacón, @rafchn). They are shown only as examples of what the method produces. Their source is intentionally not
copied into this repository: the briefs in `skills/web-wow/references/concept-briefs.md` and the techniques in
`references/motion-patterns.md` are the reusable part. Copy in the demo is in Spanish, booking/contact buttons are not wired
(placeholders), dynamic panels are simulations labeled as such, and the pages are `noindex`.

Open them on a desktop and move the pointer and scroll, then open them again at phone width: a large part of the work is in the phone versions.

| Option | Path on the demo | Direction (brief) |
|---|---|---|
| A: machine room | `/a-3d/` | Immersive 3D (brief A) |
| B: operating system | `/b-os/?boot=1` | OS experience (brief B) |
| C: editorial giant | `/c-editorial/` | Editorial giant (brief C) |

## A. Immersive 3D (brief A)

- A monogram and network built from about 28,000 points on desktop (about a third on phones), sampled from the logo's own SVG outlines
  by drawing the path to a canvas and reading pixels (`motion-patterns.md` section 15).
- Pointer repel computed in the vertex shader, so thousands of points react at one draw call.
- Scrolling flies the camera through the cursor block while the points disperse and reassemble into a node network whose nodes are the
  services; lines draw in and pulses travel along the edges; DOM labels follow projected node positions.
- Typed-text preloader under 1.2s, headline words rising out of masks with blur, magnetic CTA, optional custom cursor on fine pointers.
- Quality controls: pixel-ratio cap, adaptive resolution when the frame rate drops, a drifting virtual pointer on touch devices.
- Fallback: reduced motion, no WebGL, or a 9s scene timeout shows a static outlined logo and the final caption.
- Stack in the demo: three.js r160 and GSAP 3.12.5 with ScrollTrigger, pinned from a CDN (prototype only; current versions are in `libraries.md`).

## B. OS experience (brief B)

- A short boot sequence (logo path drawing itself, status lines, progress bar) that any input fast-forwards; shown once per session.
- A desktop with draggable windows (Pointer Events with capture), a magnification dock, a typeable terminal that opens windows
  and runs scripted demos, and a live monitor of simulated agents with sparklines and an event log.
- Opt-in synthesized sound (off by default), a Spanish/English toggle with one dictionary.
- Phones get a different design on purpose: stacked cards, a bottom app switcher with safe-area padding, one sheet at a time,
  44px close targets. The technical HUD is hidden.
- Stack in the demo: GSAP 3.12.5 from a CDN (prototype only), vanilla JS for everything else.

## C. Editorial giant (brief C)

- Every giant line is measured and scaled to fill its container after the font loads (`motion-patterns.md` section 17).
- A counter curtain intro, SplitText characters rising with a random stagger, and a block cursor that steps in at the end.
- A pinned act where the block expands into a full-bleed accent wipe (the hero cloned as an inverted layer, clipped to the block, then scrubbed
  to full), followed by a statement; on phones the wipe finishes first and the statement fades in over it.
- Pinned horizontal services on desktop with captions drifting against the words; vertical reveals on phones.
- A magnetic CTA, a context-aware cursor block on fine pointers, a floating nav whose theme follows the surface under it,
  Lenis smooth scroll synced with ScrollTrigger.
- Stack in the demo: GSAP 3.15.0 with ScrollTrigger and SplitText, plus Lenis 1.3.26, pinned from a CDN (prototype only).

## What the three have in common (the method)

1. All three read the same `DESIGN.md` tokens, so the comparison is about concept, not about colors.
2. Each was built as a single file in its own folder from its own brief, then compared by the author on desktop and on a phone.
3. The mobile QA lessons in `skills/web-wow/references/mobile-qa.md` (390x844 and 360x780, scroll sweep, overflow check, one sheet at a time) come from fixing these prototypes.
4. Each has a static fallback and a reduced-motion state.

## Reproducing this for your own brand

1. Install the skill (see the repository README).
2. Ask your agent for a "wow website" and give it your brand, one-sentence offer, palette, fonts and logo SVG.
3. The agent writes `DESIGN.md`, fills three briefs, builds three prototypes, and asks you to choose.
