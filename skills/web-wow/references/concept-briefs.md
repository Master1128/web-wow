# Concept briefs (reusable templates)

Six directions. A, B and C are the originals this method was built on; D, E and F are alternates. Each brief is a
prompt for one sub-agent: fill the placeholders, paste the brief plus `DESIGN.md` plus the shared constraints block, and
launch it in its own folder (see `workflow.md`, step 3).

## Placeholders

| Placeholder | Fill with | Example (illustrative only) |
|---|---|---|
| `{BRAND}` | Brand or person name | `Acme Studio` |
| `{TAGLINE}` | One-line positioning, used in `<title>` and meta | `Interfaces that sell` |
| `{AUDIENCE}` | Who lands here and from where | `founders arriving from Instagram on phones` |
| `{PALETTE}` | Token list from `DESIGN.md` (bg, surface, line, text, muted, accent, on-accent) | `bg #0E0E10, accent #FF5A36` |
| `{FONTS}` | Display and mono families, self-hostable | `Geist + Geist Mono` |
| `{LOGO_SVG}` | Outlined SVG path data (`d` strings) and its viewBox; not live text | `viewBox="0 0 600 296" d="M232 639..."` |
| `{HEADLINE}` | The one headline, with the single accented word marked | `Your team, *working* while you sell.` |
| `{SERVICES}` | 3 to 5 services, each: name, one sentence, a one-word verb | `Capture / Operate / Control / Improve` |
| `{CTA}` | The single action and its target (mark `TODO` if not provided) | `Book a call -> TODO calendar link` |
| `{LANG}` | Page language(s) | `en` |

## Shared constraints block (paste into every brief)

```
SHARED CONSTRAINTS
- Single file: concepts/<folder>/index.html. Inline CSS/JS. Libraries from a CDN with EXACT pinned versions (prototype only).
- Tokens come from DESIGN.md as CSS variables. One accent. No gradients as decoration, no purple defaults, no 3-equal-cards row.
- Set <html lang>, <title>, meta description, theme-color, a data-URI favicon, and <meta name="robots" content="noindex, nofollow">.
- Preload fonts with display=swap. Never block first paint on a library: if it fails or takes > 9s, show the static version.
- prefers-reduced-motion: render the final composed state with no animation. No-JS: all content visible.
- Mobile is designed, not shrunk. Test at 390x844 and 360x780. document.documentElement.scrollWidth === innerWidth at every
  scroll step. Tap targets >= 44px. Env safe-area insets respected. Technical HUD/microcopy hidden on phones.
- Every scroll position on a phone must look intentional: no half-clipped, half-risen or overlapping states.
- Honesty: no invented logos, testimonials, numbers or dashboards. Anything simulated is labeled "simulation" in the UI.
  Contact/booking links that were not provided stay as <a href="#"> with a TODO comment.
- No scroll hijacking, no autoplay sound, preloader <= 1.2s and always skippable (direction B's boot sequence is the one documented exception), one marquee at most.
- Self-QA with headless Playwright before returning. Return: file path, 5-line summary, techniques used (by name),
  limitations, open TODOs, list of screenshots reviewed.
```

---

## A. Immersive 3D: "particles, pointer, fly-through"

Feeling: a machine room you can touch. Best for brands with a strong monogram or wordmark and a story about systems,
networks or automation. Cost: highest (WebGL, needs a vector logo, needs careful mobile budget).

