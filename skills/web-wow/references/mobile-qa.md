# Mobile and reduced-motion QA

Mobile is where "prototype that wows on a laptop" turns into "site that wows". Budget real time for this loop.
Sources of truth: headless Playwright screenshots and DOM measurements. Do not rely on a hidden or background preview pane:
`requestAnimationFrame` may not run there, so animated or WebGL pages can look blank or frozen while being fine in a real browser.

## The loop

```
serve -> sweep screenshots (2 phones) -> READ every PNG -> fix -> re-sweep -> reduced-motion pass -> no-JS / no-WebGL pass -> done
```

Read each image with your image-reading tool. A script cannot tell you a headline is half-clipped.

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
node qa-sweep.mjs http://localhost:5173/ .shots            # normal pass
node qa-sweep.mjs http://localhost:5173/ .shots --reduced  # reduced-motion pass
PW_CHANNEL=chrome node qa-sweep.mjs http://localhost:5173/ .shots --wait=5000   # installed Chrome, longer intro wait
```

```js
// qa-sweep.mjs: headless mobile sweep. Usage: node qa-sweep.mjs <url> [outDir] [--reduced] [--wait=3000]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v = 'true'] = a.slice(2).split('='); return [k, v]; }));
const [url = 'http://localhost:8080/', outDir = '.shots'] = args.filter(a => !a.startsWith('--'));
const reduced = 'reduced' in flags;
const introWait = Number(flags.wait ?? 3000);                       // let preloaders/intros finish
const viewports = [{ name: '390x844', width: 390, height: 844 }, { name: '360x780', width: 360, height: 780 }];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });   // software WebGL in headless
let problems = 0;
const report = msg => { problems++; console.log('  PROBLEM: ' + msg); };

for (const vp of viewports) {
  console.log(`\n== ${vp.name}${reduced ? ' (reduced motion)' : ''} ==`);
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const messages = [];
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) messages.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', e => messages.push(`pageerror: ${e.message}`));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(introWait);

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(vp.height * 0.25);
  let i = 0;
  for (let y = 0; y <= Math.max(0, total - vp.height); y += step, i++) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await page.waitForTimeout(450);                                  // let scrubbed timelines settle
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, y: Math.round(scrollY) }));
    if (m.sw !== m.iw) report(`horizontal overflow at y=${m.y}: scrollWidth ${m.sw} != innerWidth ${m.iw}`);
    await page.screenshot({ path: `${outDir}/${vp.name}${reduced ? '-reduced' : ''}-${String(i).padStart(3, '0')}.png` });
  }

  const small = await page.evaluate(() => [...document.querySelectorAll('a[href], button, input, select, textarea, [role="button"], summary')]
    .filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; })
    .filter(el => { const r = el.getBoundingClientRect(); return r.width < 44 || r.height < 44; })
    .map(el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`));
  small.slice(0, 15).forEach(s => report(`tap target under 44px: ${s}`));

  messages.forEach(m => report(`console ${m}`));
  console.log(`  ${i} screenshots in ${outDir}, page height ${total}px`);
  await ctx.close();
}
await browser.close();
console.log(problems ? `\n${problems} problem(s). Read every PNG, fix, re-run.` : '\nNo automated problems. Still read every PNG.');
process.exit(problems ? 1 : 0);
```

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
and a human has looked at every screenshot of the hero, the signature moments and the CTA.
