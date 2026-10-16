# Mobile and reduced-motion QA

Mobile is where "prototype that wows on a laptop" turns into "site that wows". Budget real time for this loop.
Sources of truth: headless Playwright screenshots and DOM measurements. Do not rely on a hidden or background preview pane:
`requestAnimationFrame` may not run there, so animated or WebGL pages can look blank or frozen while being fine in a real browser.

## Prerequisites

Playwright needs a browser. If `npx playwright install chromium` was never run, use the installed Chrome: `PW_CHANNEL=chrome` for the sweep script and
`chromium.launch({ channel: 'chrome' })` in your own scripts. Check this first; do not discover it halfway through the loop.

## The loop

```
serve -> sweep screenshots (2 phones) -> READ every PNG -> fix -> re-sweep -> reduced-motion pass -> no-JS / no-WebGL pass -> done
```

Read each image with whatever your agent offers for viewing images. A script cannot tell you a headline is half-clipped.
If your agent cannot view images, keep the measurements (overflow, tap targets, console errors, contrast), state in the report that the screenshots were
NOT reviewed, and ask the user to open the preview on a phone.

## Viewports

| Name | Size | Why |
|---|---|---|
| iPhone-class | 390x844 | Most common modern phone size |
| Small Android | 360x780 | Catches overflow and fitted-type bugs that 390 hides |
| Desktop | 1440x900 | The reference composition |
| Tablet (if the layout changes at ~820 to 900px) | 768x1024 | Breakpoint edge cases |

Also check the breakpoint boundaries themselves (for example 899 and 900 px) when the layout switches there.

## Checklist

Layout and overflow
- [ ] `document.documentElement.scrollWidth === window.innerWidth` at every scroll step (no horizontal scroll, no hidden overflow that shows on swipe).
- [ ] Fitted giant type never clips; stacked lines fit the viewport height on phones.
- [ ] Safe areas respected: `env(safe-area-inset-top/bottom)` on fixed bars and docks; dock padding `max(10px, env(safe-area-inset-bottom))`.
- [ ] Use `svh` / `dvh` for full-height sections so the browser chrome does not cover content.

Scroll sweep
- [ ] Sweep scroll in 0.25-viewport steps from top to bottom and read every screenshot.
- [ ] Every position looks intentional: nothing half-clipped, half-risen, overlapping or empty-void. If a transition cannot look right at an arbitrary
      scroll position on a phone, simplify it (finish the transition first, then reveal content over the finished state).
- [ ] Pinned and scrubbed scenes either have a designed phone version or are replaced by vertical reveals below the breakpoint.
- [ ] After a resize or orientation change, ScrollTrigger positions are still correct (`ScrollTrigger.refresh()`).

Interaction
- [ ] Tap targets at least 44x44 CSS px (including icon buttons, close buttons on sheets, nav CTAs).
- [ ] One sheet/modal at a time on phones; scrim tap and Esc close it; opening a second closes the first without a stacking mess.
- [ ] No drag-only interactions on touch: windows become cards, sliders have buttons.
- [ ] Keyboard path for every gesture; visible focus ring; the on-screen keyboard does not hide a focused input (terminal inputs).
- [ ] Hover-only affordances have a tap equivalent.

Content and clutter
- [ ] Technical HUD, side labels, scroll rails and dense microcopy are hidden on phones.
- [ ] The hero has its own phone composition, not a scaled desktop; the primary CTA is reachable by thumb.
- [ ] Fixed elements (nav, dock, banners) never cover the headline or the CTA at any scroll position.

Performance and stability
- [ ] No console errors or warnings at any viewport.
- [ ] 3D/WebGL: point count and pixel ratio reduced on phones, fallback shown if WebGL fails or times out.
- [ ] Fonts loaded before measuring or drawing text to a canvas; no layout shift when they arrive.
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms on a throttled mobile profile.

Reduced motion and fallbacks
- [ ] `prefers-reduced-motion: reduce`: no animation runs; the final composed state shows the same content.
- [ ] JS disabled: all content visible, links work.
- [ ] No WebGL (or forced failure): the static hero appears and nothing is hidden behind the scene.
- [ ] Library failed to load (block the CDN URL): content still visible.