```
BRIEF A: IMMERSIVE 3D for {BRAND} ({TAGLINE}). Audience: {AUDIENCE}. Language: {LANG}.
Palette: {PALETTE}. Fonts: {FONTS}. Logo outlines: {LOGO_SVG}. Headline: {HEADLINE}. CTA: {CTA}.
Services (shown as network nodes): {SERVICES}.

Concept: the logo is made of thousands of points sampled from its own SVG outlines. Pointer proximity repels them.
Scrolling flies the camera through the logo; the points disperse and reassemble into a node network whose nodes are
the services. One full-viewport fixed stage, a tall empty scroll space drives the scene.

Must build:
1. Preloader (<= 1.2s): typed one-line boot message in the mono font, then a clip-path reveal. Skippable. Never blocks the page.
2. Logo-to-points: draw the SVG path to an offscreen canvas with Path2D, read pixels, keep filled and edge pixels as two pools,
   sample N points (about 1/3 of desktop N on phones). Add small z-thickness. Use a seeded RNG so every load looks the same.
3. One THREE.Points draw call with a custom ShaderMaterial. Per-point attributes: logo position, network position, scatter
   position, 4 random values. Uniforms: assemble (intro), morph (scroll), pointer in NDC, pointer strength, time.
4. Pointer repel in the vertex shader (project, offset in NDC with aspect correction, push radially plus a small swirl).
   On touch devices use a slowly drifting virtual pointer so the effect still reads.
5. Scroll: ScrollTrigger on the scroll space produces target progress; ease it to a smoothed progress in the render loop.
   Progress drives camera dolly, morph (logo -> network) and network line draw. Overlay copy fades with blur via a scrubbed timeline.
6. Node network: lines, pulses travelling along edges, soft node glows; DOM labels positioned by projecting node positions each frame.
7. Headline: words split into masks, rise with blur, accent word in the accent color. Eyebrow typed in the mono font.
8. Magnetic CTA and an optional custom cursor (fine pointers only, native cursor otherwise).
9. Quality controls: cap pixel ratio (1.5 on phones, 2 otherwise), adaptive pixel ratio if fps EMA < 42 for > 2s, pause when hidden.
10. Fallback: reduced motion or no WebGL or scene timeout (9s) -> static outlined logo in the hero and the final caption visible.

Layout: fixed stage (canvas, vignette, grain), thin frame corners, top bar (monogram + one nav pill), side label (desktop only),
scroll rail (desktop only), bottom HUD with real metrics (hide on phones), end caption with the next step.
Portrait: recompute the camera distance and network layout for aspect < 0.95; regenerate buffers when orientation flips.

Acceptance: logo reads clearly at first frame after the intro; pointer repel is visible but subtle; at 0%, 25%, 50%, 75%, 100%
scroll the frame is composed (no empty void, no clipped labels); stays above ~40fps on a mid-range laptop; phone shows
the same story with fewer points.
Don't: add a second hero effect, use stock 3D models, block content behind the 3D, auto-play sound.
```

Technique recipes: `motion-patterns.md` sections "Logo to points", "Smoothed scroll progress", "Adaptive quality".

---

## B. OS experience: "boot, desktop, windows, terminal"

Feeling: you are inside the product. Best for developer tools, AI agents, automation, anything where "it runs" is the
selling point. Cost: high in JS and in mobile adaptation (the desktop metaphor must be redesigned for phones).

```
BRIEF B: OS EXPERIENCE for {BRAND} ({TAGLINE}). Audience: {AUDIENCE}. Language: {LANG}.
Palette: {PALETTE}. Fonts: {FONTS}. Logo: {LOGO_SVG}. Headline: {HEADLINE}. CTA: {CTA}. Services (each is a window/app): {SERVICES}.

Concept: the site boots like a small operating system and then behaves like one. The visitor can drag windows, type in a
terminal and open apps from a dock. Everything dynamic is a labeled simulation.

Must build:
1. Boot sequence (<= 2s, the one exception to the 1.2s preloader rule because it is the concept; skippable on any input, shown once per session via sessionStorage in try/catch, `?boot=1` forces it):
   grid fades in, the logo path draws itself, 4 short status lines with [ ok ], progress bar, then the desktop assembles.
2. Desktop (desktop breakpoint): top bar (logo, nav, live clock, status chip, language toggle, sound toggle), wallpaper in
   the brand style, three starter windows (welcome with headline and CTA, terminal, live monitor), a dock with magnification.
3. Window manager: Pointer Events drag from the title bar with pointer capture, focus-on-pointerdown with z-index stack,
   close, minimize to the dock (animate toward the dock icon), "tidy" to reset positions, clamp so a window can never leave the screen.
   State object per window; one render function composes transform from position + animation offsets; writes batched in rAF.
4. Terminal: typeable input (labelled for screen readers), suggestion chips that run commands on tap, Tab autocomplete, history with
   Up/Down, "/" focuses it, `help`, `ls`, `clear`, one command per service that opens its window, 2 to 3 scripted demos that
   print step lines with [ ok ] and a plain-language result, one easter egg. Command matching is accent- and case-insensitive.
   Unknown command prints a helpful hint. Banner states that everything is a simulation.
5. Live monitor: a table of agents/processes with load bars, sparklines (inline SVG paths), a scrolling event log, ticking every
   ~700ms, paused on `visibilitychange`, slowed under reduced motion. Header chip says "simulation".
6. Opt-in sound (default off): tiny WebAudio blips (key click, open, close, boot) created only after the user turns sound on.
7. Mobile (<= ~820px): NO draggable windows. The desktop becomes a vertical stack of cards in a normal page flow; the dock becomes
   a bottom app switcher with safe-area padding; secondary windows open as full-width sheets, ONE SHEET AT A TIME, with a scrim,
   44px close target and Esc/scrim to dismiss. Terminal height <= 74svh; keyboard must not hide the input.
8. Optional language toggle (es/en) with a single i18n dictionary and `lang` attribute updates.

Acceptance: first meaningful content within the boot budget; drag never loses a window off-screen; terminal works with keyboard
only; tapping a dock icon on a phone scrolls/open exactly one thing; reduced motion skips boot and shows the assembled desktop.
Don't: fake real integrations, show real-looking customer data, autoplay sound, trap focus in windows.
```

