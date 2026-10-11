# Principles: what makes a site feel expensive

"$10K" here is a market signal, not a price: how much art direction, motion craft, QA and copy a visitor can feel.
Each principle has a quick test, so the list doubles as a pre-publish checklist.

Facts versus opinion: the reference table at the end comes from a one-day review (2026-10-11) of live sites at 1440x900.
Sites change, and measurements (headline size, canvas count) describe that day only. Anything marked "opinion" is a judgment call.

## Twelve principles, each with a test

1. **One idea per viewport.** Test: screenshot any section at 1440x900; you can summarize it in under 8 words, with one headline
   and one dominant visual element.
2. **A real display size.** Hero headlines in the references ran from about 54px (monospace) to 123px; most sit at 64 to 96px.
   Test: the hero headline occupies at least a third of the viewport height, with negative tracking.
3. **Proof in the first viewport.** A real artifact, a verifiable number, a working demo, a logo wall of real clients.
   Test: something checkable appears in the first 900px. If it does not exist yet, show an honest artifact, never an invented number.
4. **The hero is the product, not stock imagery.** A terminal, a UI, a live grid. Test: someone can say what you sell from the hero alone.
5. **Motion serves the story.** Test by deletion: remove the animation; if meaning is lost it stays, if nothing is lost it goes.
6. **Contained palette, color with meaning.** Test: the accent covers under 5% of the surface and always marks the important thing
   (state, action, the one highlighted word).
7. **Two typographic voices.** A display voice for statements and a mono (or serif) voice for labels, status and data. Test: every label
   and metadata item uses the same second voice in the same style.
8. **Precision details at a uniform scale.** Registration marks, ruler ticks, vertical side labels, dot grids, hairlines. Test: details sit
   at corners, edges and headings consistently, never randomly.
9. **Every interactive element has states.** Hover, visible focus, active and a keyboard equivalent. Test: Tab through the whole page and
   see every focus ring designed.
10. **Copy with a point of view and specificity.** Short declarative lines, one concrete case, dry humor if it fits. Test: no sentence could be
    pasted into a competitor's site.
11. **Performance and stability.** LCP < 2.5s, CLS < 0.1, heavy 3D and libraries loaded lazily, a static alternative for no-WebGL and reduced
    motion. Test: Lighthouse on mobile plus a pass with `prefers-reduced-motion`.
12. **Mobile designed, not shrunk.** Test: at 390px the hero has its own composition (not the desktop one scaled down), the CTA is reachable
    by thumb, there is no horizontal scroll, and every scroll position looks intentional. (Opinion: for many brands most traffic is a phone
    arriving from a social link; confirm with analytics when it exists.)

Finishing touches that add up even though they are not principles: favicon and OG image in the brand, a 404 in the concept's voice, selection
color, a loading state, `meta theme-color`, `lang`.

## Lessons learned from building three prototypes

- Giant type must be measured, not guessed: fit each line to its container after the font loads and on every refresh.
- Anything pinned or scrubbed needs a phone version designed on purpose. On phones, finish a transition and then reveal content over the finished
  state; never leave content half-clipped at an arbitrary scroll position.
- A desktop metaphor (windows, dock, HUD) must be rebuilt for phones: stacked cards, one sheet at a time, a bottom switcher with safe-area padding,
  technical microcopy hidden.
- Everything dynamic is either real or labeled a simulation. A fake dashboard destroys trust faster than a plain page.
- The strongest moments combine one signature effect with restraint everywhere else. More effects do not read as more expensive.
- Fallbacks are part of the design: no-WebGL, reduced motion, library failure, slow network. Test them, do not assume them.
- Headless Playwright is the source of truth for motion. Hidden preview panes can stop `requestAnimationFrame`, which makes animated pages look broken or blank.

## Anti-patterns that say "template" or "made by AI"

