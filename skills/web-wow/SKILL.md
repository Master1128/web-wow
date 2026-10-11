---
name: web-wow
description: "Trigger: web de $10K, web que impresione, landing que impresione, sitio wow, portfolio site, wow website, Awwwards-level, premium landing page, immersive 3D site, editorial giant typography, OS-style website, impressive prototype. Method for building three or more art-directed website prototypes in parallel, picking one, and shipping it with mobile QA: DESIGN.md first, concept briefs, motion patterns, GSAP/Lenis/Three.js, Playwright checks, noindex preview link."
license: MIT
metadata:
  author: Rafael Chacón (@rafchn)
  version: "1.0"
---

## Activation Contract

Use when the user wants a website that feels expensive and memorable: a landing page, portfolio, personal-brand site or
campaign page where art direction and motion are part of the product. Typical asks: "web de $10K", "landing que
impresione", "wow website", "portfolio site", "Awwwards-level", "give me 3 options for my site".

Not for: dense product UI (dashboards, CRMs, admin tables), trust-first public-service sites that must stay quiet, native
mobile apps, or video. For those, use a restrained design skill and skip the heavy motion in this one.

Precedence when rules conflict: project `DESIGN.md` > the user's explicit request > this file > third-party skill defaults.

## What this skill is

A method, not a template. It was distilled from building three very different prototypes for the same brand
(see `examples/README.md` in the repo): an immersive 3D particle hero, an operating-system experience, and a giant
editorial-type site. The method: lock the brand in a `DESIGN.md`, brief several directions in parallel, let the user choose
or combine, build the winner, then loop on mobile QA before sharing a `noindex` preview link.

## Hard Rules

- One idea per viewport. One signature moment per section. If removing an animation loses no meaning, remove it.
- Color means something. One accent; success/warning/danger only as verdicts. The accent covers well under 5% of the surface.
- Animate `transform`, `opacity` and `filter`. `clip-path` is paint-only: use it for one big wipe, never for many elements. Count-ups and typed text rewrite text, the only other exception. Never `transition: all`.
- Every motion honors `prefers-reduced-motion` and has a static equivalent that carries the same content.
- Every pointer gesture (drag, hover-reveal, magnetic pull, custom cursor) has a tap/keyboard alternative. Custom cursors are
  allowed only when they are the concept, only for `(hover: hover) and (pointer: fine)`, and never hide the focus ring.
- No scroll hijacking: no wheel/keys interception, no forced snap. Smooth scroll (Lenis) only on marketing/brand pages.
- No `window.addEventListener('scroll')` for animation. Use GSAP ScrollTrigger, IntersectionObserver or `animation-timeline`.
- No layout reads inside pointer/scroll loops. Cache rects on `pointerenter`, batch writes in `requestAnimationFrame`.
- Heavy dependencies (Three.js, GSAP) load lazily or after first paint, with a static fallback if they fail or time out.
- Never invent claims: no fake logos, testimonials, statistics, dashboards or "trusted by". Simulated data is labeled
  "simulation" in the UI. Placeholders for contact links are marked `TODO` in code and called out in the report.
- Budget: LCP < 2.5s, CLS < 0.1, INP < 200ms on a mid-range phone. Self-host fonts for anything that ships.
- Preview links are `noindex` until the user explicitly says the site is final.

## Decision Gates

| Situation | Do |
|---|---|
| No `DESIGN.md` for the project | Create one from `references/design-md-template.md` before any pixel work |
| User gave no direction | Run `references/workflow.md` end to end: 3 directions in parallel, then choose |
| User already picked a direction | Skip to workflow step 4 (build) using the matching brief in `references/concept-briefs.md` |
| Existing site to improve | Audit first, keep IA and SEO, use a redesign/audit skill if installed; borrow only one signature moment |
| Audience is mostly on phones (social traffic) | Design mobile first; budget half the QA time for 390x844 and 360x780 |
| Brand has no logo SVG yet | Use the wordmark or a simple monogram; concept A (particles) needs outlined vector paths |
| Delegation tools unavailable | Build the directions one after another in separate folders; never mix their code |

## Execution Steps

1. **Intake.** Collect brand name, audience, one-sentence offer, palette, fonts, logo SVG (outlined paths), headline, services,
   the one CTA, language(s), and what is real vs simulated. Ask only for what is missing.
2. **DESIGN.md first.** Write or read it. Tokens as CSS variables come from it. See `references/design-md-template.md`.
3. **Three directions in parallel.** Fill three briefs from `references/concept-briefs.md`, one sub-agent per direction, each in
   its own folder (`concepts/<letter>-<slug>/index.html`), plus a small chooser page. Details: `references/workflow.md`.
4. **User picks or combines.** Record the decision: one primary direction, at most one borrowed moment from another.
5. **Build.** Production structure, bundled and pinned libraries, self-hosted fonts, real copy, accessibility, static fallbacks.
   Snippets: `references/motion-patterns.md`. Libraries and licenses: `references/libraries.md`.
6. **Mobile QA loop.** Follow `references/mobile-qa.md`: 390x844 and 360x780, sweep scroll in 0.25-viewport steps,
   `scrollWidth === innerWidth`, one sheet at a time, targets of at least 44px. Fix, re-shoot, repeat until clean. Read every PNG.
7. **Audit.** Run the principles checklist (`references/principles.md`), a UI guidelines audit if available, Lighthouse mobile,
   and a reduced-motion pass.
8. **Preview.** Deploy a `noindex` preview and hand over the link. Do not deploy or push anything the user did not ask for.

## Reference Index (load on demand)

| Need | File |
|---|---|
| End-to-end process, sub-agent prompts, handoff | `references/workflow.md` |
| Fill-in briefs for directions A to F | `references/concept-briefs.md` |
| DESIGN.md skeleton | `references/design-md-template.md` |
| Copy-paste motion and interaction code | `references/motion-patterns.md` |
| GSAP, Lenis, React Bits, Three.js: versions, licenses, sync | `references/libraries.md` |
| What makes a site feel expensive, anti-patterns, reference sites | `references/principles.md` |
| Mobile and reduced-motion QA, Playwright commands and script | `references/mobile-qa.md` |

## Optional companion skills (never vendored here)

Link and install commands are in the repo README. Read any third-party skill before installing it.
- Taste Skill (`design-taste-frontend`, `high-end-visual-design`, `redesign-existing-projects`): anti-template art direction.
- Vercel `web-design-guidelines`: UI audit. Upstream fetches its rules remotely at runtime, so review and pin it.
- Playwright CLI: screenshots, viewport and reduced-motion emulation, console capture.
- Thermos / deslop, anti-slop: optional diff review for AI-slop in code.
If a companion skill is not installed, follow `references/principles.md` and `references/mobile-qa.md` instead.

## Output Contract

Report, in this order: the one-line design read and the chosen direction; the signature moments built (by name); the viewports,
color schemes and scroll positions actually screenshotted; QA findings fixed and any consciously waived; fallbacks in effect
(no WebGL, reduced motion, no JS); every placeholder still open (contact links, copy, assets); the preview URL if one was
deployed. Do not claim an effect works until it was seen in a screenshot or measured in a browser. Headless Playwright is the
source of truth: `requestAnimationFrame` may not run in hidden preview panes.
