// qa-sweep.mjs: headless mobile sweep for the web-wow skill.
// Usage: node <path-to-this-file> <url> [outDir] [--reduced] [--wait=3000]
// Needs `playwright` installed in the CURRENT project (npm i -D playwright). Set PW_CHANNEL=chrome to use an installed Chrome
// instead of Playwright's own Chromium download. Works the same from any agent: it only needs a shell.
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

if (process.argv.includes('--help') || process.argv.length < 3) {
  console.log('Usage: node qa-sweep.mjs <url> [outDir] [--reduced] [--wait=3000]\nEnv: PW_CHANNEL=chrome to use the installed Chrome.');
  process.exit(process.argv.includes('--help') ? 0 : 2);
}
// Resolve playwright from the project you run this in, not from the folder this script was installed in.
let chromium;
try { ({ chromium } = createRequire(process.cwd() + '/')('playwright')); }
catch { console.error('playwright not found in ' + process.cwd() + '. Run: npm i -D playwright (then npx playwright install chromium, or set PW_CHANNEL=chrome)'); process.exit(2); }

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
  await page.goto(url, { waitUntil: 'load' });                       // 'networkidle' can hang on pages with live requests
  await page.waitForTimeout(introWait);

  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(vp.height * 0.25);
  let i = 0;
  for (let y = 0; y <= Math.max(0, total - vp.height); y += step, i++) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await page.waitForTimeout(450);                                  // let scrubbed timelines settle
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, y: Math.round(scrollY) }));
    // On a mobile context an overflowing page WIDENS the layout viewport, so scrollWidth === innerWidth can still hide the bug: compare against the configured width too.
    if (m.sw !== m.iw || m.iw !== vp.width) {
      const culprits = await page.evaluate(w => [...document.querySelectorAll('body *')]
        .filter(el => el.getBoundingClientRect().right > w + 1 && getComputedStyle(el).position !== 'fixed')
        .slice(0, 5).map(el => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}`), vp.width);
      report(`horizontal overflow at y=${m.y}: scrollWidth ${m.sw}, innerWidth ${m.iw}, expected ${vp.width}; wide elements: ${culprits.join(', ') || 'none found (check ::before/::after)'}`);
    }
    await page.screenshot({ path: `${outDir}/${vp.name}${reduced ? '-reduced' : ''}-${String(i).padStart(3, '0')}.png` });
  }

  const small = await page.evaluate(() => [...document.querySelectorAll('a[href], button, input, select, textarea, [role="button"], summary')]
    .filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; })
    .filter(el => !(getComputedStyle(el).display === 'inline' && el.closest('p, li, dd, blockquote')))   // inline text links are exempt (WCAG 2.2 target size)
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
