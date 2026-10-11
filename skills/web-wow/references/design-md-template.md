# DESIGN.md template

`DESIGN.md` is the brand contract for the site. It lives at the project root, every direction reads it, and it is pasted
into every sub-agent brief because sub-agents start with no memory. Keep it short enough to paste (about 150 lines),
specific enough that two designers would make the same call.

Rules for filling it:
- Tokens are CSS variables with semantic names (`--accent`), never raw hex in component rules.
- Every color has a role. If a color has no role, delete it.
- Ask the user only for what is unknown: accent, tone, fonts. Propose the rest.
- The "Agent Prompt Guide" section is what you paste into a brief when you do not have room for the whole file.

---

## Skeleton (copy from here)

```markdown
# DESIGN.md: {BRAND}

## 1. Visual Theme
One paragraph: what the brand feels like and what it must never feel like. Three adjectives, three anti-adjectives.
Reference points (sites or objects), and what is taken from each.

## 2. Color Palette & Roles
| Token | Hex | Role |
|---|---|---|
| --bg | #______ | Page background |
| --surface | #______ | Panels, windows, cards |
| --line | #______ | Hairlines and borders |
| --line-strong | #______ | Hover borders, dividers that must be seen |
| --text | #______ | Primary text (contrast >= 7:1 on --bg) |
| --muted | #______ | Secondary text (>= 4.5:1) |
| --subtle | #______ | Metadata, disabled (large text only) |
| --accent | #______ | THE accent. Calls to action, one highlighted word, active state |
| --on-accent | #______ | Text on accent (>= 4.5:1) |
| --accent-text | #______ | Accent used as text on --bg (check contrast) |
| --success / --warning / --danger | #______ | Verdicts only, never decoration |
Rules: accent covers < 5% of any viewport. No second hue. Gradients only if the brand already uses them.

## 3. Typography
- Display: {family}, weights, tracking (tight, around -0.03em at large sizes), line-height 0.9 to 1.05 for giant type.
- Body: {family}, 16-18px, line-height 1.5-1.6, max 60-70ch.
- Mono: {family} for labels, status, data, eyebrows (uppercase, 11-12px, tracking +0.08em).
- Scale (fluid with clamp): hero, h2, h3, body, caption.
- Fonts are self-hosted. `font-display: swap`. Provide a metric-matched fallback stack.

## 4. Component Stylings
Buttons (primary, secondary, text), links, inputs (labels always visible), cards/panels (radius, border, no stacked shadows),
nav, tags, windows/terminal (if used). State matrix for each: default, hover, focus-visible, active, disabled.

## 5. Layout
Grid and gutters, max width, section rhythm, spacing scale (4/8-based), hairline usage, corner/registration marks (if any).

## 6. Depth
Shadows, blur, grain, vignette. One recipe, reused. State where depth is NOT used.

## 7. Motion
Easing tokens (expo-out for entrances, in-out for transitions), durations (120 / 200 / 320 ms UI; 700-1200 ms hero),
the named signature moments, reduced-motion behavior, the maximum number of effects per page.

## 8. Do's and Don'ts
Do: ...   Don't: ... (include the project-specific bans: copy tone, imagery, forbidden effects)

## 9. Responsive
Breakpoints (e.g. 900 for layout, 820 for OS-style, 640 for phone), what changes at each (not just "stacks"),
touch targets >= 44px, safe-area handling, what is hidden on phones (technical HUD, side labels).

## 10. Agent Prompt Guide
Paste-ready summary (10 lines): palette tokens, fonts, tone of voice, the accent rule, the motion budget,
the bans, the language, the single CTA. This block goes into every sub-agent brief.

## 11. Decision log (added after the user chooses)
Chosen direction, borrowed moment, rejected ideas and why.
```

---

## Example (filled): a real brand, shown only as an illustration

> Example credit: brand of Rafael Chacón (@rafchn): near-black warm background `#121010`, coral accent `#FF6B3D`, Geist.
> Everything below is an illustration of how to fill the skeleton, not a recommendation to copy.

```markdown
# DESIGN.md: EXAMPLE (terminal / blueprint personal brand)

## 1. Visual Theme
Dark, warm, technical. A terminal that has taste: monospace labels, hairlines, registration marks, a block cursor `▌` as a motif.
Feels like: a precise tool made by one person. Never: purple gradients, stock robots, corporate blue, glassmorphism stacks.

## 2. Color Palette & Roles
| Token | Hex | Role |
|---|---|---|
| --bg | #121010 | Page background |
| --surface | #1A1716 | Panels, windows |
| --line | #2E2826 | Hairlines |
| --line-strong | #3D3532 | Hover borders |
| --text | #F6F2F0 | Primary text |
| --muted | #A8A09B | Secondary text |
| --subtle | #6F6763 | Metadata |
| --accent | #FF6B3D | Coral accent: CTA, one highlighted word, active states |
| --accent-text | #FF7A50 | Accent as text on --bg |
| --on-accent | #2A0F05 | Text on coral |
Rules: one accent. Coral under 5% of the surface, except one full-bleed band allowed in direction C.

## 3. Typography
Display and body: Geist (700-800 for display, tracking -0.03em). Mono: Geist Mono for labels, status and data
(uppercase, 12px, +0.08em).

## 4-6. Components, Layout, Depth
Pill buttons, hairline sections, 14px radius panels, grain overlay at 7% opacity, vignette. No stacked shadows.

## 7. Motion
expo-out entrances (cubic-bezier(.16,1,.3,1)), 320ms UI, 700-1200ms hero. One signature moment per section.
Reduced motion renders the final composed state.

## 8. Do's and Don'ts
Do: `>` prefixes in mono labels, `▌` as cursor motif, specific copy. Don't: em dashes in visible copy, fake client logos.

## 9. Responsive
Layout flips at 900px; OS-style desktop flips at 820px; phone HUD and side labels hidden; targets >= 44px.

## 10. Agent Prompt Guide
Dark warm bg, coral accent only, Geist + Geist Mono, terminal motif, honest simulations, one CTA (book a call).
```
