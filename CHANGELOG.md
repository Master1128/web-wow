# Changelog

Versions follow `metadata.version` in `skills/web-wow/SKILL.md`. This fork builds on `RafChn/web-wow` (1.0, Rafael Chacón, MIT).

## 1.2.0 (2026-10-16)

Multi-agent compatibility and fixes found by building all six directions (A to F) with a fictional brand.

- Added: `scripts/qa-sweep.mjs`, the headless mobile sweep as a runnable file (resolves `playwright` from the project it runs in). It replaces the inline copy in `mobile-qa.md`.
- Added: "Agent portability" in `SKILL.md` (no delegation, no image viewing, no shell) and `compatibility` in the frontmatter.
- Added: `AGENTS.md` for agents without skills support, and install instructions for many agents (the `skills` CLI and `.agents/skills/` paths).
- Changed: "sub-agent" now means any isolated worker (sub-agent, background task or separate session); briefs can be saved as `BRIEF.md`.
- Fixed (QA): the sweep now detects horizontal overflow on a mobile viewport, where an overflowing page widens the layout viewport and `scrollWidth === innerWidth` hides the bug. It also names the wide elements.
- Fixed (recipes): the global reduced-motion rule used `transition-duration: 0.01ms`, which breaks fitted-type measurement; it is now `transition: none`.
- Fixed (recipes): `gsap.matchMedia()` callbacks did not run on phones with reduced motion; a `reduce` condition is now documented.
- Documented: fitted-type gotchas (negative margins collapsing, commas and Q touching the next line), `PW_CHANNEL=chrome` as a prerequisite, checking scroll-transition windows, and reporting which screenshots were not read.
- Added a decision gate: asking for "all the options" means six sub-agents, so state the count and cost first.

## 1.1.0 (2026-10-13)

- Fixed the Lenis rule (Lenis is the accepted exception for the wheel; keys, snap and touch stay native).
- Added a 3 s failsafe (`data-ready`) so content hidden until JS reveals it never stays hidden if a bundle fails.
- Clarified the `clip-path` rule (one wipe or the single boot reveal), added a cost gate before launching three sub-agents, and made the QA script ignore inline text links and avoid `networkidle`.

## 1.0.0 (2026-10-11)

Original release by Rafael Chacón: https://github.com/RafChn/web-wow