Technique recipes: `motion-patterns.md` sections "Draggable window", "Terminal command resolution", "Simulated live monitor",
"Opt-in sound", "Skippable boot sequence".

---

## C. Editorial giant: "type as architecture"

Feeling: a magazine cover that moves. Best for personal brands, studios and consultants with strong copy and no need for
3D or UI metaphors. Cost: medium. Highest ratio of impression to risk, and the most phone-friendly of the originals.

```
BRIEF C: EDITORIAL GIANT for {BRAND} ({TAGLINE}). Audience: {AUDIENCE}. Language: {LANG}.
Palette: {PALETTE} (needs a dark, an accent and a paper surface). Fonts: {FONTS} (display weight 700+ and a mono).
Logo/monogram: {LOGO_SVG}. Headline (split across 3 to 4 lines): {HEADLINE}. CTA: {CTA}. Services (one giant word each): {SERVICES}.

Concept: viewport-filling type, one accent wipe that swallows the page, a pinned horizontal services section, and a huge CTA.
Smooth scroll with Lenis synced to ScrollTrigger.

Must build:
1. Fitted type: every giant line is measured and scaled so it fills its container width exactly (re-fit on fonts ready,
   resize and ScrollTrigger refreshInit). On mobile, shrink the stacked lines together until the stack fits the viewport height.
2. Intro: a counter curtain (000 -> 100 with a thin bar) lifts, then the hero letters rise with a random stagger (SplitText chars),
   a block cursor `▌` or brand block steps in at the end. Lenis is stopped until the intro ends.
3. Act 1 (pinned): the cursor block expands into a full-bleed accent wipe. Implementation: clone the hero as an inverted layer (ink
   on accent) BEFORE splitting text, clip the layer to the block's rect, animate `clip-path` to `inset(0)` with scrub.
   Desktop: lines then fly out left/right and a statement rises. Mobile: finish the wipe first, then fade the statement in.
4. Act 2 (pinned horizontal services on desktop): each service is a giant word with a small index and caption that drifts against
   the word for depth, plus a progress bar and a counter. Mobile: no pin; each service reveals vertically on enter.
5. CTA: oversized headline, one magnetic button (fine pointers only), mailto/booking link marked TODO.
6. Nav: floating, its theme (dark/accent/paper) follows the surface under it via ScrollTrigger callbacks.
7. In-page navigation uses the accent curtain as a page transition.
8. Cursor (fine pointers only): a small block that morphs by context (text, link with label, ink on accent) and blends well;
   native cursor stays for touch. Idle state fades it.
9. Use `gsap.matchMedia()` for desktop vs mobile scenes with a reduced-motion branch that creates nothing.

Acceptance: at every scroll position on a phone, including mid-wipe, the frame looks intentional; no horizontal scroll;
fitted lines never clip; fonts are loaded before measuring; reduced motion shows the composed static page.
Don't: use more than one wipe, animate body copy, pin more than two sections, mix in a second reveal style.
```

Technique recipes: `motion-patterns.md` sections "Fitted type", "Element-to-fullscreen wipe", "Pinned horizontal section",
"Magnetic CTA", "Nav theme follows the surface".

---

## D. Liquid / shader gradient (alternate)

Feeling: a living color field behind calm, large type. Best for brands that are about taste, wellness, music or fashion
and have no product to show. Cost: medium (one fragment shader), risk: low contrast and battery use.