## Playwright CLI commands (interactive)

Install: `npm i -g @playwright/cli@latest`, then `playwright-cli install --skills` to give your agent the CLI's own skill.
Serve the site first (modules and fonts do not load over `file://`): `python -m http.server 5173` from the project folder, or the dev server.

```bash
mkdir -p .shots && playwright-cli open http://localhost:5173
playwright-cli resize 390 844
playwright-cli eval "() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth, height: document.documentElement.scrollHeight })"
playwright-cli mousewheel 0 211                    # one 0.25-viewport step at 844px height (844 x 0.25 = 211)
playwright-cli eval "() => scrollY"
playwright-cli screenshot --filename=.shots/390-step01.png
playwright-cli resize 360 780
playwright-cli screenshot --full-page --filename=.shots/360-full.png

for scheme in light dark; do
  playwright-cli set-color-scheme $scheme
  for size in "390 844" "768 1024" "1440 900"; do
    playwright-cli resize $size
    playwright-cli screenshot --full-page --filename=".shots/${scheme}-${size// /x}.png"
  done
done

playwright-cli set-reduced-motion reduce           # re-check: nothing may animate
playwright-cli console                             # no errors or warnings
playwright-cli close
```

Notes:
- Full-page screenshots do not show pinned or scrubbed states correctly. Use the scroll sweep for anything scroll-driven.
- `mousewheel` scrolls like a user (it triggers smooth-scroll libraries); `window.scrollTo` inside `eval` jumps instantly.
- Add `.shots/` and `.playwright-cli/` to `.gitignore`.
- On Windows a harmless libuv assertion may print when the CLI exits.

## Automated sweep script (headless Playwright)

For repeatable runs. Install Playwright in the project (`npm i -D playwright`; run `npx playwright install chromium` once, or set
`PW_CHANNEL=chrome` to use an installed Chrome instead of downloading a browser). It sweeps both phone viewports in 0.25-viewport steps,
saves a screenshot per step, checks `scrollWidth === innerWidth`, lists tap targets under 44px, and collects console errors.
It does not replace reading the screenshots.

```bash
# <skill-dir> = wherever your agent installed this skill (for example .agents/skills/web-wow, ~/.claude/skills/web-wow, ...)
node <skill-dir>/scripts/qa-sweep.mjs http://localhost:5173/ .shots            # normal pass
node <skill-dir>/scripts/qa-sweep.mjs http://localhost:5173/ .shots --reduced  # reduced-motion pass
PW_CHANNEL=chrome node <skill-dir>/scripts/qa-sweep.mjs http://localhost:5173/ .shots --wait=5000   # installed Chrome, longer intro wait
```

The script lives next to this file in the skill: `scripts/qa-sweep.mjs` (run it by its full path, from the project you are testing, so it finds that project's `playwright`).
It prints `PROBLEM:` lines and exits 1 when it finds any. Use `node <skill-dir>/scripts/qa-sweep.mjs --help` for usage.

Tips:
- Raise `--wait` for long intros or preloaders; the sweep scrolls only after that delay.
- Scrubbed timelines need time to settle after `scrollTo`; the script waits 450ms per step. Raise it for heavy WebGL scenes.
- Headless Chromium may need software WebGL for 3D pages; the script passes `--enable-unsafe-swiftshader`. Expect low frame rates there:
  judge composition from the screenshots, and measure real performance on a real device or with Lighthouse.
- A smooth-scroll library (Lenis) listens to native scroll events, so `scrollTo` works. If your site blocks programmatic scroll during an intro,
  wait for it to end (`--wait`).
- When a problem appears only at one scroll step, note the step number: the PNG name encodes it (`390x844-004.png` is step 4, about one viewport down).

## Exit criteria

Both phone viewports clean at every step, no console errors, reduced-motion pass shows no animation and the same content, fallbacks verified,
and a human has looked at every screenshot of the hero, the signature moments and the CTA. If you did not open some PNGs (for example the second phone
or the reduced-motion sweep), say exactly which ones in the report instead of implying full coverage. Also shoot the transition windows of any scroll scene
(just before and just after a state change), because labels and captions that fade in late look broken there while the end states look fine.