- Purple-to-blue gradient backgrounds, glows, stacked glassmorphism.
- A row of three identical cards with an icon in a colored square, or a six-feature grid.
- Generic copy ("revolutionize your workflow", "smart solutions", "AI-powered") that does not say what you do.
- Stock images of robots, brains, handshakes; particle backgrounds with no meaning.
- Fake logos ("trusted by"), fake testimonials, fake statistics, fake dashboard screenshots.
- Everything centered, the same radius and shadow everywhere, a single typeface with no hierarchy, gradient text.
- Several different scroll or cursor effects on one page; scroll hijacking that breaks native scroll.
- A long preloader, autoplay sound, a cookie banner covering the hero, a "book a call" button repeated six times.
- Em dashes in visible copy (a house tell for generated text).

## Reference sites (observed 2026-10-11)

Use them as vocabulary, not as templates: steal a principle, never a layout.

| Site | Why it feels expensive (observed) | Take | Avoid |
|---|---|---|---|
| https://oryzo.ai | A tiny product treated with luxury art direction; headline where the object sits between letters; a blueprint-style overlay explains how the object is built | Construction/blueprint overlay, object between headline layers, dry humor | Page weight: very long scroll story with many canvases |
| https://lusion.co | Hero framed in a rounded container with a 3D render; short confident line; "+" registration marks | Registration marks, framed hero | A render pipeline you do not have |
| https://linear.app | Calm: near-black, 64px headline, then the real product in a frame; hairlines; two-column section headers | Product as hero, hairlines | Copying the SaaS look without a UI to show |
| https://vercel.com | Large headline, soft glow, client logos inside the first viewport | Proof in the first viewport, Geist | Logos you do not have |
| https://www.raycast.com | One enormous visual artifact with grain, centered headline; mono microcopy near the CTA | Single-tone grain, mono microcopy | Imitating the signature ribbons |
| https://resend.com | 96px serif headline on black, italic emphasis, dark-on-dark 3D cube | Serif/sans contrast for one phrase | Low-contrast hero where the object barely reads |
| https://www.anthropic.com | Warm paper, grotesque headline with underlined key words, serif text, zero effects | Underline as emphasis, warmth | Copying and losing your own identity |
| https://ghostty.org | The hero is a terminal window with animated ASCII art | Hero = terminal, very light | Too austere to explain an offer |
| https://charm.land | Personality in a terminal tool: bubbly 3D, sparkle, a headline with a stance | A terminal can have personality | Saturated gradient backgrounds that break a one-accent rule |
| https://www.warp.dev | Monospace display headline on a dot grid; a labeled figure with a grid of agent tasks; vertical side labels; status eyebrows; one full-width color band | Visualize work as a grid of cells, status eyebrows, a color band to break rhythm | Enterprise jargon; unclear whether the counters are live |
| https://basement.studio | Full-screen 3D room hero, a human/machine toggle, dark, one orange accent, Geist | Dark + one accent, a world as the stage, superscript counters | A whole 3D room is out of proportion for a one-person site |
| https://twks.ch/en | Full-bleed saturated photo, giant condensed type, navigation placed mid-screen | Bold nav placement, one saturated color per screen | People photography you do not have |
| https://lpas.com | Architecture studio: full-bleed photo with a dark veil, hairline logo, almost no elements | Total restraint can win in conservative sectors | Needs real photography |
| https://rauno.me | Tiny consistent interface details: ruler ticks, crosshair cursor | Precision details | A custom cursor outside a concept that earns it |
| https://cursor.com | Warm paper background, modest headline, product window over a painted landscape | Product over warm artful texture | A cookie banner covering the first viewport |

Not captured but referenced in the source review: https://forged.build (explorable 3D garage with WebGPU, described by a third party); treat the description as unverified.

## Showcase vocabulary (opinion)

From a short reel of "animations to make expensive sites": one visual idea per screen, enormous type, a single object with real material and light,
and transitions with intent (distortion, motion blur, camera moves). None used cards, line icons or generic gradients. These are showcase sites; they say
nothing about copy, offers, forms, performance or phones, so use them for motion vocabulary only.
