# Workflow: from brand to a reviewed preview link

Nine steps (0 to 8). Steps 3 and 4 are where the method differs from "just build a site": you commission several
directions in parallel, the user compares real prototypes, and only then do you build one for real.

```
0 Intake -> 1 DESIGN.md -> 2 Choose 3 directions -> 3 Parallel prototypes -> 4 User picks/combines
          -> 5 Build -> 6 Mobile QA loop -> 7 Audit -> 8 Preview (noindex)
```

## 0. Intake

Ask only for what is missing. Write the answers into the brief placeholders (see `concept-briefs.md`).

| Item | Why it matters | Default if unknown |
|---|---|---|
| Brand name and handle | Wordmark, title, meta | Ask |
| Audience and where they arrive from | Phone-first or desktop-first | Assume phones from social links |
| One-sentence offer | Headline and meta description | Ask, never invent |
| The single CTA | Every direction ends on it | Ask (call, form, message) |
| Palette, fonts | `DESIGN.md` tokens | Propose one accent on a near-black or paper background; ask to confirm |
| Logo as outlined SVG paths | Required by direction A (particles) and useful everywhere | Wordmark only |
| Languages | Copy scope, `lang` attribute | One language |
| What is real vs simulated | Honesty rule | Everything dynamic is labeled a simulation |
| Hard constraints (no photos, no sound, no 3D) | Filters the directions | None |

## 1. DESIGN.md first

Nothing visual happens before the brand is written down. Create `DESIGN.md` from `design-md-template.md` (or read the existing
one). Sub-agents have no memory, so the file is both the source of truth and the thing you paste into every brief.
If the user has only a logo and a mood, draft the file and ask them to confirm color, tone and fonts in one message.

## 2. Choose three directions

Pick three from `concept-briefs.md` that are visibly different from each other: different layout model, different dominant
technique, different feeling. A good default trio is A (immersive 3D), B (OS experience) and C (editorial giant). Swap in D
(liquid/shader gradient), E (scroll-told case study) or F (product as hero) when the brand fits better. Drop any direction
that violates a hard constraint (for example B if the user dislikes interfaces that imitate software).

## 3. Parallel prototypes (one sub-agent each)

Launch one sub-agent per direction, concurrently, each with its own isolated folder. Single writer per folder.

```
project/
  DESIGN.md
  concepts/
    index.html            chooser page (noindex), written by you, not by the sub-agents
    vercel.json           X-Robots-Tag: noindex header (see step 8)
    a-<slug>/index.html
    b-<slug>/index.html
    c-<slug>/index.html
```

Each sub-agent prompt must be self-contained. Include, in this order:

1. Role and goal: "Build one single-file prototype of direction X for {BRAND}. Output only inside `concepts/<folder>/`."
2. The filled brief from `concept-briefs.md` (not a link: paste it).
3. The full `DESIGN.md` text (not a path: the agent starts with an empty context).
4. The shared constraints block from `concept-briefs.md` (performance, accessibility, honesty, fallbacks).
5. Library policy: exact pinned versions from `libraries.md`, loaded from a CDN for prototypes only.
6. Self-QA requirement: test at 390x844 and 360x780 with headless Playwright, sweep scroll, report `scrollWidth`, and attach
   the list of screenshots reviewed. Point it at `mobile-qa.md`.
7. Return format: file path, 5-line summary, techniques used by name, known limitations, open `TODO`s.
8. Forbidden: touching other folders, adding build tooling, inventing statistics or logos, fetching content from other sites.

Rules for the orchestrator:
- Do not let two agents edit the same file. If you must share a token file, copy it into each folder.
- Do not hand an agent your conclusion ("make it look like X is best"). Hand it the brief and let it design.
- If delegation is unavailable, build the directions sequentially in the same isolated folders and say so in the report.
- Prototype scope is "one hero moment plus enough page to judge it" (4 to 6 sections). Depth comes after the choice.

Write the chooser page yourself: one card per direction, a one-line description, link to each folder, a note that the
prototypes are in progress and contact buttons are not wired. Add `<meta name="robots" content="noindex, nofollow">`.

## 4. User picks or combines

Open the three prototypes on desktop and on a phone-sized viewport and send the links. Ask two questions only:
which one, and what is the one thing from another direction worth borrowing. Record the decision in `DESIGN.md`
under a "Decision log" heading: chosen direction, borrowed moment, rejected ideas and why. Rule of thumb: one primary direction
plus at most one borrowed signature moment. More than that produces a site that shouts three things at once.

## 5. Build

- Structure: static HTML/CSS/JS, Astro or Vite. A prototype folder becomes `src/`; do not ship the CDN script tags.
- Dependencies: install the pinned versions from npm, bundle them, add SRI if a CDN is unavoidable. Lazy-load Three.js with
  dynamic `import()` after first paint.
- Fonts: self-host (`geist` package, fontsource, or files in `/fonts`) with `font-display: swap` and metric fallbacks.
- Copy: real, specific, in the brand voice. No lorem, no placeholder claims. Contact links stay `TODO` until provided.
- Accessibility: semantic landmarks, visible focus ring, labels on fields, one `h1`, keyboard path for every gesture,
  reduced-motion branch, `aria-hidden` on decorative layers, live regions for simulated terminals or monitors.
- Fallbacks: no-JS shows the full static content, no-WebGL and reduced-motion show a static hero, and a library load failure
  never leaves content hidden (use a `.js`/`.motion` class added only after libraries load).
- Finishing touches: favicon, `theme-color`, OG image, 404, text selection color, `lang`, social meta, `robots`.

## 6. Mobile QA loop

Full checklist and commands in `mobile-qa.md`. Loop: screenshot sweep -> read every PNG -> fix -> re-shoot, until
390x844 and 360x780 are clean at every scroll step, and the reduced-motion pass shows no animation.
Budget real time for this step. It is where "prototype that looks great on a laptop" becomes "site that looks great".

## 7. Audit

1. `principles.md` checklist: the twelve tests, the anti-pattern list.
2. A UI guidelines audit (for example Vercel `web-design-guidelines`) on the changed files, if installed.
3. Lighthouse on mobile, target LCP < 2.5s, CLS < 0.1, INP < 200ms; fix before adding more effects.
4. Reduced-motion and no-JS pass.
5. Optional: a diff review for slop (Thermos/deslop, anti-slop) before any commit.

## 8. Preview link with noindex

Preview links are for review, not for search engines.

```html
<meta name="robots" content="noindex, nofollow">
```

```json
{
  "headers": [
    { "source": "/(.*)", "headers": [ { "key": "X-Robots-Tag", "value": "noindex, nofollow" } ] }
  ]
}
```

The JSON is a `vercel.json` header rule; other hosts have an equivalent (Netlify `_headers`, Cloudflare Pages `_headers`).
Deploy only when the user asks. Some hosts put previews behind a login by default (for example deployment protection);
if the reviewer cannot open the link, tell the user and let them decide how to expose it. Remove `noindex` only when the
user confirms the site is final.

## Definition of done

- The chosen direction runs without console errors at 390x844, 360x780 and 1440x900.
- Every scroll position, sampled in 0.25-viewport steps on a phone, looks intentional.
- Reduced motion shows the same content with no animation; no-WebGL shows the static hero.
- No invented claims. Every simulation is labeled. Every placeholder is listed in the report.
- The user has a link and a short list of what is still open.