```
BRIEF D: LIQUID GRADIENT for {BRAND} ({TAGLINE}). Audience: {AUDIENCE}. Palette: {PALETTE}. Fonts: {FONTS}. Headline: {HEADLINE}. CTA: {CTA}.

Concept: a full-viewport fragment shader (domain-warped noise) in the brand palette sits behind the page. Pointer movement bends
the flow; scroll shifts the palette weights between sections. Type stays crisp on top.

Must build:
1. One fixed canvas with a single full-screen triangle and a fragment shader (fbm noise with two warps), 2 to 3 palette colors
   from tokens, grain overlay. Render at 0.5 to 0.75 device pixel ratio and upscale (it is blurry by nature).
2. Pointer: smoothed position as a uniform that bends the warp near the cursor; touch uses a slow virtual drift.
3. Scroll: ScrollTrigger sets a uniform that crossfades between palette sets per section. Never animate more than the uniform.
4. Contrast: headline sits on a scrim or the shader is clamped dark enough for 4.5:1. Test with screenshots at multiple times.
5. Sections: hero, one statement, services as a vertical list of large rows with hover blur-focus, CTA.
6. Fallback: reduced motion or no WebGL or hidden tab -> static CSS gradient built from the same tokens (a single frame of the shader, exported once).

Acceptance: text contrast holds at every scroll step; GPU time stays low (cap fps at 30 if needed); battery-friendly pause when off-screen.
Don't: use rainbow palettes, put small body text directly on moving color, add particles on top.
```

---

## E. Scroll-told case study (alternate)

Feeling: a documentary you scroll through. Best when there is one real story, result or process worth explaining step by step.
Cost: medium, but needs real content: do not build it with invented numbers.

```
BRIEF E: SCROLL-TOLD CASE STUDY for {BRAND} ({TAGLINE}). Audience: {AUDIENCE}. Palette: {PALETTE}. Fonts: {FONTS}. CTA: {CTA}.
Story beats (3 to 5, REAL or clearly labeled illustrative): {SERVICES}.

Concept: one pinned stage; as the visitor scrolls, a diagram or artifact transforms through the beats while the copy on the
side changes. The motion explains the work; remove it and meaning is lost.

Must build:
1. A pinned scene (desktop) with a left text column that swaps per beat and a right artifact (inline SVG or canvas) that transitions
   between states. Use ScrollTrigger with a single scrubbed timeline and labels per beat.
2. Beat markers: a thin progress rail with step numbers; the active step uses the accent.
3. Reduced motion and phones: a vertical sequence of beats, each with its own static figure and the same copy. No pin on phones.
4. Closing section: the result in plain language, then the CTA. Illustrative numbers carry a visible "illustrative" label.
5. Keyboard: Tab order follows the copy; the artifact has a text alternative that narrates all states.

Acceptance: each beat summarized in under 8 words; removing the animation breaks understanding (proof the motion is doing work).
Don't: invent metrics, use stock imagery, scrub more than one thing at once.
```

---

## F. Product as hero (alternate)

Feeling: calm confidence. The first viewport is a real, working artifact: a terminal, an app window, a live demo. Best when
there is something genuinely demonstrable. Cost: low to medium; quality depends on how real the artifact feels.

```
BRIEF F: PRODUCT AS HERO for {BRAND} ({TAGLINE}). Audience: {AUDIENCE}. Palette: {PALETTE}. Fonts: {FONTS}. Headline: {HEADLINE}. CTA: {CTA}. Services: {SERVICES}.

Concept: big headline with one accented word, and directly beneath it a framed interactive artifact that shows the offer working.
Hairline rules separate sections; section titles in the left column with copy on the right; one full-width accent band to break rhythm.

Must build:
1. Hero: 56 to 96px headline (tracking tightened), one accented word, subtext, then the artifact frame (terminal or app window).
2. Artifact: scripted sequence on load (typed request, step lines with status, a result that counts up), then 2 to 3 suggested
   inputs the visitor can click. Label it a simulation. Keep the final state in the DOM for no-JS and reduced motion.
3. Proof strip: only real artifacts (shipped features, public links). If none exist yet, show a build log instead of numbers.
4. Services as a two-column list (title left, text right) with hairlines, not cards.
5. One full-bleed accent band with a single concrete statement.
6. CTA as a real form or link with visible labels; mobile alternative (message link) always reachable by thumb.

Acceptance: someone can say what you sell from the first viewport alone; the artifact works with keyboard; LCP is the headline.
Don't: show a fake dashboard, fake client logos, or an artifact that cannot be explained.
```

---

## Mixing rules

- Choose one primary direction. Borrow at most one moment (for example, C's accent wipe into A's network section).
- A and D both use WebGL for the main visual; combining them doubles GPU cost and breaks the "one idea per viewport" rule.
- B and F share the "software artifact" idea; pick B for exploration depth, F for restraint.
- C pairs with almost anything because it is mostly type and ScrollTrigger.
