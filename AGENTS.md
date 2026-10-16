# AGENTS.md

This file is for any AI coding agent (it follows the `AGENTS.md` convention, so it is not tied to one vendor).

## If the user asks for an impressive website

Typical asks: "web de $10K", "landing que impresione", "wow website", "Awwwards-level", "give me 3 options for my site".

1. Read `skills/web-wow/SKILL.md` and follow its workflow (DESIGN.md first, parallel prototypes, user chooses, build, mobile QA, noindex preview).
2. Load files from `skills/web-wow/references/` only when the workflow points to them. `skills/web-wow/scripts/qa-sweep.mjs` is the headless mobile sweep.
3. If you cannot delegate to sub-agents, build the directions one after another. If you cannot view images, say so and ask the user to check on a phone. Details: "Agent portability" in `SKILL.md`.

If your agent supports Agent Skills natively, install `skills/web-wow/` instead (see `README.md`) and ignore this section.

## If you are editing this repository

- Keep the skill vendor-neutral: no agent-specific tool names in `SKILL.md` or `references/` (say "read a file", "run a command", "view an image").
- `SKILL.md` frontmatter must follow https://agentskills.io/specification: `name` equals the folder name (`web-wow`), `description` up to 1024 characters, `compatibility` up to 500. Keep `SKILL.md` under 500 lines.
- Do not vendor third-party code or assets. Library versions in `skills/web-wow/references/libraries.md` are re-checked with `npm view <pkg> version` before changing them.
- After editing `scripts/qa-sweep.mjs`, run `node --check` on it and one real sweep against a local page.
- Add an entry to `CHANGELOG.md` for every change that alters skill behavior.
